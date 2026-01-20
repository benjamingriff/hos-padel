import { useEffect, useState } from 'react'
import { startOfWeek, addWeeks } from 'date-fns'
import Header from './components/Layout/Header'
import WeekNav from './components/Navigation/WeekNav'
import WeekView from './components/Calendar/WeekView'
import { useAvailability } from './hooks/useAvailability'

type Theme = 'light' | 'dark'

function App() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
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

  const { data, isLoading, error } = useAvailability(weekStart, rentalLength)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('hos-padel-theme', theme)
  }, [theme])

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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-surfaceMuted">
      <Header
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
      />
      <main className="max-w-7xl mx-auto px-4 py-6">
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
      </main>
    </div>
  )
}

export default App
