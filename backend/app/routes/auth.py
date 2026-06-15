from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User, PasswordResetToken
from app.schemas.user import UserCreate, UserResponse, Token
from app.services.email_service import send_email_with_attachment
from app.limiter import limiter
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import secrets

router = APIRouter()

SECRET_KEY = "trip-summary-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register", response_model=UserResponse)
@limiter.limit("5/minute")
def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.put("/change-password")
def change_password(username: str, old_password: str, new_password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(old_password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if user:
        token = secrets.token_urlsafe(32)
        expires = datetime.utcnow() + timedelta(hours=1)
        db.query(PasswordResetToken).filter(
            PasswordResetToken.email == email, PasswordResetToken.used == False
        ).delete()
        reset_token = PasswordResetToken(email=email, token=token, expires_at=expires)
        db.add(reset_token)
        db.commit()
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        body = f"""Hi {user.username},

You requested a password reset for your TripSync account.

Click the link below to reset your password (valid for 1 hour):
{reset_link}

If you didn't request this, ignore this email — your password won't change.

— TripSync Team"""
        try:
            send_email_with_attachment(
                to_email=email,
                subject="Reset your TripSync password",
                body=body,
                attachment_path=""
            )
        except Exception:
            pass
    return {"message": "If that email exists, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == False
    ).first()
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    if datetime.utcnow() > record.expires_at:
        raise HTTPException(status_code=400, detail="Reset link has expired")
    user = db.query(User).filter(User.email == record.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(new_password)
    record.used = True
    db.commit()
    return {"message": "Password reset successfully"}
