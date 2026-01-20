from rich import print
import asyncio

from court_request import get_court_ids
from timeframe_request import get_timeframe
from booking_request import get_bookings


async def get_all_court_bookings(rental_length: int):
    LOCATION_ID = 17555
    PADEL_RENTAL_TYPE_ID = 271998
    START_DATE = "14/06/2025"

    court_timeframe = get_timeframe(LOCATION_ID, PADEL_RENTAL_TYPE_ID, START_DATE)

    # rental_length = court_timeframe["rentalLengths"][0]["Id"]
    start_time = court_timeframe["openCloseHoursForDay"][0]
    end_time = court_timeframe["openCloseHoursForDay"][1]

    selected_days = {
        "sunday": True,
        "monday": True,
        "tuesday": True,
        "wednesday": True,
        "thursday": True,
        "friday": True,
        "saturday": True,
    }

    court_ids = get_court_ids(PADEL_RENTAL_TYPE_ID)

    tasks = []
    for court in court_ids:
        task = get_bookings(
            location_id=LOCATION_ID,
            court_id=court["Id"],
            rental_type_id=PADEL_RENTAL_TYPE_ID,
            start_date=START_DATE,
            rental_length=rental_length,
            start_time=start_time,
            end_time=end_time,
            selected_days=selected_days,
        )
        tasks.append(task)

    results = await asyncio.gather(*tasks)

    for court, bookings in zip(court_ids, results):
        print(f"\nResults for court: {court['Name']} ({court['Id']})")
        print(f"Total bookings: {bookings['total']}")
        if bookings["total"] > 500:
            raise Exception("More bookings than requested")


if __name__ == "__main__":
    rental_length = 60  # 60 minutes (1 hour) vs 90 minutes (1.5 hours)
    asyncio.run(get_all_court_bookings(rental_length))
