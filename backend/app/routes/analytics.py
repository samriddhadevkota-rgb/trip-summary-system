from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.deps import get_db, get_current_user
from app.models.trip import Trip
from app.models.customer import Customer
from app.models.vendor import Vendor
from app.models.configuration import GeneratedDocument

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    total_trips = db.query(Trip).count()
    completed = db.query(Trip).filter(Trip.status == "completed").count()
    pending = db.query(Trip).filter(Trip.status == "pending").count()
    in_progress = db.query(Trip).filter(Trip.status == "in_progress").count()
    total_customers = db.query(Customer).count()
    total_vendors = db.query(Vendor).count()
    total_revenue = db.query(func.sum(Trip.revenue)).scalar() or 0
    total_docs = db.query(GeneratedDocument).count()

    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0)
    trips_this_month = db.query(Trip).filter(Trip.created_at >= month_start).count()
    revenue_this_month = db.query(func.sum(Trip.revenue)).filter(Trip.created_at >= month_start).scalar() or 0

    # Revenue last 6 months
    revenue_by_month = []
    for i in range(5, -1, -1):
        target = now - timedelta(days=30 * i)
        m_start = target.replace(day=1, hour=0, minute=0, second=0)
        if target.month == 12:
            m_end = target.replace(year=target.year + 1, month=1, day=1, hour=0, minute=0, second=0)
        else:
            m_end = target.replace(month=target.month + 1, day=1, hour=0, minute=0, second=0)
        rev = db.query(func.sum(Trip.revenue)).filter(
            Trip.created_at >= m_start, Trip.created_at < m_end
        ).scalar() or 0
        count = db.query(Trip).filter(
            Trip.created_at >= m_start, Trip.created_at < m_end
        ).count()
        revenue_by_month.append({
            "month": target.strftime("%b"),
            "revenue": round(float(rev), 2),
            "trips": count
        })

    # Trips by status for pie chart
    trips_by_status = [
        {"name": "Completed", "value": completed, "color": "#10b981"},
        {"name": "Pending", "value": pending, "color": "#f59e0b"},
        {"name": "In Progress", "value": in_progress, "color": "#6366f1"},
        {"name": "Other", "value": max(0, total_trips - completed - pending - in_progress), "color": "#5c5c78"},
    ]

    # Recent trips
    recent_trips = db.query(Trip).order_by(Trip.created_at.desc()).limit(5).all()

    return {
        "total_trips": total_trips,
        "completed_trips": completed,
        "pending_trips": pending,
        "in_progress_trips": in_progress,
        "total_customers": total_customers,
        "total_vendors": total_vendors,
        "total_revenue": round(float(total_revenue), 2),
        "total_documents": total_docs,
        "trips_this_month": trips_this_month,
        "revenue_by_month": revenue_by_month,
        "trips_by_status": trips_by_status,
        "recent_trips": [
            {"id": t.id, "driver_name": t.driver_name, "origin": t.origin, "destination": t.destination, "status": t.status, "revenue": t.revenue}
            for t in recent_trips
        ]
    }
