import { useState } from 'react'
import { TimeSlot as TimeSlotType } from '../../types/api'
import SlotPopover from './SlotPopover'

interface TimeSlotProps {
  slot: TimeSlotType | null
  isLoading?: boolean
}

export default function TimeSlot({ slot, isLoading }: TimeSlotProps) {
  const [showPopover, setShowPopover] = useState(false)

  if (isLoading) {
    return (
      <div className="h-10 bg-gray-100 animate-pulse rounded border border-gray-200" />
    )
  }

  if (!slot) {
    return (
      <div className="h-10 bg-gray-50 rounded border border-gray-200 border-dashed" />
    )
  }

  const availableCount = slot.courts.filter((c) => !c.is_booked).length

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopover(!showPopover)}
        className={`
          w-full h-10 rounded border text-xs font-medium transition-colors
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
          ${
            slot.has_available_court
              ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
              : 'bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300'
          }
        `}
        aria-label={`${slot.start_time} - ${slot.end_time}: ${
          slot.has_available_court
            ? `${availableCount} courts available`
            : 'Fully booked'
        }`}
      >
        {slot.has_available_court ? `${availableCount} free` : 'Full'}
      </button>
      {showPopover && (
        <SlotPopover slot={slot} onClose={() => setShowPopover(false)} />
      )}
    </div>
  )
}
