"""Booking-related Pydantic models."""

from pydantic import BaseModel, Field


class RawBookingSlot(BaseModel):
    """Raw booking slot from EZFacility API."""

    resource_id: int = Field(alias="ResourceID")
    start_date: str = Field(alias="StartDate")
    end_date: str = Field(alias="EndDate")
    start_time: str = Field(alias="StartTime")
    end_time: str = Field(alias="EndTime")

    model_config = {"populate_by_name": True}
