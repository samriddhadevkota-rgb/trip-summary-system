from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.fuel import Fuel
from app.schemas.fuel import FuelCreate, FuelResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/fuel", response_model=FuelResponse)
def create_fuel(fuel: FuelCreate, db: Session = Depends(get_db)):
    new_fuel = Fuel(**fuel.dict())
    db.add(new_fuel)
    db.commit()
    db.refresh(new_fuel)
    return new_fuel

@router.get("/fuel", response_model=list[FuelResponse])
def get_fuels(db: Session = Depends(get_db)):
    return db.query(Fuel).all()

@router.get("/fuel/{fuel_id}", response_model=FuelResponse)
def get_fuel(fuel_id: int, db: Session = Depends(get_db)):
    fuel = db.query(Fuel).filter(Fuel.id == fuel_id).first()
    if not fuel:
        raise HTTPException(status_code=404, detail="Fuel record not found")
    return fuel

@router.put("/fuel/{fuel_id}", response_model=FuelResponse)
def update_fuel(fuel_id: int, fuel: FuelCreate, db: Session = Depends(get_db)):
    existing_fuel = db.query(Fuel).filter(Fuel.id == fuel_id).first()
    if not existing_fuel:
        raise HTTPException(status_code=404, detail="Fuel record not found")
    existing_fuel.vehicle_number = fuel.vehicle_number