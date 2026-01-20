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
    <div className="flex flex-col gap-4 mb-6 rounded-2xl border border-border bg-surface/80 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousWeek}
          className="px-3 py-2 text-sm font-medium text-textMuted bg-surfaceMuted border border-border rounded-full hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
          aria-label="Previous week"
        >
          &larr;
        </button>
        <button
          onClick={onNextWeek}
          className="px-3 py-2 text-sm font-medium text-textMuted bg-surfaceMuted border border-border rounded-full hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
          aria-label="Next week"
        >
          &rarr;
        </button>
      </div>

      <div className="text-lg font-semibold text-textPrimary">
        {formatWeekNavDate(weekStart)} - {formatWeekNavDate(weekEnd)}
      </div>

      <button
        onClick={onToday}
        className="px-4 py-2 text-sm font-medium text-textPrimary bg-brandSoft rounded-full border border-brand/20 hover:bg-brand/20 focus:outline-none focus:ring-2 focus:ring-brand"
      >
        Today
      </button>
    </div>
  )
}
