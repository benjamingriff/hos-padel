"""Fetch court IDs from EZFacility."""

from .client import EZFacilityClient


async def fetch_court_ids(client: EZFacilityClient, rental_type_id: int) -> list[dict]:
    """
    Fetch list of courts for a rental type.

    Args:
        client: EZFacility API client
        rental_type_id: Rental type ID (e.g., 271998 for padel)

    Returns:
        List of dicts with 'Id' and 'Name' keys
    """
    data = f"rentalTypeId={rental_type_id}"
    return await client.post("/Rentals/GetResources", data)
