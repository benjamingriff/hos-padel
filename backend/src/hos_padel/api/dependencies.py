"""API dependencies for dependency injection."""

from datetime import datetime


def get_current_date() -> str:
    """Return current date in DD/MM/YYYY format."""
    return datetime.now().strftime("%d/%m/%Y")
