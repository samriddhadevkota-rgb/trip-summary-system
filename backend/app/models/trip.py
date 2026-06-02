from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    driver_name = Column(String)
    total_gallons = Column(Float)
    total_stops = Column(Integer)
    status = Column(String)