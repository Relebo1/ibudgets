'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/SessionProvider'
import { LayoutDashboard, BookOpen, Brain, LogOut, DollarSign, Shield, FileText } from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { href: '/admin/lms', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/lms/modules', label: 'Modules', icon: BookOpen },
  { href: '/admin/lms/lessons', label: 'Lessons', icon: FileText },
  { href: '/admin/lms/quizzes', label: 'Quizzes', icon: Brain },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const t = setTimeout(() => {
      const stored = localStorage.getItem('ibudget-user')
      if (!stored) { router.replace('/login'); return }
      const u = JSON.parse(stored)
      if (!u.is_admin) router.replace('/dashboard')
    }, 100)
    return () => clearTimeout(t)
  }, [router])

  if (!user?.is_admin) return null

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0 py-6 px-4">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">iBudget</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 mb-6">
          <Shield className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map(item => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}
                className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'
                         : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100')}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 bg-brand-500 rounded-full" />}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <LayoutDashboard className="w-4 h-4" /> Back to App
          </Link>
          <button onClick={() => { logout(); router.push('/login') }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">Admin Panel</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{user.name}</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
