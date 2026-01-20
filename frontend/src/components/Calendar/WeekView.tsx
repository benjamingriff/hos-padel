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
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded" />
          <span>Fully booked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 border-dashed rounded" />
          <span>No data</span>
        </div>
      </div>
    </div>
  )
}
