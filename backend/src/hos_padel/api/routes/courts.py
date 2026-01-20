"""Courts API routes."""

from fastapi import APIRouter, HTTPException

from ...core.constants import COURTS
from ...models.court import Court

router = APIRouter(prefix="/courts", tags=["courts"])


@router.get("/", response_model=list[Court])
async def list_courts() -> list[Court]:
    """List all padel courts."""
    return [Court(id=c["id"], name=c["name"]) for c in COURTS]


@router.get("/{court_id}", response_model=Court)
async def get_court(court_id: int) -> Court:
    """Get a specific court by ID."""
    court = next((c for c in COURTS if c["id"] == court_id), None)
    if court is None:
        raise HTTPException(status_code=404, detail="Court not found")
    return Court(id=court["id"], name=court["name"])
