import os
import secrets
import logging
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from google_auth_oauthlib.flow import Flow

logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

def get_flow() -> Flow:
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [GOOGLE_REDIRECT_URI],
        }
    }
    flow = Flow.from_client_config(client_config, scopes=SCOPES, redirect_uri=GOOGLE_REDIRECT_URI)
    return flow


def generate_auth_url() -> tuple[str, str]:
    """Returns (authorization_url, state)."""
    flow = get_flow()
    state = secrets.token_urlsafe(32)
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        state=state,
        prompt="consent",  # Forces refresh token to be returned every time
        include_granted_scopes="true",
    )
    logger.info("Generated Google OAuth authorization URL")
    return auth_url, state


def exchange_code(code: str) -> dict:
    """Exchange authorization code for tokens. Returns token dict."""
    flow = get_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials

    # Verify the ID token and extract user info
    id_info = id_token.verify_oauth2_token(
        credentials.id_token,
        google_requests.Request(),
        GOOGLE_CLIENT_ID,
        clock_skew_in_seconds=10,
    )

    logger.info(f"Google OAuth token exchanged for user: {id_info.get('email')}")

    return {
        "google_id": id_info["sub"],
        "email": id_info["email"],
        "name": id_info.get("name", ""),
        "picture": id_info.get("picture", ""),
        "refresh_token": credentials.refresh_token,
        "access_token": credentials.token,
    }


def refresh_google_token(refresh_token: str) -> str | None:
    """Use a stored refresh token to get a new Google access token."""
    import google.oauth2.credentials
    import google.auth.transport.requests

    try:
        creds = google.oauth2.credentials.Credentials(
            token=None,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
        )
        request = google.auth.transport.requests.Request()
        creds.refresh(request)
        logger.info("Google access token refreshed successfully")
        return creds.token
    except Exception as e:
        logger.error(f"Failed to refresh Google token: {e}")
        return None
