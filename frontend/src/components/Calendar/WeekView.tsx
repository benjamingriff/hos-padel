import { isToday } from 'date-fns'
import { WeekAvailability } from '../../types/api'
import { getWeekDates, dateToKey } from '../../utils/dates'
import TimeAxis from './TimeAxis'
import DayColumn from './DayColumn'

interface WeekViewProps {
  weekStart: Date
  availability: WeekAvailability
  isLoading?: boolean
}

export default function WeekView({
  weekStart,
  availability,
  isLoading,
}: WeekViewProps) {
  const weekDates = getWeekDates(weekStart)

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-soft overflow-hidden">
      <div className="flex p-4 gap-1 overflow-x-auto">
        {/* Time axis on the left */}
        <div className="flex-shrink-0 w-14">
          <TimeAxis />
        </div>

        {/* Day columns */}
        {weekDates.map((date) => {
          const key = dateToKey(date)
          const slots = availability.get(key) || []

          return (
            <DayColumn
              key={key}
              date={date}
              slots={slots}
              isLoading={isLoading}
              isToday={isToday(date)}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-border px-4 py-2 bg-surfaceMuted flex items-center gap-4 text-xs text-textMuted">
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
