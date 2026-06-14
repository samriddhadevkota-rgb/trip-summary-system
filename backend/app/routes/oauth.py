import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.routes.auth import create_access_token
from app.services.google_oauth import generate_auth_url, exchange_code, refresh_google_token
from app.services.encryption import encrypt_token, decrypt_token
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth/google", tags=["google-oauth"])

FRONTEND_URL = "http://localhost:5173"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/login")
def google_login():
    """Step 1: Generate Google OAuth URL and return it to the frontend."""
    try:
        auth_url, state = generate_auth_url()
        logger.info("Google login URL generated")
        return {"auth_url": auth_url, "state": state}
    except Exception as e:
        logger.error(f"Failed to generate Google auth URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate Google login")


@router.get("/callback")
def google_callback(code: str = None, state: str = None, error: str = None, db: Session = Depends(get_db)):
    """Step 2: Google redirects here with authorization code. Exchange for tokens."""
    if error:
        logger.warning(f"Google OAuth error: {error}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=google_denied")

    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=no_code")

    try:
        user_info = exchange_code(code)
    except Exception as e:
        logger.error(f"Token exchange failed: {e}")
        print(f"TOKEN EXCHANGE ERROR DETAIL: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=token_exchange_failed")

    # Find user by Google ID first, then by email
    user = db.query(User).filter(User.google_id == user_info["google_id"]).first()

    if not user:
        user = db.query(User).filter(User.email == user_info["email"]).first()

    if user:
        # Existing user — link Google account and update refresh token
        user.google_id = user_info["google_id"]
        user.oauth_provider = "google"
        user.last_google_sync_at = datetime.utcnow()
        if user_info.get("refresh_token"):
            user.google_refresh_token = encrypt_token(user_info["refresh_token"])
        logger.info(f"Existing user {user.email} logged in via Google")
    else:
        # New user — create account automatically
        email = user_info["email"]
        username = email.split("@")[0]
        # Make username unique if needed
        base_username = username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            username=username,
            email=email,
            hashed_password=None,
            google_id=user_info["google_id"],
            google_refresh_token=encrypt_token(user_info.get("refresh_token", "")),
            oauth_provider="google",
            last_google_sync_at=datetime.utcnow(),
        )
        db.add(user)
        logger.info(f"New user created via Google OAuth: {email}")

    db.commit()
    db.refresh(user)

    # Generate our app JWT token
    app_token = create_access_token(data={"sub": user.username})
    logger.info(f"App JWT issued for user: {user.username}")

    # Redirect frontend with token (never expose refresh token)
    return RedirectResponse(url=f"{FRONTEND_URL}/oauth-callback?token={app_token}")


class RefreshRequest(BaseModel):
    username: str


@router.post("/refresh-token")
def refresh_token(request: RefreshRequest, db: Session = Depends(get_db)):
    """Refresh Google access token using stored refresh token."""
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.google_refresh_token:
        raise HTTPException(status_code=400, detail="No Google refresh token stored for this user")

    decrypted = decrypt_token(user.google_refresh_token)
    new_access_token = refresh_google_token(decrypted)

    if not new_access_token:
        logger.error(f"Failed to refresh token for user: {user.username}")
        raise HTTPException(status_code=401, detail="Failed to refresh Google token — user may need to re-authenticate")

    user.last_google_sync_at = datetime.utcnow()
    db.commit()

    logger.info(f"Google token refreshed for user: {user.username}")
    return {"message": "Token refreshed", "google_access_token": new_access_token}
