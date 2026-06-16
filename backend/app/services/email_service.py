import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
from app.database import SessionLocal
from app.models.configuration import InvoiceConfiguration

EMAIL_SETTINGS = {
    "email": os.getenv("SMTP_EMAIL", ""),
    "password": os.getenv("SMTP_PASSWORD", ""),
    "smtp_server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
    "smtp_port": int(os.getenv("SMTP_PORT", "587")),
}

def configure_email(email: str, password: str):
    EMAIL_SETTINGS["email"] = email
    EMAIL_SETTINGS["password"] = password

def send_email_with_attachment(to_email: str, subject: str, body: str, attachment_path: str):
    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL_SETTINGS["email"]
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))

        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as f:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(f.read())
                encoders.encode_base64(part)
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename={os.path.basename(attachment_path)}"
                )
                msg.attach(part)

        with smtplib.SMTP(EMAIL_SETTINGS["smtp_server"], EMAIL_SETTINGS["smtp_port"]) as server:
            server.starttls()
            server.login(EMAIL_SETTINGS["email"], EMAIL_SETTINGS["password"])
            server.send_message(msg)

        print(f"Email sent to {to_email}")
        return True
    except Exception as e:
        if not EMAIL_SETTINGS["email"] or not EMAIL_SETTINGS["password"]:
            print("Email failed: SMTP_EMAIL / SMTP_PASSWORD not configured")
        else:
            print(f"Email failed: {e}")
        return False

def send_invoice_email(config_id: int, pdf_path: str):
    db = SessionLocal()
    try:
        config = db.query(InvoiceConfiguration).filter(InvoiceConfiguration.id == config_id).first()
        if not config:
            return False
        return send_email_with_attachment(
            to_email=config.customer.email,
            subject=f"Invoice #{config_id}",
            body=f"Dear {config.customer.name},\n\nPlease find attached your invoice.\n\nThank you!",
            attachment_path=pdf_path
        )
    finally:
        db.close()