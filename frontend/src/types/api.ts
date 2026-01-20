export interface CourtStatus {
  court_id: number
  court_name: string
  is_booked: boolean
}

export interface TimeSlot {
  start_time: string  // "HH:MM"
  end_time: string    // "HH:MM"
  date: string        // "DD/MM/YYYY"
  has_available_court: boolean
  courts: CourtStatus[]
}

export interface AvailabilityResponse {
  date: string        // "DD-MM-YYYY"
  rental_length: number
  slots: TimeSlot[]
}

export type WeekAvailability = Map<string, TimeSlot[]>
