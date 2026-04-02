'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  isDark: boolean
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  isDark: false,
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function resolveIsDark(theme: Theme): boolean {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem('ibudget-theme') as Theme) || 'light'
    setThemeState(stored)
    const dark = resolveIsDark(stored)
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('ibudget-theme', t)
    const dark = resolveIsDark(t)
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
