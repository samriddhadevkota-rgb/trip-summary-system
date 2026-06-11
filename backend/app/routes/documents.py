from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.configuration import InvoiceConfiguration, FreightConfiguration, GeneratedDocument, DocumentTemplate
from app.services.pdf_generator import generate_invoice_pdf, generate_delivery_ticket_pdf, generate_freight_invoice_pdf
import os


def _get_template(db, document_type):
    return db.query(DocumentTemplate).filter(DocumentTemplate.document_type == document_type).first()

router = APIRouter(prefix="/documents", tags=["documents"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/generate-invoice/{config_id}")
def generate_invoice(config_id: int, db: Session = Depends(get_db)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        return {"error": "Configuration not found"}
    template = _get_template(db, "invoice")
    filename = generate_invoice_pdf(config, config_id, db=db, template=template)
    record = GeneratedDocument(document_type="invoice", filename=filename, config_id=config_id)
    db.add(record)
    db.commit()
    return {"message": "Invoice generated!", "file": filename}


@router.post("/generate-delivery-ticket/{config_id}")
def generate_delivery_ticket(config_id: int, db: Session = Depends(get_db)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        return {"error": "Configuration not found"}
    template = _get_template(db, "delivery_ticket")
    filename = generate_delivery_ticket_pdf(config, config_id, db=db, template=template)
    record = GeneratedDocument(document_type="delivery_ticket", filename=filename, config_id=config_id)
    db.add(record)
    db.commit()
    return {"message": "Delivery ticket generated!", "file": filename}


@router.post("/generate-freight-invoice/{config_id}")
def generate_freight_invoice(config_id: int, db: Session = Depends(get_db)):
    config = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not config:
        return {"error": "Configuration not found"}
    template = _get_template(db, "freight_invoice")
    filename = generate_freight_invoice_pdf(config, config_id, db=db, template=template)
    record = GeneratedDocument(document_type="freight_invoice", filename=filename, config_id=config_id)
    db.add(record)
    db.commit()
    return {"message": "Freight invoice generated!", "file": filename}


@router.get("/list")
def list_documents(db: Session = Depends(get_db)):
    records = db.query(GeneratedDocument).order_by(GeneratedDocument.generated_at.desc()).all()
    return [
        {
            "id": r.id,
            "document_type": r.document_type,
            "filename": os.path.basename(r.filename),
            "generated_at": r.generated_at,
            "email_sent": r.email_sent,
            "email_to": r.email_to,
        }
        for r in records
    ]


@router.get("/download/{filename}")
def download_document(filename: str):
    path = f"generated_documents/{filename}"
    if not os.path.exists(path):
        return {"error": "File not found"}
    return FileResponse(path=path, filename=filename, media_type="application/pdf")
