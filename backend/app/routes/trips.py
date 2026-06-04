from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.database import SessionLocal
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripResponse

router = APIRouter()

SECRET_KEY = "trip-summary-secret-key"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/trips", response_model=TripResponse)
def create_trip(trip: TripCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    new_trip = Trip(**trip.dict())
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip

@router.get("/trips", response_model=list[TripResponse])
def get_trips(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(Trip).all()

@router.get("/trips/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(Trip).filter(Trip.id == trip_id).first()

@router.put("/trips/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, trip: TripCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
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
def delete_trip(trip_id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully"}