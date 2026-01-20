interface HeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="bg-surface/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-textMuted">
            House of Sport
          </p>
          <h1 className="text-xl font-semibold text-textPrimary">
            Padel Availability
          </h1>
        </div>
        <button
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surfaceMuted px-4 py-2 text-sm font-medium text-textPrimary shadow-sm transition hover:bg-surface"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <span className="text-base">
            {theme === 'light' ? '🌙' : '☀️'}
          </span>
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </div>
    </header>
  )
}
