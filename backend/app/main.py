from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import trip, user, customer, vendor, product, fee_tax, configuration
from app.routes import trips, auth, customers, vendors, fees_taxes, products, configurations, documents
from app.services.scheduler import start_scheduler, stop_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(customers.router)
app.include_router(vendors.router)
app.include_router(fees_taxes.router)
app.include_router(products.router)
app.include_router(configurations.router)
app.include_router(documents.router)

@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    stop_scheduler()

@app.get("/")
async def root():
    return {"message": "Backend Running"}
