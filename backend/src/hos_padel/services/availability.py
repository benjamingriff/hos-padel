"""Availability service for fetching and processing court availability."""

import asyncio
from datetime import datetime, timedelta

from ..core.config import settings
from ..core.constants import (
    ALL_DAYS_SELECTED,
    COURT_ID_TO_NAME,
    COURTS,
    DEFAULT_END_TIME,
    DEFAULT_RENTAL_LENGTH,
    DEFAULT_START_TIME,
)
from ..models.availability import AvailabilityResponse, TimeSlot
from ..models.court import CourtStatus
from ..scraper.bookings import fetch_court_bookings
from ..scraper.client import get_client


class AvailabilityService:
    """Service for fetching and processing court availability."""

    def __init__(
        self,
        location_id: int | None = None,
        rental_type_id: int | None = None,
    ):
        self.location_id = location_id or settings.ezfacility_location_id
        self.rental_type_id = rental_type_id or settings.ezfacility_rental_type_id

    async def get_availability_for_date(
        self,
        date: str,
        rental_length: int = DEFAULT_RENTAL_LENGTH,
    ) -> AvailabilityResponse:
        """
        Get availability for a specific date.

        Args:
            date: Date in DD/MM/YYYY format
            rental_length: Rental duration in minutes (60 or 90)

        Returns:
            AvailabilityResponse with time slots and court availability
        """
        # Fetch raw bookings from all courts concurrently
        raw_slots = await self._fetch_all_court_bookings(date, rental_length)

        # Filter to only the requested date
        date_slots = [s for s in raw_slots if s["StartDate"] == date]

        # Create 30-minute time slots
        time_slots = self._create_daily_slots(date)

        # Mark available slots based on API response
        self._mark_available_slots(time_slots, date_slots)

        # Fill in booked status for remaining courts
        self._fill_booked_status(time_slots)

        return AvailabilityResponse(
            date=date,
            rental_length=rental_length,
            slots=time_slots,
        )

    async def _fetch_all_court_bookings(
        self,
        start_date: str,
        rental_length: int,
    ) -> list[dict]:
        """Fetch bookings from all courts concurrently."""
        async with get_client() as client:
            tasks = [
                fetch_court_bookings(
                    client=client,
                    location_id=self.location_id,
                    court_id=court["id"],
                    rental_type_id=self.rental_type_id,
                    start_date=start_date,
                    rental_length=rental_length,
                    start_time=DEFAULT_START_TIME,
                    end_time=DEFAULT_END_TIME,
                    selected_days=ALL_DAYS_SELECTED,
                )
                for court in COURTS
            ]

            results = await asyncio.gather(*tasks)

            all_slots = []
            for result in results:
                if result["total"] > 500:
                    raise ValueError("API returned more bookings than requested limit")
                all_slots.extend(result["rows"])

            return all_slots

    def _create_daily_slots(
        self,
        date_str: str,
        start_time_str: str = DEFAULT_START_TIME,
        end_time_str: str = DEFAULT_END_TIME,
    ) -> list[TimeSlot]:
        """Create 30-minute time slots for a day."""
        start_time = datetime.strptime(start_time_str, "%H:%M").time()
        end_time = datetime.strptime(end_time_str, "%H:%M").time()
        current_dt = datetime.combine(
            datetime.strptime(date_str, "%d/%m/%Y"), start_time
        )
        end_dt = datetime.combine(datetime.strptime(date_str, "%d/%m/%Y"), end_time)

        slots = []
        while current_dt < end_dt:
            next_dt = current_dt + timedelta(minutes=30)
            slots.append(
                TimeSlot(
                    start_time=current_dt.strftime("%H:%M"),
                    end_time=next_dt.strftime("%H:%M"),
                    date=date_str,
                    has_available_court=False,
                    courts=[],
                )
            )
            current_dt = next_dt

        return slots

    def _mark_available_slots(
        self,
        time_slots: list[TimeSlot],
        raw_slots: list[dict],
    ) -> None:
        """Mark available courts in time slots based on API response."""
        for raw in raw_slots:
            resource_id = raw["ResourceID"]
            raw_start = datetime.strptime(raw["StartTime"], "%H:%M").time()
            raw_end = datetime.strptime(raw["EndTime"], "%H:%M").time()

            for slot in time_slots:
                slot_start = datetime.strptime(slot.start_time, "%H:%M").time()
                slot_end = datetime.strptime(slot.end_time, "%H:%M").time()

                # Check if time ranges overlap
                if slot_start < raw_end and slot_end > raw_start:
                    # Check if this court is already in the slot
                    existing = next(
                        (c for c in slot.courts if c.court_id == resource_id), None
                    )
                    if existing is None:
                        slot.courts.append(
                            CourtStatus(
                                court_id=resource_id,
                                court_name=COURT_ID_TO_NAME.get(
                                    resource_id, f"Court {resource_id}"
                                ),
                                is_booked=False,
                            )
                        )

    def _fill_booked_status(self, time_slots: list[TimeSlot]) -> None:
        """Fill in booked status for courts not in the available list."""
        for slot in time_slots:
            available_court_ids = {c.court_id for c in slot.courts}

            for court in COURTS:
                if court["id"] not in available_court_ids:
                    slot.courts.append(
                        CourtStatus(
                            court_id=court["id"],
                            court_name=court["name"],
                            is_booked=True,
                        )
                    )

            # Sort courts by ID for consistent ordering
            slot.courts.sort(key=lambda c: c.court_id)

            # Set has_available_court flag
            slot.has_available_court = any(not c.is_booked for c in slot.courts)
