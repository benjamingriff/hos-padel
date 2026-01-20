"""API route definitions."""

from fastapi import APIRouter

from . import availability, courts

router = APIRouter(prefix="/api/v1")
router.include_router(availability.router)
router.include_router(courts.router)
