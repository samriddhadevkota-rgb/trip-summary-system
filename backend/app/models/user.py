from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)

    # Google OAuth fields
    google_id = Column(String, unique=True, nullable=True, index=True)
    google_refresh_token = Column(String, nullable=True)
    oauth_provider = Column(String, nullable=True)
    last_google_sync_at = Column(DateTime, nullable=True)
