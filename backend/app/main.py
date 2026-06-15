import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.limiter import limiter
from app.database import engine, Base
from app.models import trip, user, customer, vendor, product, fee_tax, configuration
from app.routes import trips, auth, customers, vendors, fees_taxes, products, configurations, documents, email_settings, templates, settings, oauth, analytics, portal
from app.services.scheduler import start_scheduler, stop_scheduler
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TripSync API",
    description="Premium fuel & freight trip management system",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("RAILWAY_ENVIRONMENT") else _allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, RateLimitExceeded):
        return JSONResponse(status_code=429, content={"detail": "Too many requests. Slow down."})
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(customers.router)
app.include_router(vendors.router)
app.include_router(fees_taxes.router)
app.include_router(products.router)
app.include_router(configurations.router)
app.include_router(documents.router)
app.include_router(email_settings.router)
app.include_router(templates.router)
app.include_router(settings.router)
app.include_router(oauth.router)
app.include_router(analytics.router)
app.include_router(portal.router)

@app.on_event("startup")
def startup_event():
    logger.info("TripSync API starting up...")
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    stop_scheduler()

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Serve the built React app (only when static/ folder exists — i.e. in production)
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(_static_dir):
    _assets_dir = os.path.join(_static_dir, "assets")
    if os.path.isdir(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(_static_dir, "index.html"))
else:
    @app.get("/")
    async def root():
        return {"status": "ok", "version": "2.0.0", "message": "TripSync API is running"}
