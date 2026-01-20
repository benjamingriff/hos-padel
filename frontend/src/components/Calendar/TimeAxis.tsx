import { generateTimeSlots } from '../../utils/dates'

export default function TimeAxis() {
  const timeSlots = generateTimeSlots()

  return (
    <div className="flex flex-col">
      {/* Empty header cell to align with day headers */}
      <div className="h-10 flex items-end justify-end pr-2 pb-1">
        <span className="text-xs text-textMuted">Time</span>
      </div>
      {/* Time labels */}
      {timeSlots.map((time) => (
        <div
          key={time}
          className="h-10 flex items-center justify-end pr-2 text-xs text-textMuted"
        >
          {time}
        </div>
      ))}
    </div>
  )
}
