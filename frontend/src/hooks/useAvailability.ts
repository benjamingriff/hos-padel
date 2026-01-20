import { useState, useEffect, useRef } from 'react'
import { getWeekAvailability } from '../api/availability'
import { WeekAvailability } from '../types/api'
import { dateToKey } from '../utils/dates'

interface UseAvailabilityResult {
  data: WeekAvailability
  isLoading: boolean
  error: Error | null
}

export function useAvailability(
  weekStart: Date,
  rentalLength: number = 60
): UseAvailabilityResult {
  const [data, setData] = useState<WeekAvailability>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const cacheRef = useRef<Map<string, WeekAvailability>>(new Map())

  useEffect(() => {
    const cacheKey = `${dateToKey(weekStart)}-${rentalLength}`

    // Check cache first
    const cached = cacheRef.current.get(cacheKey)
    if (cached) {
      setData(cached)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getWeekAvailability(weekStart, rentalLength)
        if (!cancelled) {
          cacheRef.current.set(cacheKey, result)
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [weekStart, rentalLength])

  return { data, isLoading, error }
}
