import aiohttp
import asyncio
from rich import print


async def get_bookings(
    location_id: int,
    court_id: int,
    rental_type_id: int,
    start_date: str,
    rental_length: int,
    start_time: str,
    end_time: str,
    selected_days: dict[str, bool],
    sort_asc: bool = False,
    current: int = 1,
    row_count: int = 500,
) -> list[dict]:
    url = "https://houseofsport.ezfacility.com/Rentals/FilterResults"

    headers = {
        "accept": "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "dnt": "1",
        "origin": "https://houseofsport.ezfacility.com",
        "priority": "u=1, i",
        "referer": "https://houseofsport.ezfacility.com/Rentals",
        "sec-ch-ua": '"Chromium";v="135", "Not-A.Brand";v="8"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
    }

    selected_days_str = ""
    for day, selected in selected_days.items():
        selected_days_str += f"{day}={selected}&".lower()

    sort_asc_str = "true" if sort_asc else "false"

    data = f"current={current}&rowCount={row_count}&searchPhrase=&id=NaN&locationId={location_id}&rentalTypeId={rental_type_id}&resourceId={court_id}&rentalLength={rental_length}&{selected_days_str}startDate={start_date}&startTime={start_time}&endTime={end_time}&sortAsc={sort_asc_str}"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, data=data) as response:
                response.raise_for_status()
                return await response.json()

    except aiohttp.ClientError as e:
        raise e


async def main():
    LOCATION_ID = 17555
    RENTAL_TYPE_ID = 271998
    COURT_ID = 386680
    selected_days = {
        "sunday": True,
        "monday": True,
        "tuesday": True,
        "wednesday": True,
        "thursday": True,
        "friday": True,
        "saturday": True,
    }

    result = await get_bookings(
        LOCATION_ID,
        COURT_ID,
        RENTAL_TYPE_ID,
        "22/05/2025",
        60,
        "08:30",
        "23:00",
        selected_days,
    )
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
