from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.configuration import InvoiceConfiguration, FreightConfiguration
from app.services.pdf_generator import generate_invoice_pdf, generate_delivery_ticket_pdf, generate_freight_invoice_pdf

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
    filename = generate_invoice_pdf(config, config_id)
    return {"message": "Invoice generated!", "file": filename}

@router.post("/generate-delivery-ticket/{config_id}")
def generate_delivery_ticket(config_id: int, db: Session = Depends(get_db)):
    config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
    if not config:
        return {"error": "Configuration not found"}
    filename = generate_delivery_ticket_pdf(config, config_id)
    return {"message": "Delivery ticket generated!", "file": filename}

@router.post("/generate-freight-invoice/{config_id}")
def generate_freight_invoice(config_id: int, db: Session = Depends(get_db)):
    config = db.query(FreightConfiguration).filter(FreightConfiguration.id == config_id).first()
    if not config:
        return {"error": "Configuration not found"}
    filename = generate_freight_invoice_pdf(config, config_id)
    return {"message": "Freight invoice generated!", "file": filename}

@router.get("/download/{filename}")
def download_document(filename: str):
    return FileResponse(
        path=f"generated_documents/{filename}",
        filename=filename,
        media_type="application/pdf"
    )

@router.get("/list")
def list_documents():
    import os
    files = os.listdir("generated_documents") if os.path.exists("generated_documents") else []
    return {"documents": files}