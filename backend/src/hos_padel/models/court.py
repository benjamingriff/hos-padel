"""Court-related Pydantic models."""

from pydantic import BaseModel


class Court(BaseModel):
    """A padel court."""

    id: int
    name: str


class CourtStatus(BaseModel):
    """Status of a court for a specific time slot."""

    court_id: int
    court_name: str
    is_booked: bool
