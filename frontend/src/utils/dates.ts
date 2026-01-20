import { format, addDays, parse } from 'date-fns'

/**
 * Format a Date object to the API expected format (DD-MM-YYYY)
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'dd-MM-yyyy')
}

/**
 * Format a date for display in day column header (e.g., "Mon 20")
 */
export function formatDayHeader(date: Date): string {
  return format(date, 'EEE d')
}

/**
 * Format a date for display in week navigation (e.g., "Mon 20 Jan")
 */
export function formatWeekNavDate(date: Date): string {
  return format(date, 'EEE d MMM')
}

/**
 * Format a date for display in day navigation (e.g., "Tue 21 Jan")
 */
export function formatDayNavDate(date: Date): string {
  return format(date, 'EEE d MMM')
}

/**
 * Get an array of 7 dates starting from the given date (Monday)
 */
export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

/**
 * Parse API date format (DD/MM/YYYY) to a Date object
 */
export function parseApiDate(dateStr: string): Date {
  return parse(dateStr, 'dd/MM/yyyy', new Date())
}

/**
 * Create a unique key for a date (YYYY-MM-DD format)
 */
export function dateToKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Generate time slots for display (08:30 to 22:30)
 */
export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 8; hour <= 22; hour++) {
    if (hour === 8) {
      slots.push('08:30')
    } else {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 22) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`)
      }
    }
  }
  slots.push('22:30')
  return slots
}
