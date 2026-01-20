import { useMemo } from 'react'
import { isToday } from 'date-fns'
import DayColumn from './DayColumn'
import TimeAxis from './TimeAxis'
import { dateToKey } from '../../utils/dates'
import { WeekAvailability } from '../../types/api'

interface DayViewProps {
  date: Date
  availability: WeekAvailability
  isLoading?: boolean
}

export default function DayView({ date, availability, isLoading }: DayViewProps) {
  const key = useMemo(() => dateToKey(date), [date])
  const slots = availability.get(key) || []

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
      <div className="flex p-4 gap-2">
        <div className="flex-shrink-0 w-14">
          <TimeAxis />
        </div>
        <DayColumn
          date={date}
          slots={slots}
          isLoading={isLoading}
          isToday={isToday(date)}
        />
      </div>

      <div className="border-t border-border px-4 py-2 bg-surfaceMuted flex flex-wrap items-center gap-4 text-xs text-textMuted">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-brandSoft border border-brand/30 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-surface border border-border rounded" />
          <span>Fully booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-background border border-border border-dashed rounded" />
          <span>No data</span>
        </div>
      </div>
    </div>
  )
}
