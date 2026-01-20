"""Fetch available booking slots from EZFacility."""

from .client import EZFacilityClient


async def fetch_court_bookings(
    client: EZFacilityClient,
    location_id: int,
    court_id: int,
    rental_type_id: int,
    start_date: str,
    rental_length: int,
    start_time: str,
    end_time: str,
    selected_days: dict[str, bool],
    sort_asc: bool = False,
    current: int = 1,
    row_count: int = 500,
) -> dict:
    """
    Fetch available booking slots for a specific court.

    Args:
        client: EZFacility API client
        location_id: Location ID (e.g., 17555 for House of Sport)
        court_id: Court/resource ID
        rental_type_id: Rental type ID (e.g., 271998 for padel)
        start_date: Start date in DD/MM/YYYY format
        rental_length: Rental duration in minutes (60 or 90)
        start_time: Start time in HH:MM format
        end_time: End time in HH:MM format
        selected_days: Dict of day names to boolean (which days to include)
        sort_asc: Sort ascending
        current: Page number
        row_count: Number of results per page

    Returns:
        Dict with 'rows' (list of booking slots) and 'total' count
    """
    selected_days_str = ""
    for day, selected in selected_days.items():
        selected_days_str += f"{day}={str(selected).lower()}&"

    sort_asc_str = "true" if sort_asc else "false"

    data = (
        f"current={current}&rowCount={row_count}&searchPhrase=&id=NaN"
        f"&locationId={location_id}&rentalTypeId={rental_type_id}"
        f"&resourceId={court_id}&rentalLength={rental_length}"
        f"&{selected_days_str}startDate={start_date}"
        f"&startTime={start_time}&endTime={end_time}&sortAsc={sort_asc_str}"
    )

    return await client.post("/Rentals/FilterResults", data)
