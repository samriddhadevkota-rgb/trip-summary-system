from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.deps import get_db, get_current_user
from app.models.customer import Customer, ShipTo

router = APIRouter(prefix="/customers", tags=["customers"])

class CustomerCreate(BaseModel):
    name: str
    billing_address: str
    email: str
    phone: Optional[str] = None

class ShipToCreate(BaseModel):
    customer_id: int
    name: str
    address: str

@router.post("")
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_customer = Customer(**customer.dict(), owner=current_user)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("")
def get_customers(search: Optional[str] = Query(None), db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    q = db.query(Customer).filter(Customer.owner == current_user)
    if search:
        q = q.filter(Customer.name.ilike(f"%{search}%") | Customer.email.ilike(f"%{search}%"))
    return q.order_by(Customer.name).all()

@router.get("/{id}")
def get_customer(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    c = db.query(Customer).filter(Customer.id == id, Customer.owner == current_user).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return c

@router.put("/{id}")
def update_customer(id: int, customer: CustomerCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_customer = db.query(Customer).filter(Customer.id == id, Customer.owner == current_user).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in customer.dict().items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{id}")
def delete_customer(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_customer = db.query(Customer).filter(Customer.id == id, Customer.owner == current_user).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return {"message": "Deleted"}

@router.post("/ship-tos")
def create_shipto(shipto: ShipToCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_shipto = ShipTo(**shipto.dict())
    db.add(db_shipto)
    db.commit()
    db.refresh(db_shipto)
    return db_shipto

@router.get("/ship-tos/all")
def get_ship_tos(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    customers = db.query(Customer).filter(Customer.owner == current_user).all()
    customer_ids = [c.id for c in customers]
    return db.query(ShipTo).filter(ShipTo.customer_id.in_(customer_ids)).all()
