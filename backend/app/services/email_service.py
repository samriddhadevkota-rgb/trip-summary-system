import base64
import os
import requests
from app.database import SessionLocal
from app.models.configuration import InvoiceConfiguration

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM = os.getenv("RESEND_FROM", "TripSync <onboarding@resend.dev>")

EMAIL_SETTINGS = {
    "email": os.getenv("SMTP_EMAIL", ""),
}

def configure_email(email: str, password: str = ""):
    EMAIL_SETTINGS["email"] = email

def send_email_with_attachment(to_email: str, subject: str, body: str, attachment_path: str):
    if not RESEND_API_KEY:
        print("Email failed: RESEND_API_KEY not configured")
        return False

    payload = {
        "from": RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "text": body,
    }

    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, "rb") as f:
            content = base64.b64encode(f.read()).decode("utf-8")
        payload["attachments"] = [{
            "filename": os.path.basename(attachment_path),
            "content": content,
        }]

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
            json=payload,
            timeout=15,
        )
        if resp.status_code in (200, 201, 202):
            print(f"Email sent to {to_email}")
            return True
        print(f"Email failed: {resp.status_code} {resp.text}")
        return False
    except Exception as e:
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
