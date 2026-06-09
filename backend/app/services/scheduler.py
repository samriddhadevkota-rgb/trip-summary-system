from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.models.configuration import InvoiceConfiguration, FreightConfiguration
from app.services.pdf_generator import generate_invoice_pdf, generate_delivery_ticket_pdf, generate_freight_invoice_pdf
from datetime import datetime

scheduler = BackgroundScheduler()

def generate_all_documents():
    print(f"Starting document generation at {datetime.now()}")
    db = SessionLocal()
    try:
        # Generate invoices
        invoice_configs = db.query(InvoiceConfiguration).all()
        for config in invoice_configs:
            try:
                filename = generate_invoice_pdf(config, config.id)
                print(f"Generated invoice: {filename}")
                
                # Generate delivery ticket for same config
                delivery_filename = generate_delivery_ticket_pdf(config, config.id)
                print(f"Generated delivery ticket: {delivery_filename}")
            except Exception as e:
                print(f"Error generating invoice {config.id}: {e}")

        # Generate freight invoices
        freight_configs = db.query(FreightConfiguration).all()
        for config in freight_configs:
            try:
                filename = generate_freight_invoice_pdf(config, config.id)
                print(f"Generated freight invoice: {filename}")
            except Exception as e:
                print(f"Error generating freight invoice {config.id}: {e}")

        print(f"Document generation complete at {datetime.now()}")
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(
        generate_all_documents,
        "cron",
        hour=8,
        minute=0,
        id="daily_document_generation"
    )
    scheduler.start()
    print("Scheduler started - documents will generate daily at 8:00 AM")

def stop_scheduler():
    scheduler.shutdown()
    print("Scheduler stopped")