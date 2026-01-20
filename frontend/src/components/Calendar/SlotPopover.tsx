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
      className="absolute z-50 w-56 bg-white rounded-lg shadow-lg border border-gray-200 p-3 -translate-x-1/2 left-1/2 mt-1"
    >
      <div className="mb-2">
        <div className="font-medium text-gray-900">
          {slot.start_time} - {slot.end_time}
        </div>
        <div className="text-sm text-gray-500">{slot.date}</div>
      </div>

      <div className="mb-2 text-sm font-medium text-gray-700">
        {availableCount} of {totalCount} courts available
      </div>

      <div className="space-y-1">
        {slot.courts.map((court) => (
          <div
            key={court.court_id}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-600">{court.court_name}</span>
            <span
              className={
                court.is_booked
                  ? 'text-red-600 font-medium'
                  : 'text-green-600 font-medium'
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
