from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.vendor import Vendor
from pydantic import BaseModel

router = APIRouter(prefix="/vendors", tags=["vendors"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class VendorCreate(BaseModel):
    name: str
    address: str
    email: str

@router.post("")
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    db_vendor = Vendor(**vendor.dict())
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

@router.get("")
def get_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()

@router.get("/{id}")
def get_vendor(id: int, db: Session = Depends(get_db)):
    return db.query(Vendor).filter(Vendor.id == id).first()

@router.put("/{id}")
def update_vendor(id: int, vendor: VendorCreate, db: Session = Depends(get_db)):
    db_vendor = db.query(Vendor).filter(Vendor.id == id).first()
    for key, value in vendor.dict().items():
        setattr(db_vendor, key, value)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

@router.delete("/{id}")
def delete_vendor(id: int, db: Session = Depends(get_db)):
    db_vendor = db.query(Vendor).filter(Vendor.id == id).first()
    db.delete(db_vendor)
    db.commit()
    return {"message": "Deleted"}
