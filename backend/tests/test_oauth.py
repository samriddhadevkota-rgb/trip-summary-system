"""
Integration tests for Google OAuth 2.0 authentication flow.
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base
from app.models.user import User
from app.services.encryption import encrypt_token, decrypt_token

# ── Test DB (in-memory SQLite) ──────────────────────────────────────────────
TEST_DB_URL = "sqlite:///./test_oauth.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(bind=engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override every get_db in all routers with the test DB
from app.routes import oauth, auth, customers, vendors, products, configurations, documents, trips, fees_taxes, templates, settings, email_settings
for module in [oauth, auth, customers, vendors, products, configurations, documents, trips, fees_taxes, templates, settings, email_settings]:
    if hasattr(module, "get_db"):
        app.dependency_overrides[module.get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# ──────────────────────────────────────────────
# Encryption tests
# ──────────────────────────────────────────────

def test_encrypt_decrypt_roundtrip():
    """Encrypted token must decrypt back to original value."""
    original = "ya29.some-google-refresh-token-abc123"
    encrypted = encrypt_token(original)
    assert encrypted != original
    assert decrypt_token(encrypted) == original


def test_encrypt_empty_string():
    """Empty string should pass through unchanged."""
    assert encrypt_token("") == ""
    assert decrypt_token("") == ""


# ──────────────────────────────────────────────
# OAuth URL generation
# ──────────────────────────────────────────────

def test_google_login_returns_auth_url():
    """GET /auth/google/login must return an auth_url and state."""
    response = client.get("/auth/google/login")
    assert response.status_code == 200
    data = response.json()
    assert "auth_url" in data
    assert "state" in data
    assert "accounts.google.com" in data["auth_url"]
    assert len(data["state"]) > 10


def test_google_login_url_contains_required_params():
    """Auth URL must contain required OAuth params."""
    response = client.get("/auth/google/login")
    auth_url = response.json()["auth_url"]
    assert "response_type=code" in auth_url
    assert "access_type=offline" in auth_url
    assert "scope" in auth_url


# ──────────────────────────────────────────────
# OAuth callback — new user creation
# ──────────────────────────────────────────────

MOCK_USER_INFO = {
    "google_id": "google-uid-123",
    "email": "testuser@gmail.com",
    "name": "Test User",
    "picture": "https://example.com/photo.jpg",
    "refresh_token": "ya29.refresh-token-abc",
    "access_token": "ya29.access-token-xyz",
}


@patch("app.routes.oauth.exchange_code", return_value=MOCK_USER_INFO)
def test_callback_creates_new_user(mock_exchange):
    """First-time Google login must create a new user in the DB."""
    response = client.get(
        "/auth/google/callback?code=fake-code&state=fake-state",
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)
    location = response.headers["location"]
    assert "/oauth-callback" in location
    assert "token=" in location

    db = TestSessionLocal()
    user = db.query(User).filter(User.email == "testuser@gmail.com").first()
    assert user is not None
    assert user.google_id == "google-uid-123"
    assert user.oauth_provider == "google"
    assert user.google_refresh_token is not None
    # Refresh token must be stored encrypted (not plain text)
    assert user.google_refresh_token != "ya29.refresh-token-abc"
    db.close()


@patch("app.routes.oauth.exchange_code", return_value=MOCK_USER_INFO)
def test_callback_links_existing_user_by_email(mock_exchange):
    """Google login with existing email must link accounts, not create a duplicate."""
    db = TestSessionLocal()
    existing = User(username="testuser", email="testuser@gmail.com", hashed_password="hashed")
    db.add(existing)
    db.commit()
    db.close()

    response = client.get(
        "/auth/google/callback?code=fake-code&state=fake-state",
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)

    db = TestSessionLocal()
    users = db.query(User).filter(User.email == "testuser@gmail.com").all()
    assert len(users) == 1
    assert users[0].google_id == "google-uid-123"
    db.close()


@patch("app.routes.oauth.exchange_code", return_value=MOCK_USER_INFO)
def test_callback_jwt_token_issued(mock_exchange):
    """Callback must redirect with a valid JWT token in the URL."""
    response = client.get(
        "/auth/google/callback?code=fake-code&state=fake-state",
        follow_redirects=False,
    )
    location = response.headers["location"]
    assert "token=" in location
    token = location.split("token=")[1]
    assert len(token) > 20


# ──────────────────────────────────────────────
# OAuth callback — error scenarios
# ──────────────────────────────────────────────

def test_callback_user_denied_google():
    """If Google returns error=access_denied, redirect to login with error."""
    response = client.get(
        "/auth/google/callback?error=access_denied",
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)
    assert "error=google_denied" in response.headers["location"]


def test_callback_missing_code():
    """Callback with no code param must redirect with error."""
    response = client.get(
        "/auth/google/callback",
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)
    assert "error=no_code" in response.headers["location"]


@patch("app.routes.oauth.exchange_code", side_effect=Exception("invalid_grant"))
def test_callback_invalid_code(mock_exchange):
    """If token exchange fails, redirect with token_exchange_failed error."""
    response = client.get(
        "/auth/google/callback?code=expired-code&state=fake-state",
        follow_redirects=False,
    )
    assert response.status_code in (302, 307)
    assert "error=token_exchange_failed" in response.headers["location"]


# ──────────────────────────────────────────────
# Token refresh endpoint
# ──────────────────────────────────────────────

@patch("app.routes.oauth.refresh_google_token", return_value="ya29.new-access-token")
def test_refresh_token_success(mock_refresh):
    """POST /auth/google/refresh-token must return new Google access token."""
    db = TestSessionLocal()
    user = User(
        username="samri",
        email="samri@gmail.com",
        hashed_password="hashed",
        google_refresh_token=encrypt_token("ya29.stored-refresh-token"),
        oauth_provider="google",
    )
    db.add(user)
    db.commit()
    db.close()

    response = client.post("/auth/google/refresh-token", json={"username": "samri"})
    assert response.status_code == 200
    assert response.json()["google_access_token"] == "ya29.new-access-token"


def test_refresh_token_user_not_found():
    """Refresh for unknown user must return 404."""
    response = client.post("/auth/google/refresh-token", json={"username": "nobody"})
    assert response.status_code == 404


def test_refresh_token_no_token_stored():
    """Refresh for user with no stored refresh token must return 400."""
    db = TestSessionLocal()
    user = User(username="notoken", email="notoken@gmail.com", hashed_password="hashed")
    db.add(user)
    db.commit()
    db.close()

    response = client.post("/auth/google/refresh-token", json={"username": "notoken"})
    assert response.status_code == 400
