from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.customer import Customer, ShipTo
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/customers", tags=["customers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CustomerCreate(BaseModel):
    name: str
    billing_address: str
    email: str

class ShipToCreate(BaseModel):
    customer_id: int
    name: str
    address: str

@router.post("")
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("")
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@router.get("/{id}")
def get_customer(id: int, db: Session = Depends(get_db)):
    return db.query(Customer).filter(Customer.id == id).first()

@router.put("/{id}")
def update_customer(id: int, customer: CustomerCreate, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == id).first()
    for key, value in customer.dict().items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{id}")
def delete_customer(id: int, db: Session = Depends(get_db)):
    db_customer = db.query(Customer).filter(Customer.id == id).first()
    db.delete(db_customer)
    db.commit()
    return {"message": "Deleted"}

@router.post("/ship-tos")
def create_shipto(shipto: ShipToCreate, db: Session = Depends(get_db)):
    db_shipto = ShipTo(**shipto.dict())
    db.add(db_shipto)
    db.commit()
    db.refresh(db_shipto)
    return db_shipto

@router.get("/ship-tos/all")
def get_ship_tos(db: Session = Depends(get_db)):
    return db.query(ShipTo).all()
