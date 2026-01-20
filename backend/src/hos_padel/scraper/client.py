"""Shared async HTTP client for EZFacility API."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import aiohttp

# Base URL for EZFacility API
BASE_URL = "https://houseofsport.ezfacility.com"

# Shared headers for all requests
DEFAULT_HEADERS = {
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "dnt": "1",
    "origin": BASE_URL,
    "priority": "u=1, i",
    "referer": f"{BASE_URL}/Rentals",
    "sec-ch-ua": '"Chromium";v="135", "Not-A.Brand";v="8"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    "x-requested-with": "XMLHttpRequest",
}


class EZFacilityClient:
    """Async HTTP client for EZFacility API with shared session."""

    def __init__(self, session: aiohttp.ClientSession):
        self.session = session
        self.base_url = BASE_URL

    async def post(self, endpoint: str, data: str) -> dict:
        """Make a POST request to the API."""
        url = f"{self.base_url}{endpoint}"
        async with self.session.post(url, headers=DEFAULT_HEADERS, data=data) as response:
            response.raise_for_status()
            return await response.json()


@asynccontextmanager
async def get_client() -> AsyncGenerator[EZFacilityClient, None]:
    """Context manager for creating an EZFacility client with a shared session."""
    async with aiohttp.ClientSession() as session:
        yield EZFacilityClient(session)
