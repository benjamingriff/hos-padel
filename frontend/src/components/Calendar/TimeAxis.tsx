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
      <div className="flex flex-col gap-0.5">
        {timeSlots.map((time, index) => {
          const isLast = index === timeSlots.length - 1

          return (
            <div
              key={time}
              className="h-10 flex flex-col items-end justify-start pr-2 text-[11px] text-textMuted leading-none"
            >
              <span>{time.endsWith(':00') ? time : ''}</span>
              {isLast ? <span className="mt-auto">23:00</span> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
