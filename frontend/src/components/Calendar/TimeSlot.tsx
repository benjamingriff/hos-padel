import { useState } from 'react'
import { TimeSlot as TimeSlotType } from '../../types/api'
import SlotPopover from './SlotPopover'

interface TimeSlotProps {
  slot: TimeSlotType | null
  isLoading?: boolean
  slotIndex: number
  totalSlots: number
}

export default function TimeSlot({ slot, isLoading, slotIndex, totalSlots }: TimeSlotProps) {
  const [showPopover, setShowPopover] = useState(false)

  if (isLoading) {
    return (
      <div className="h-10 bg-surfaceMuted animate-pulse rounded border border-border" />
    )
  }

  if (!slot) {
    return (
      <div className="h-10 bg-background rounded border border-border border-dashed" />
    )
  }

  const availableCount = slot.courts.filter((c) => !c.is_booked).length
  const popoverPosition = slotIndex < totalSlots / 2 ? 'below' : 'above'

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopover(!showPopover)}
        className={`
          w-full h-10 rounded border text-xs font-medium transition-colors
          focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1
          ${
            slot.has_available_court
              ? 'bg-brandSoft border-brand/30 text-brand hover:bg-brand/20'
              : 'bg-surfaceMuted border-border text-textMuted hover:bg-surface'
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
        <SlotPopover slot={slot} onClose={() => setShowPopover(false)} position={popoverPosition} />
      )}
    </div>
  )
}
