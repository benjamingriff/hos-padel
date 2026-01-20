import { formatDayNavDate } from '../../utils/dates'

interface DayNavProps {
  date: Date
  onPreviousDay: () => void
  onNextDay: () => void
  onToday: () => void
}

export default function DayNav({
  date,
  onPreviousDay,
  onNextDay,
  onToday,
}: DayNavProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface/80 p-3 shadow-soft">
      <div className="flex items-center justify-between">
        <button
          onClick={onPreviousDay}
          className="px-3 py-2 text-sm font-medium text-textMuted bg-surfaceMuted border border-border rounded-full hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
          aria-label="Previous day"
        >
          &larr;
        </button>

        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-textMuted">
            Day view
          </div>
          <div className="text-base font-semibold text-textPrimary">
            {formatDayNavDate(date)}
          </div>
        </div>

        <button
          onClick={onNextDay}
          className="px-3 py-2 text-sm font-medium text-textMuted bg-surfaceMuted border border-border rounded-full hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand"
          aria-label="Next day"
        >
          &rarr;
        </button>
      </div>

      <button
        onClick={onToday}
        className="px-3 py-2 text-sm font-medium text-textPrimary bg-brandSoft rounded-full border border-brand/20 hover:bg-brand/20 focus:outline-none focus:ring-2 focus:ring-brand"
      >
        Today
      </button>
    </div>
  )
}
