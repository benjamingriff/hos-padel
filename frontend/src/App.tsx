import { useState } from 'react'
import { startOfWeek, addWeeks } from 'date-fns'
import Header from './components/Layout/Header'
import WeekNav from './components/Navigation/WeekNav'
import WeekView from './components/Calendar/WeekView'
import { useAvailability } from './hooks/useAvailability'

function App() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [rentalLength] = useState<60 | 90>(60)

  const { data, isLoading, error } = useAvailability(weekStart, rentalLength)

  const goToPreviousWeek = () => {
    setWeekStart((prev) => addWeeks(prev, -1))
  }

  const goToNextWeek = () => {
    setWeekStart((prev) => addWeeks(prev, 1))
  }

  const goToToday = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <WeekNav
          weekStart={weekStart}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onToday={goToToday}
        />
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            Error loading availability: {error.message}
          </div>
        )}
        <WeekView
          weekStart={weekStart}
          availability={data}
          isLoading={isLoading}
        />
      </main>
    </div>
  )
}

export default App
