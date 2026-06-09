from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import trip, user, customer, vendor, product, fee_tax, configuration
from app.routes import trips, auth, customers, vendors, fees_taxes, products, configurations

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

@app.get("/")
async def root():
    return {"message": "Backend Running"}
