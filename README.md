# HOS Padel

Padel court availability system for House of Sport.

## Project Structure

```
hos-padel/
├── backend/          # HOS Padel API (FastAPI)
├── frontend/         # React frontend (Vite + TypeScript + Tailwind)
├── legacy/           # Old scripts for reference
└── docker-compose.yml
```

## Quick Start with Docker

```bash
# Build and run all services
docker compose up --build

# Run in detached mode
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Development

### Backend

```bash
cd backend
uv sync
uv run uvicorn src.hos_padel.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

The frontend uses Vite's proxy to forward API requests to the backend at http://localhost:8000.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/courts/` | List all courts |
| GET | `/api/v1/courts/{id}` | Get court by ID |
| GET | `/api/v1/availability/` | Today's availability |
| GET | `/api/v1/availability/{date}` | Availability for date (DD-MM-YYYY) |

Query parameter: `rental_length` (60 or 90 minutes, default: 60)

## API Documentation

Interactive Swagger docs: http://localhost:8000/docs
