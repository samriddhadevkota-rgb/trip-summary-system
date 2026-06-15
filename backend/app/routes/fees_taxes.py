from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.deps import get_db, get_current_user
from app.models.fee_tax import Fee, Tax

router = APIRouter()

class FeeCreate(BaseModel):
    name: str
    default_rate: float

class TaxCreate(BaseModel):
    name: str
    percentage: float

@router.post("/fees")
def create_fee(fee: FeeCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_fee = Fee(**fee.dict())
    db.add(db_fee)
    db.commit()
    db.refresh(db_fee)
    return db_fee

@router.get("/fees")
def get_fees(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(Fee).all()

@router.put("/fees/{id}")
def update_fee(id: int, fee: FeeCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_fee = db.query(Fee).filter(Fee.id == id).first()
    if not db_fee:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in fee.dict().items():
        setattr(db_fee, key, value)
    db.commit()
    db.refresh(db_fee)
    return db_fee

@router.delete("/fees/{id}")
def delete_fee(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_fee = db.query(Fee).filter(Fee.id == id).first()
    if not db_fee:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(db_fee)
    db.commit()
    return {"message": "Deleted"}

@router.post("/taxes")
def create_tax(tax: TaxCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_tax = Tax(**tax.dict())
    db.add(db_tax)
    db.commit()
    db.refresh(db_tax)
    return db_tax

@router.get("/taxes")
def get_taxes(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    return db.query(Tax).all()

@router.put("/taxes/{id}")
def update_tax(id: int, tax: TaxCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_tax = db.query(Tax).filter(Tax.id == id).first()
    if not db_tax:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in tax.dict().items():
        setattr(db_tax, key, value)
    db.commit()
    db.refresh(db_tax)
    return db_tax

@router.delete("/taxes/{id}")
def delete_tax(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_tax = db.query(Tax).filter(Tax.id == id).first()
    if not db_tax:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(db_tax)
    db.commit()
    return {"message": "Deleted"}
