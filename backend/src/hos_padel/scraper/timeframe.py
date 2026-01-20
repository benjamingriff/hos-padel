"""Fetch operating hours from EZFacility."""

from .client import EZFacilityClient


async def fetch_timeframe(
    client: EZFacilityClient,
    location_id: int,
    rental_type_id: int,
    start_date: str,
) -> dict:
    """
    Fetch opening hours and rental options for a location/date.

    Args:
        client: EZFacility API client
        location_id: Location ID (e.g., 17555 for House of Sport)
        rental_type_id: Rental type ID (e.g., 271998 for padel)
        start_date: Date in DD/MM/YYYY format

    Returns:
        Dict with 'openCloseHoursForDay' (list of [open, close] times),
        'rentalLengths', etc.
    """
    data = f"locationId={location_id}&rentalTypeId={rental_type_id}&date={start_date}"
    return await client.post("/Rentals/GetTimeFrame", data)
