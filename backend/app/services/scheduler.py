from apscheduler.schedulers.background import BackgroundScheduler
from app.database import SessionLocal
from app.models.configuration import InvoiceConfiguration, FreightConfiguration, GeneratedDocument
from app.services.pdf_generator import generate_invoice_pdf, generate_delivery_ticket_pdf, generate_freight_invoice_pdf
from app.services.email_service import send_email_with_attachment
from datetime import datetime

scheduler = BackgroundScheduler()


def generate_all_documents():
    print(f"Starting document generation at {datetime.now()}")
    db = SessionLocal()
    try:
        invoice_configs = db.query(InvoiceConfiguration).all()
        for config in invoice_configs:
            try:
                filename = generate_invoice_pdf(config, config.id, db=db)
                record = GeneratedDocument(document_type="invoice", filename=filename, config_id=config.id)
                db.add(record)
                db.commit()
                db.refresh(record)
                print(f"Generated invoice: {filename}")

                if config.customer and config.customer.email:
                    success = send_email_with_attachment(
                        to_email=config.customer.email,
                        subject=f"Invoice #{config.id}",
                        body=f"Dear {config.customer.name},\n\nPlease find your invoice attached.\n\nThank you!",
                        attachment_path=filename
                    )
                    if success:
                        record.email_sent = True
                        record.email_to = config.customer.email
                        db.commit()

                delivery_filename = generate_delivery_ticket_pdf(config, config.id, db=db)
                delivery_record = GeneratedDocument(document_type="delivery_ticket", filename=delivery_filename, config_id=config.id)
                db.add(delivery_record)
                db.commit()
                print(f"Generated delivery ticket: {delivery_filename}")

            except Exception as e:
                print(f"Error generating invoice {config.id}: {e}")

        freight_configs = db.query(FreightConfiguration).all()
        for config in freight_configs:
            try:
                filename = generate_freight_invoice_pdf(config, config.id, db=db)
                record = GeneratedDocument(document_type="freight_invoice", filename=filename, config_id=config.id)
                db.add(record)
                db.commit()
                print(f"Generated freight invoice: {filename}")

                if config.vendor and config.vendor.email:
                    success = send_email_with_attachment(
                        to_email=config.vendor.email,
                        subject=f"Freight Invoice #{config.id}",
                        body=f"Dear {config.vendor.name},\n\nPlease find your freight invoice attached.\n\nThank you!",
                        attachment_path=filename
                    )
                    if success:
                        record.email_sent = True
                        record.email_to = config.vendor.email
                        db.commit()

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
