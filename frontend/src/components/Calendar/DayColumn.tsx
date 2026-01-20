import { TimeSlot as TimeSlotType } from '../../types/api'
import { formatDayHeader, generateTimeSlots } from '../../utils/dates'
import TimeSlot from './TimeSlot'

interface DayColumnProps {
  date: Date
  slots: TimeSlotType[]
  isLoading?: boolean
  isToday?: boolean
}

export default function DayColumn({
  date,
  slots,
  isLoading,
  isToday,
}: DayColumnProps) {
  const timeLabels = generateTimeSlots()

  // Create a map of start_time -> slot for quick lookup
  const slotsByTime = new Map<string, TimeSlotType>()
  for (const slot of slots) {
    slotsByTime.set(slot.start_time, slot)
  }

  return (
    <div className="flex flex-col flex-1 min-w-[80px]">
      {/* Day header */}
      <div
        className={`
          h-10 flex items-end justify-center pb-1 text-sm font-medium
          ${isToday ? 'text-brand' : 'text-textMuted'}
        `}
      >
        <span
          className={
            isToday
              ? 'bg-brand text-white px-2 py-0.5 rounded-full'
              : ''
          }
        >
          {formatDayHeader(date)}
        </span>
      </div>

      {/* Time slots */}
      <div className="flex flex-col gap-0.5">
        {timeLabels.map((time) => (
          <TimeSlot
            key={time}
            slot={slotsByTime.get(time) || null}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  )
}
