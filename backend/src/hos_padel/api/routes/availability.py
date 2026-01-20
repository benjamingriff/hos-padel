"""Availability API routes."""

from datetime import datetime

from fastapi import APIRouter, HTTPException, Query

from ...core.constants import DEFAULT_RENTAL_LENGTH, VALID_RENTAL_LENGTHS
from ...models.availability import AvailabilityResponse
from ...services.availability import AvailabilityService

router = APIRouter(prefix="/availability", tags=["availability"])


def _validate_rental_length(rental_length: int) -> None:
    """Validate rental length parameter."""
    if rental_length not in VALID_RENTAL_LENGTHS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid rental_length. Must be one of: {VALID_RENTAL_LENGTHS}",
        )


def _parse_date(date_str: str) -> str:
    """Parse and validate date string (DD-MM-YYYY format)."""
    try:
        parsed = datetime.strptime(date_str, "%d-%m-%Y")
        return parsed.strftime("%d/%m/%Y")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use DD-MM-YYYY",
        )


@router.get("/", response_model=AvailabilityResponse)
async def get_today_availability(
    rental_length: int = Query(
        default=DEFAULT_RENTAL_LENGTH,
        description="Rental duration in minutes (60 or 90)",
    ),
) -> AvailabilityResponse:
    """Get court availability for today."""
    _validate_rental_length(rental_length)

    today = datetime.now().strftime("%d/%m/%Y")
    service = AvailabilityService()

    return await service.get_availability_for_date(today, rental_length)


@router.get("/{date}", response_model=AvailabilityResponse)
async def get_availability_for_date(
    date: str,
    rental_length: int = Query(
        default=DEFAULT_RENTAL_LENGTH,
        description="Rental duration in minutes (60 or 90)",
    ),
) -> AvailabilityResponse:
    """
    Get court availability for a specific date.

    Date format: DD-MM-YYYY (e.g., 25-05-2025)
    """
    _validate_rental_length(rental_length)
    parsed_date = _parse_date(date)

    service = AvailabilityService()

    return await service.get_availability_for_date(parsed_date, rental_length)
