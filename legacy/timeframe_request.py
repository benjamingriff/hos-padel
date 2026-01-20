import requests
from rich import print


def get_timeframe(location_id: int, rental_type_id: int, start_date: str) -> list[dict]:
    url = "https://houseofsport.ezfacility.com/Rentals/GetTimeFrame"

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

    data = f"locationId={location_id}&rentalTypeId={rental_type_id}&date={start_date}"

    try:
        response = requests.post(url, headers=headers, data=data)

        response.raise_for_status()

        return response.json()

    except requests.exceptions.RequestException as e:
        raise e


if __name__ == "__main__":
    LOCATION_ID = 17555
    RENTAL_TYPE_ID = 271998
    print(get_timeframe(LOCATION_ID, RENTAL_TYPE_ID, "22/05/2025"))
