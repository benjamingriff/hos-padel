import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const getStoredTheme = () =>
  localStorage.getItem('hos-padel-theme') as 'light' | 'dark' | null

const getPreferredTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const applyTheme = (theme: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

const initialTheme = getStoredTheme() ?? getPreferredTheme()
applyTheme(initialTheme)

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
