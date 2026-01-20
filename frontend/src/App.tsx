import { useEffect, useState } from 'react'
import { startOfWeek, addWeeks, addDays } from 'date-fns'
import Header from './components/Layout/Header'
import WeekNav from './components/Navigation/WeekNav'
import DayNav from './components/Navigation/DayNav'
import WeekView from './components/Calendar/WeekView'
import DayView from './components/Calendar/DayView'
import { useAvailability } from './hooks/useAvailability'

type Theme = 'light' | 'dark'

type TouchState = {
  startX: number
  startY: number
  startTime: number
}

function App() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [rentalLength] = useState<60 | 90>(60)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const stored = localStorage.getItem('hos-padel-theme') as Theme | null
    if (stored) {
      return stored
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })
  const [touchState, setTouchState] = useState<TouchState | null>(null)

  const { data, isLoading, error } = useAvailability(weekStart, rentalLength)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('hos-padel-theme', theme)
  }, [theme])

  useEffect(() => {
    setWeekStart(startOfWeek(selectedDate, { weekStartsOn: 1 }))
  }, [selectedDate])

  const goToPreviousWeek = () => {
    setWeekStart((prev) => addWeeks(prev, -1))
  }

  const goToNextWeek = () => {
    setWeekStart((prev) => addWeeks(prev, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setWeekStart(startOfWeek(today, { weekStartsOn: 1 }))
    setSelectedDate(today)
  }

  const goToPreviousDay = () => {
    setSelectedDate((prev) => addDays(prev, -1))
  }

  const goToNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1))
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    })
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchState) {
      return
    }

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchState.startX
    const deltaY = touch.clientY - touchState.startY
    const elapsed = Date.now() - touchState.startTime

    setTouchState(null)

    const isHorizontalSwipe =
      Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY)
    const isQuickEnough = elapsed < 500

    if (!isHorizontalSwipe || !isQuickEnough) {
      return
    }

    if (deltaX < 0) {
      goToNextDay()
    } else {
      goToPreviousDay()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-surfaceMuted">
      <Header
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
      />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="sm:hidden">
          <DayNav
            date={selectedDate}
            onPreviousDay={goToPreviousDay}
            onNextDay={goToNextDay}
            onToday={goToToday}
          />
          <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <DayView
              date={selectedDate}
              availability={data}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="hidden sm:block">
          <WeekNav
            weekStart={weekStart}
            onPreviousWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onToday={goToToday}
          />
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 text-red-600 dark:text-red-300 rounded-md border border-red-500/30">
              Error loading availability: {error.message}
            </div>
          )}
          <WeekView
            weekStart={weekStart}
            availability={data}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  )
}

export default App
