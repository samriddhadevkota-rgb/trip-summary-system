from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.deps import get_db, get_current_user
from app.models.trip import Trip

router = APIRouter(prefix="/trips", tags=["trips"])

class TripCreate(BaseModel):
    driver_name: str
    origin: Optional[str] = None
    destination: Optional[str] = None
    total_gallons: float = 0.0
    total_stops: int = 0
    revenue: float = 0.0
    status: str = "pending"
    notes: Optional[str] = None

class TripResponse(BaseModel):
    id: int
    driver_name: str
    origin: Optional[str]
    destination: Optional[str]
    total_gallons: float
    total_stops: int
    revenue: float
    status: str
    notes: Optional[str]

    class Config:
        from_attributes = True

@router.post("", response_model=TripResponse)
def create_trip(trip: TripCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    new_trip = Trip(**trip.dict(), owner=current_user)
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip

@router.get("", response_model=list[TripResponse])
def get_trips(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    q = db.query(Trip).filter(Trip.owner == current_user)
    if search:
        q = q.filter(Trip.driver_name.ilike(f"%{search}%") | Trip.origin.ilike(f"%{search}%") | Trip.destination.ilike(f"%{search}%"))
    if status:
        q = q.filter(Trip.status == status)
    trips = q.order_by(Trip.created_at.desc()).offset(skip).limit(limit).all()
    return trips

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.owner == current_user).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, trip: TripCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    existing = db.query(Trip).filter(Trip.id == trip_id, Trip.owner == current_user).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Trip not found")
    for key, value in trip.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.owner == current_user).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted"}
