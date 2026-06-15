from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.deps import get_db, get_current_user
from app.models.vendor import Vendor

router = APIRouter(prefix="/vendors", tags=["vendors"])

class VendorCreate(BaseModel):
    name: str
    address: str
    email: str
    phone: Optional[str] = None

@router.post("")
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_vendor = Vendor(**vendor.dict())
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

@router.get("")
def get_vendors(search: Optional[str] = Query(None), db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    q = db.query(Vendor)
    if search:
        q = q.filter(Vendor.name.ilike(f"%{search}%") | Vendor.email.ilike(f"%{search}%"))
    return q.order_by(Vendor.name).all()

@router.get("/{id}")
def get_vendor(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    v = db.query(Vendor).filter(Vendor.id == id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return v

@router.put("/{id}")
def update_vendor(id: int, vendor: VendorCreate, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_vendor = db.query(Vendor).filter(Vendor.id == id).first()
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for key, value in vendor.dict().items():
        setattr(db_vendor, key, value)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor

@router.delete("/{id}")
def delete_vendor(id: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    db_vendor = db.query(Vendor).filter(Vendor.id == id).first()
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(db_vendor)
    db.commit()
    return {"message": "Deleted"}
