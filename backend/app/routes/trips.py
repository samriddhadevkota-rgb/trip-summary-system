from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/trips", response_model=TripResponse)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    new_trip = Trip(**trip.dict())
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip

@router.get("/trips", response_model=list[TripResponse])
def get_trips(db: Session = Depends(get_db)):
    return db.query(Trip).all()

@router.get("/trips/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    return db.query(Trip).filter(Trip.id == trip_id).first()

@router.put("/trips/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, trip: TripCreate, db: Session = Depends(get_db)):
    existing_trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not existing_trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    existing_trip.driver_name = trip.driver_name
    existing_trip.total_gallons = trip.total_gallons
    existing_trip.total_stops = trip.total_stops
    existing_trip.status = trip.status
    db.commit()
    db.refresh(existing_trip)
    return existing_trip

@router.delete("/trips/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}