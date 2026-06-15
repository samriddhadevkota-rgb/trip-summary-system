from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    email = Column(String)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    owner = Column(String, nullable=True, index=True)
