# TripSync — Premium Fuel & Freight Management

Production-grade SaaS platform for fuel distributors and freight companies. Built with FastAPI + React + PostgreSQL.

## Features

- Trip management (driver, route, gallons, revenue, status)
- Real-time analytics dashboard with revenue charts
- PDF generation (invoices, delivery tickets, freight invoices)
- Daily auto-scheduling at 8:00 AM via APScheduler
- Customer & Vendor CRM with ship-to addresses
- Google OAuth 2.0 + JWT authentication
- Email delivery with PDF attachments
- Dark theme premium UI inspired by Linear/Notion/Vercel
- Docker Compose deployment

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TanStack Query, Framer Motion, Recharts |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic v2, APScheduler |
| Auth | JWT (python-jose), Google OAuth 2.0, Bcrypt |
| PDF | WeasyPrint + Jinja2 |
| Database | PostgreSQL / SQLite |
| Deploy | Docker, Docker Compose, Nginx |

## Quick Start

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your values
uvicorn app.main:app --reload
```
API docs: http://localhost:8000/api/docs

### Frontend
```bash
cd frontend
npm install && npm run dev
```
App: http://localhost:5173

## Docker
```bash
cp .env.example .env
docker-compose up -d
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Environment Variables
```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/trip_summary_db
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

## API Reference
Full Swagger docs at `/api/docs` when backend is running.

## Tests
```bash
cd backend && pytest tests/ -v
```

## Security
- All routes protected with JWT bearer auth
- Google refresh tokens encrypted (Fernet AES-128)
- Passwords hashed with bcrypt
- Global exception handler hides stack traces
- CORS locked to known origins

Built by Samriddha Devkota
