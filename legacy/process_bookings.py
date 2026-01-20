import json
from datetime import datetime, timedelta

from rich import print


def create_daily_slots(date_str, start_time_str="08:30", end_time_str="23:00"):
    """Create a list of 30-minute slots for a day."""
    start_time = datetime.strptime(start_time_str, "%H:%M").time()
    end_time = datetime.strptime(end_time_str, "%H:%M").time()
    current_time = datetime.combine(datetime.strptime(date_str, "%d/%m/%Y"), start_time)
    end_datetime = datetime.combine(datetime.strptime(date_str, "%d/%m/%Y"), end_time)
    slots = []

    while current_time < end_datetime:
        next_time = current_time + timedelta(minutes=30)
        slots.append(
            {
                "start_time": current_time.strftime("%H:%M"),
                "end_time": next_time.strftime("%H:%M"),
                "date": date_str,
                "is_free_court": None,
                "court_status": {},
            }
        )
        current_time = next_time
    return slots


def create_daily_slots_for_all_dates(start_date, end_date):
    bookings_by_date = {}
    current_date = start_date
    while current_date <= end_date:
        daily_slots = create_daily_slots(current_date.strftime("%d/%m/%Y"))
        bookings_by_date[current_date.strftime("%d/%m/%Y")] = daily_slots
        current_date += timedelta(days=1)
    return bookings_by_date


def find_start_and_end_date(data):
    start_date = None
    end_date = None
    for entry in data:
        if start_date is None or datetime.strptime(
            entry["StartDate"], "%d/%m/%Y"
        ) < datetime.strptime(start_date, "%d/%m/%Y"):
            start_date = entry["StartDate"]
        if end_date is None or datetime.strptime(
            entry["EndDate"], "%d/%m/%Y"
        ) > datetime.strptime(end_date, "%d/%m/%Y"):
            end_date = entry["EndDate"]
    return datetime.strptime(start_date, "%d/%m/%Y"), datetime.strptime(
        end_date, "%d/%m/%Y"
    )


def mark_free_bookings_in_daily_slots(bookings_by_date, data):
    COURT_IDS = [
        {"Id": 386680, "Name": "Padel Court 1"},
        {"Id": 388015, "Name": "Padel Court 2"},
        {"Id": 388016, "Name": "Padel Court 3"},
        {"Id": 409091, "Name": "Padel Court 4"},
        {"Id": 409092, "Name": "Padel Court 5"},
        {"Id": 409093, "Name": "Padel Court 6"},
    ]

    for item in data:
        date_str = item["StartDate"]
        resource_id = item["ResourceID"]

        start_time = datetime.strptime(item["StartTime"], "%H:%M").time()
        end_time = datetime.strptime(item["EndTime"], "%H:%M").time()

        for booking in bookings_by_date[date_str]:
            booking_start_time = datetime.strptime(
                booking["start_time"], "%H:%M"
            ).time()
            booking_end_time = datetime.strptime(booking["end_time"], "%H:%M").time()
            if booking_start_time < end_time and booking_end_time > start_time:
                if resource_id not in booking["court_status"]:
                    booking["court_status"][resource_id] = {}
                    booking["court_status"][resource_id]["is_booked"] = False
                    booking["court_status"][resource_id]["court_name"] = next(
                        court["Name"]
                        for court in COURT_IDS
                        if court["Id"] == resource_id
                    )
    return bookings_by_date


def mark_booked_bookings_in_daily_slots(bookings_by_date):
    COURT_IDS = [
        {"Id": 386680, "Name": "Padel Court 1"},
        {"Id": 388015, "Name": "Padel Court 2"},
        {"Id": 388016, "Name": "Padel Court 3"},
        {"Id": 409091, "Name": "Padel Court 4"},
        {"Id": 409092, "Name": "Padel Court 5"},
        {"Id": 409093, "Name": "Padel Court 6"},
    ]

    for date_str, daily_slots in bookings_by_date.items():
        for slot in daily_slots:
            is_free_court = False
            for court in COURT_IDS:
                if court["Id"] not in slot["court_status"]:
                    slot["court_status"][court["Id"]] = {
                        "is_booked": True,
                        "court_name": court["Name"],
                    }
                else:
                    is_free_court = True

            slot["is_free_court"] = is_free_court

    return bookings_by_date


def main():
    with open("bookings.json", "r") as file:
        data = json.load(file)

    start_date, end_date = find_start_and_end_date(data)

    bookings_by_date = create_daily_slots_for_all_dates(start_date, end_date)

    bookings_by_date = mark_free_bookings_in_daily_slots(bookings_by_date, data)

    bookings_by_date = mark_booked_bookings_in_daily_slots(bookings_by_date)

    with open("court_data_18_06_2025.json", "w") as file:
        json.dump(bookings_by_date["18/06/2025"], file, indent=4)


if __name__ == "__main__":
    main()
