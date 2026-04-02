'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { useSession } from '@/lib/SessionProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      // Give SessionProvider time to rehydrate from localStorage
      const t = setTimeout(() => {
        const stored = localStorage.getItem('ibudget-user')
        if (!stored) router.replace('/login')
      }, 100)
      return () => clearTimeout(t)
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 pb-28 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
