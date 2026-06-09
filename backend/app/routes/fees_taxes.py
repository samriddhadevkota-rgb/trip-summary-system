from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.fee_tax import Fee, Tax
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FeeCreate(BaseModel):
    name: str
    default_rate: float

class TaxCreate(BaseModel):
    name: str
    percentage: float

@router.post("/fees")
def create_fee(fee: FeeCreate, db: Session = Depends(get_db)):
    db_fee = Fee(**fee.dict())
    db.add(db_fee)
    db.commit()
    db.refresh(db_fee)
    return db_fee

@router.get("/fees")
def get_fees(db: Session = Depends(get_db)):
    return db.query(Fee).all()

@router.put("/fees/{id}")
def update_fee(id: int, fee: FeeCreate, db: Session = Depends(get_db)):
    db_fee = db.query(Fee).filter(Fee.id == id).first()
    for key, value in fee.dict().items():
        setattr(db_fee, key, value)
    db.commit()
    db.refresh(db_fee)
    return db_fee

@router.delete("/fees/{id}")
def delete_fee(id: int, db: Session = Depends(get_db)):
    db_fee = db.query(Fee).filter(Fee.id == id).first()
    db.delete(db_fee)
    db.commit()
    return {"message": "Deleted"}

@router.post("/taxes")
def create_tax(tax: TaxCreate, db: Session = Depends(get_db)):
    db_tax = Tax(**tax.dict())
    db.add(db_tax)
    db.commit()
    db.refresh(db_tax)
    return db_tax

@router.get("/taxes")
def get_taxes(db: Session = Depends(get_db)):
    return db.query(Tax).all()

@router.put("/taxes/{id}")
def update_tax(id: int, tax: TaxCreate, db: Session = Depends(get_db)):
    db_tax = db.query(Tax).filter(Tax.id == id).first()
    for key, value in tax.dict().items():
        setattr(db_tax, key, value)
    db.commit()
    db.refresh(db_tax)
    return db_tax

@router.delete("/taxes/{id}")
def delete_tax(id: int, db: Session = Depends(get_db)):
    db_tax = db.query(Tax).filter(Tax.id == id).first()
    db.delete(db_tax)
    db.commit()
    return {"message": "Deleted"}