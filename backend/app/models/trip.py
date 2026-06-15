from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    driver_name = Column(String, index=True)
    origin = Column(String, nullable=True)
    destination = Column(String, nullable=True)
    total_gallons = Column(Float, default=0.0)
    total_stops = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    status = Column(String, default="pending", index=True)
    notes = Column(Text, nullable=True)
    trip_date = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    owner = Column(String, nullable=True, index=True)
