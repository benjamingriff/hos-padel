"""Availability-related Pydantic models."""

from pydantic import BaseModel

from .court import CourtStatus


class TimeSlot(BaseModel):
    """A 30-minute time slot with court availability."""

    start_time: str
    end_time: str
    date: str
    has_available_court: bool
    courts: list[CourtStatus]


class AvailabilityResponse(BaseModel):
    """Response for availability endpoints."""

    date: str
    rental_length: int
    slots: list[TimeSlot]
