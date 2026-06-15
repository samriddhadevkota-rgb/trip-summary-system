from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.deps import get_db
from app.models.customer import Customer
from app.models.configuration import GeneratedDocument, InvoiceConfiguration
import os

router = APIRouter(prefix="/portal", tags=["portal"])

@router.get("/documents")
def portal_documents(email: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.email == email).first()
    if not customer:
        return []

    configs = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.customer_id == customer.id).all()
    config_ids = {c.id for c in configs}

    docs = db.query(GeneratedDocument).filter(GeneratedDocument.config_id.in_(config_ids)).order_by(GeneratedDocument.generated_at.desc()).all()

    return [
        {
            "id": d.id,
            "filename": os.path.basename(d.filename),
            "doc_type": d.document_type,
            "created_at": d.generated_at,
            "email_sent": d.email_sent,
        }
        for d in docs
    ]
