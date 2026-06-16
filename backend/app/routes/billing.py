import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
PUBLIC_URL = os.getenv("PUBLIC_URL", "http://localhost:5173")

PLANS = {
    "premium": {"name": "TripSync Premium", "amount": 2000},  # $20.00/month
}

@router.get("/status")
def billing_status(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"plan": user.plan or "free", "subscription_status": user.subscription_status}

@router.post("/create-checkout-session")
def create_checkout_session(plan: str = "premium", db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Payments aren't configured yet. Please try again later.")
    if plan not in PLANS:
        raise HTTPException(status_code=400, detail="Unknown plan")

    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    p = PLANS[plan]
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            customer_email=user.email,
            client_reference_id=str(user.id),
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": p["name"]},
                    "unit_amount": p["amount"],
                    "recurring": {"interval": "month"},
                },
                "quantity": 1,
            }],
            mode="subscription",
            success_url=f"{PUBLIC_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{PUBLIC_URL}/checkout",
        )
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        if WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
        else:
            import json
            event = json.loads(payload)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    event_type = event["type"] if isinstance(event, dict) else event.type
    data_object = event["data"]["object"] if isinstance(event, dict) else event.data.object

    if event_type == "checkout.session.completed":
        user_id = data_object.get("client_reference_id") if isinstance(data_object, dict) else data_object.client_reference_id
        customer_id = data_object.get("customer") if isinstance(data_object, dict) else data_object.customer
        if user_id:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user:
                user.plan = "premium"
                user.subscription_status = "active"
                user.stripe_customer_id = customer_id
                db.commit()

    elif event_type in ("customer.subscription.deleted", "customer.subscription.updated"):
        status = data_object.get("status") if isinstance(data_object, dict) else data_object.status
        customer_id = data_object.get("customer") if isinstance(data_object, dict) else data_object.customer
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.subscription_status = status
            if status not in ("active", "trialing"):
                user.plan = "free"
            db.commit()

    return {"received": True}
