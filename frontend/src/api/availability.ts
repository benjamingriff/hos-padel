import { AvailabilityResponse, TimeSlot, WeekAvailability } from '../types/api'
import { formatDateForApi, getWeekDates, dateToKey } from '../utils/dates'

// In dev: Vite proxy forwards /api to localhost:8000
// In prod: nginx proxy forwards /api to the api container
const API_BASE = import.meta.env.VITE_API_URL || ''

/**
 * Fetch availability for a single date
 */
export async function getAvailability(
  date: Date,
  rentalLength: number = 60
): Promise<AvailabilityResponse> {
  const dateStr = formatDateForApi(date)
  const url = `${API_BASE}/api/v1/availability/${dateStr}?rental_length=${rentalLength}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch availability: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch availability for an entire week (7 parallel requests)
 */
export async function getWeekAvailability(
  weekStart: Date,
  rentalLength: number = 60
): Promise<WeekAvailability> {
  const dates = getWeekDates(weekStart)

  const results = await Promise.all(
    dates.map(async (date) => {
      try {
        const response = await getAvailability(date, rentalLength)
        return { date, slots: response.slots }
      } catch {
        // Return empty slots for failed requests
        return { date, slots: [] as TimeSlot[] }
      }
    })
  )

  const availability: WeekAvailability = new Map()
  for (const { date, slots } of results) {
    availability.set(dateToKey(date), slots)
  }

  return availability
}
