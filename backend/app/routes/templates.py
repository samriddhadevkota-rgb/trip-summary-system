from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.configuration import DocumentTemplate
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/document-templates", tags=["templates"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class TemplateCreate(BaseModel):
    document_type: str
    show_logo: bool = True
    show_fees: bool = True
    show_taxes: bool = True
    show_due_date: bool = True
    show_delivery_date: bool = True
    show_customer_name: bool = True
    show_ship_to: bool = True
    show_vendor_address: bool = True
    show_product_category: bool = True
    show_delivery_timestamp: bool = True
    show_delivery_address: bool = True


@router.post("")
def create_template(template: TemplateCreate, db: Session = Depends(get_db)):
    db_template = DocumentTemplate(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.get("")
def get_templates(db: Session = Depends(get_db)):
    return db.query(DocumentTemplate).all()


@router.get("/{id}")
def get_template(id: int, db: Session = Depends(get_db)):
    return db.query(DocumentTemplate).filter(DocumentTemplate.id == id).first()


@router.put("/{id}")
def update_template(id: int, template: TemplateCreate, db: Session = Depends(get_db)):
    db_template = db.query(DocumentTemplate).filter(DocumentTemplate.id == id).first()
    if not db_template:
        return {"error": "Template not found"}
    for key, value in template.dict().items():
        setattr(db_template, key, value)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.delete("/{id}")
def delete_template(id: int, db: Session = Depends(get_db)):
    db_template = db.query(DocumentTemplate).filter(DocumentTemplate.id == id).first()
    if db_template:
        db.delete(db_template)
        db.commit()
    return {"message": "Deleted"}
