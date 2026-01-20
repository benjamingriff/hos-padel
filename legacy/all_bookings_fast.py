from rich import print
import asyncio
import time
import json
from datetime import datetime
from booking_request import get_bookings


async def get_all_court_bookings_fast(rental_length: int):
    LOCATION_ID = 17555
    PADEL_RENTAL_TYPE_ID = 271998
    START_DATE = datetime.now().strftime("%d/%m/%Y")

    START_TIME = "08:30"
    END_TIME = "23:00"

    SELECTED_DAYS = {
        "sunday": True,
        "monday": True,
        "tuesday": True,
        "wednesday": True,
        "thursday": True,
        "friday": True,
        "saturday": True,
    }

    COURT_IDS = [
        {"Id": 386680, "Name": "Padel Court 1"},
        {"Id": 388015, "Name": "Padel Court 2"},
        {"Id": 388016, "Name": "Padel Court 3"},
        {"Id": 409091, "Name": "Padel Court 4"},
        {"Id": 409092, "Name": "Padel Court 5"},
        {"Id": 409093, "Name": "Padel Court 6"},
    ]

    tasks = []
    for court in COURT_IDS:
        task = get_bookings(
            location_id=LOCATION_ID,
            court_id=court["Id"],
            rental_type_id=PADEL_RENTAL_TYPE_ID,
            start_date=START_DATE,
            rental_length=rental_length,
            start_time=START_TIME,
            end_time=END_TIME,
            selected_days=SELECTED_DAYS,
        )
        tasks.append(task)

    results = await asyncio.gather(*tasks)

    bookings = []
    for court, bookings_result in zip(COURT_IDS, results):
        if bookings_result["total"] > 500:
            raise Exception("More bookings than requested")
        bookings.extend(bookings_result["rows"])

    return bookings


if __name__ == "__main__":
    rental_length = 60  # 60 minutes (1 hour) vs 90 minutes (1.5 hours)
    start_time = time.time()
    bookings = asyncio.run(get_all_court_bookings_fast(rental_length))
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")

    with open("bookings.json", "w") as f:
        json.dump(bookings, f, indent=4)
