"""Application constants."""

# Court definitions - hardcoded for faster lookups
COURTS = [
    {"id": 386680, "name": "Padel Court 1"},
    {"id": 388015, "name": "Padel Court 2"},
    {"id": 388016, "name": "Padel Court 3"},
    {"id": 409091, "name": "Padel Court 4"},
    {"id": 409092, "name": "Padel Court 5"},
    {"id": 409093, "name": "Padel Court 6"},
]

# Court IDs as a list for quick iteration
COURT_IDS = [court["id"] for court in COURTS]

# Map court ID to name for quick lookup
COURT_ID_TO_NAME = {court["id"]: court["name"] for court in COURTS}

# Default selected days (all days selected)
ALL_DAYS_SELECTED = {
    "sunday": True,
    "monday": True,
    "tuesday": True,
    "wednesday": True,
    "thursday": True,
    "friday": True,
    "saturday": True,
}

# Default operating hours
DEFAULT_START_TIME = "08:30"
DEFAULT_END_TIME = "23:00"

# Valid rental lengths in minutes
VALID_RENTAL_LENGTHS = [60, 90]
DEFAULT_RENTAL_LENGTH = 60
