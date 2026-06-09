from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.configuration import InvoiceConfiguration, FreightConfiguration
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProductConfig(BaseModel):
    product_id: int
    quantity: float
    rate: float

class FeeConfig(BaseModel):
    fee_id: int
    quantity: float
    rate: float

class TaxConfig(BaseModel):
    tax_id: int

class InvoiceConfigCreate(BaseModel):
    customer_id: int
    shipto_id: int
    invoice_time: str
    products: List[ProductConfig]
    fees: List[FeeConfig]
    taxes: List[TaxConfig]

class CategoryConfig(BaseModel):
    category_id: int
    quantity: float
    freight_rate: float

class FreightFeeConfig(BaseModel):
    fee_id: int
    quantity: float
    rate: float

class FreightConfigCreate(BaseModel):
    vendor_id: int
    categories: List[CategoryConfig]
    fees: List[FreightFeeConfig]

@router.post("/invoice-configurations")
def create_invoice_config(config: InvoiceConfigCreate, db: Session = Depends(get_db)):
    db_config = InvoiceConfiguration(
        customer_id=config.customer_id,
        shipto_id=config.shipto_id,
        invoice_time=config.invoice_time,
        products=[p.dict() for p in config.products],
        fees=[f.dict() for f in config.fees],
        taxes=[t.dict() for t in config.taxes]
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@router.get("/invoice-configurations")
def get_invoice_configs(db: Session = Depends(get_db)):
    return db.query(InvoiceConfiguration).all()

@router.put("/invoice-configurations/{id}")
def update_invoice_config(id: int, config: InvoiceConfigCreate, db: Session = Depends(get_db)):
    db_config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == id).first()
    db_config.customer_id = config.customer_id
    db_config.shipto_id = config.shipto_id
    db_config.invoice_time = config.invoice_time
    db_config.products = [p.dict() for p in config.products]
    db_config.fees = [f.dict() for f in config.fees]
    db_config.taxes = [t.dict() for t in config.taxes]
    db.commit()
    db.refresh(db_config)
    return db_config

@router.post("/freight-configurations")
def create_freight_config(config: FreightConfigCreate, db: Session = Depends(get_db)):
    db_config = FreightConfiguration(
        vendor_id=config.vendor_id,
        categories=[c.dict() for c in config.categories],
        fees=[f.dict() for f in config.fees]
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@router.get("/freight-configurations")
def get_freight_configs(db: Session = Depends(get_db)):
    return db.query(FreightConfiguration).all()