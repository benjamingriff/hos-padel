# HOS Padel API

FastAPI backend for checking padel court availability at House of Sport.

## Local Development

```bash
# Install dependencies
uv sync

# Run the server
uv run uvicorn src.hos_padel.main:app --reload

# Run with specific host/port
uv run uvicorn src.hos_padel.main:app --host 0.0.0.0 --port 8000 --reload
```

## Docker

```bash
# Build image
docker build -t hos-padel-api .

# Run container
docker run -p 8000:8000 hos-padel-api
```

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

## Architecture

```
src/hos_padel/
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

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EZFACILITY_LOCATION_ID` | 17555 | House of Sport location ID |
| `EZFACILITY_RENTAL_TYPE_ID` | 271998 | Padel court rental type ID |
