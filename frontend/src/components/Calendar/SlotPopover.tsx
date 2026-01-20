import { useEffect, useRef } from 'react'
import { TimeSlot } from '../../types/api'

interface SlotPopoverProps {
  slot: TimeSlot
  onClose: () => void
}

export default function SlotPopover({ slot, onClose }: SlotPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  const availableCount = slot.courts.filter((c) => !c.is_booked).length
  const totalCount = slot.courts.length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 w-56 bg-surface rounded-lg shadow-lg border border-border p-3 -translate-x-1/2 left-1/2 mt-1"
    >
      <div className="mb-2">
        <div className="font-medium text-textPrimary">
          {slot.start_time} - {slot.end_time}
        </div>
        <div className="text-sm text-textMuted">{slot.date}</div>
      </div>

      <div className="mb-2 text-sm font-medium text-textMuted">
        {availableCount} of {totalCount} courts available
      </div>

      <div className="space-y-1">
        {slot.courts.map((court) => (
          <div
            key={court.court_id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-textMuted">{court.court_name}</span>
            <span
              className={
                court.is_booked
                  ? 'text-red-400 font-medium'
                  : 'text-brand font-medium'
              }
            >
              {court.is_booked ? 'Booked' : 'Free'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
