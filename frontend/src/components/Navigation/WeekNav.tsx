import { addDays } from 'date-fns'
import { formatWeekNavDate } from '../../utils/dates'

interface WeekNavProps {
  weekStart: Date
  onPreviousWeek: () => void
  onNextWeek: () => void
  onToday: () => void
}

export default function WeekNav({
  weekStart,
  onPreviousWeek,
  onNextWeek,
  onToday,
}: WeekNavProps) {
  const weekEnd = addDays(weekStart, 6)

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousWeek}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Previous week"
        >
          &larr;
        </button>
        <button
          onClick={onNextWeek}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Next week"
        >
          &rarr;
        </button>
      </div>

      <div className="text-lg font-medium text-gray-900">
        {formatWeekNavDate(weekStart)} - {formatWeekNavDate(weekEnd)}
      </div>

      <button
        onClick={onToday}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Today
      </button>
    </div>
  )
}
