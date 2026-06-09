from fastapi import APIRouter
from pydantic import BaseModel
from app.services.email_service import configure_email, send_email_with_attachment

router = APIRouter(prefix="/email", tags=["email"])

class EmailSettings(BaseModel):
    email: str
    password: str

class SendEmailRequest(BaseModel):
    to_email: str
    subject: str
    body: str
    attachment_path: str = ""

@router.post("/configure")
def set_email_settings(settings: EmailSettings):
    configure_email(settings.email, settings.password)
    return {"message": "Email configured successfully!"}

@router.post("/send")
def send_email(request: SendEmailRequest):
    success = send_email_with_attachment(
        to_email=request.to_email,
        subject=request.subject,
        body=request.body,
        attachment_path=request.attachment_path
    )
    if success:
        return {"message": "Email sent successfully!"}
    return {"error": "Email failed to send!"}