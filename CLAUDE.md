# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HOS Padel - Padel court availability system for House of Sport. Consists of a FastAPI backend that scrapes data from EZFacility's booking system.

## Project Structure

```
hos-padel/
├── backend/              # HOS Padel API (FastAPI)
│   ├── src/hos_padel/    # Source code
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/             # React frontend (Vite + TypeScript + Tailwind)
│   ├── src/              # Source code
│   └── package.json
├── legacy/               # Old scripts for reference
├── docker-compose.yml    # Orchestration
└── CLAUDE.md
```

## Running with Docker (Recommended)

```bash
# Build and run all services
docker compose up --build

# Run in background
docker compose up -d --build

# View logs
docker compose logs -f api

# Stop services
docker compose down
```

## Local Development (Backend)

```bash
cd backend

# Install dependencies
uv sync

# Run the server
uv run uvicorn src.hos_padel.main:app --reload
```

## Local Development (Frontend)

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

The frontend will be available at http://localhost:5173

## Test Endpoints

```bash
# Health check
curl http://localhost:8000/health

# List all courts
curl http://localhost:8000/api/v1/courts/

# Get today's availability
curl http://localhost:8000/api/v1/availability/

# Get availability for a specific date (DD-MM-YYYY format)
curl http://localhost:8000/api/v1/availability/25-05-2025

# Get 90-minute slots
curl "http://localhost:8000/api/v1/availability/?rental_length=90"
```

## API Documentation

Open http://localhost:8000/docs for interactive Swagger UI.

## Backend Architecture

```
backend/src/hos_padel/
├── main.py              # FastAPI app entry point
├── api/
│   ├── dependencies.py  # Dependency injection
│   └── routes/
│       ├── availability.py  # GET /api/v1/availability endpoints
│       └── courts.py        # GET /api/v1/courts endpoints
├── core/
│   ├── config.py        # Pydantic Settings for env vars
│   └── constants.py     # Courts, IDs, rental lengths
├── models/
│   ├── availability.py  # TimeSlot, AvailabilityResponse
│   ├── booking.py       # RawBookingSlot
│   └── court.py         # Court, CourtStatus
├── scraper/
│   ├── client.py        # EZFacilityClient (shared async HTTP)
│   ├── bookings.py      # fetch_court_bookings()
│   ├── courts.py        # fetch_court_ids()
│   └── timeframe.py     # fetch_timeframe()
└── services/
    └── availability.py  # AvailabilityService (business logic)
```

**Data Flow:**
1. API route receives request
2. `AvailabilityService` orchestrates scraping all courts concurrently
3. `scraper/` modules fetch raw data from EZFacility
4. Service transforms raw slots into 30-minute `TimeSlot` objects
5. API returns `AvailabilityResponse` with court status per slot

**Key Constants (in `core/constants.py`):**
- `LOCATION_ID = 17555` - House of Sport location
- `RENTAL_TYPE_ID = 271998` - Padel court rental type
- Court IDs: 386680, 388015, 388016, 409091, 409092, 409093 (Courts 1-6)

## Frontend Architecture

```
frontend/src/
├── api/
│   └── availability.ts    # API client functions
├── components/
│   ├── Calendar/
│   │   ├── WeekView.tsx   # Main weekly calendar grid
│   │   ├── DayColumn.tsx  # Single day column
│   │   ├── TimeSlot.tsx   # Individual slot cell
│   │   ├── TimeAxis.tsx   # Left-side time labels
│   │   └── SlotPopover.tsx # Court breakdown popover
│   ├── Navigation/
│   │   └── WeekNav.tsx    # Week forward/back controls
│   └── Layout/
│       └── Header.tsx     # App header
├── hooks/
│   └── useAvailability.ts # Data fetching hook
├── types/
│   └── api.ts             # TypeScript interfaces
├── utils/
│   └── dates.ts           # Date formatting helpers
├── App.tsx                # Main app component
└── main.tsx               # Entry point
```

**Key Features:**
- Weekly calendar view (Monday-Sunday)
- Visual availability status (green = available, gray = booked)
- Click slot to see court breakdown in popover
- Week navigation (previous/next/today)
- Caches API responses to avoid re-fetching

## Dependencies

**Backend:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `aiohttp` - Async HTTP client
- `pydantic` / `pydantic-settings` - Data validation and settings

**Frontend:**
- `react` - UI library
- `vite` - Build tool and dev server
- `tailwindcss` - CSS framework
- `date-fns` - Date manipulation

## Legacy Scripts

Old standalone scripts are preserved in `legacy/` for reference.
