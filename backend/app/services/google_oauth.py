import os
import secrets
import logging
import requests as http_requests
from urllib.parse import urlencode
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()

logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback")

SCOPES = "openid email profile"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"


def generate_auth_url() -> tuple[str, str]:
    """Returns (authorization_url, state)."""
    state = secrets.token_urlsafe(32)
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",
        "state": state,
        "prompt": "consent",
    }
    auth_url = AUTH_URL + "?" + urlencode(params)
    logger.info("Generated Google OAuth authorization URL")
    return auth_url, state


def exchange_code(code: str) -> dict:
    """Exchange authorization code for tokens using direct HTTP POST (no PKCE)."""
    response = http_requests.post(TOKEN_URL, data={
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    })

    tokens = response.json()
    if "error" in tokens:
        raise Exception(f"Token error: {tokens['error']} - {tokens.get('error_description', '')}")

    # Verify ID token to get user info
    id_info = id_token.verify_oauth2_token(
        tokens["id_token"],
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
        "refresh_token": tokens.get("refresh_token"),
        "access_token": tokens.get("access_token"),
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
