'use client'
import { createContext, useContext, useState, useEffect } from 'react'

export interface SessionUser {
  id: number
  name: string
  email: string
  school: string
  major: string
  year: string
  avatar: string
  xp: number
  level: number
  streak: number
  monthly_budget: number
  total_saved: number
  total_spent: number
  is_admin: number
}

interface SessionContextValue {
  user: SessionUser | null
  setUser: (u: SessionUser | null) => void
  logout: () => void
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  setUser: () => {},
  logout: () => {},
})

export function useSession() {
  return useContext(SessionContext)
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ibudget-user')
    if (stored) setUserState(JSON.parse(stored))
  }, [])

  const setUser = (u: SessionUser | null) => {
    setUserState(u)
    if (u) localStorage.setItem('ibudget-user', JSON.stringify(u))
    else localStorage.removeItem('ibudget-user')
  }

  const logout = () => setUser(null)

  return (
    <SessionContext.Provider value={{ user, setUser, logout }}>
      {children}
    </SessionContext.Provider>
  )
}
