'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import {
  Bell, LayoutDashboard, PieChart, CreditCard, PiggyBank,
  GraduationCap, Brain, AlertTriangle, Info, CheckCircle,
  Sun, Moon, TrendingDown, FlaskConical, Wallet, MoreHorizontal,
  User, Settings, LogOut, DollarSign, X,
} from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'
import { useTheme } from '@/lib/ThemeProvider'

const titles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/income': 'Income',
  '/dashboard/budget': 'Budget',
  '/dashboard/expenses': 'Expenses',
  '/dashboard/savings': 'Savings',
  '/dashboard/debts': 'Debts',
  '/dashboard/simulator': 'Simulator',
  '/dashboard/modules': 'Learn',
  '/dashboard/quizzes': 'Quizzes',
  '/dashboard/profile': 'Profile',
  '/dashboard/settings': 'Settings',
}

// Primary 5 shown in bottom bar
const primaryNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/income', icon: Wallet, label: 'Income' },
  { href: '/dashboard/expenses', icon: CreditCard, label: 'Expenses' },
  { href: '/dashboard/savings', icon: PiggyBank, label: 'Savings' },
]

// All nav items shown in "More" drawer
const allNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/income', icon: Wallet, label: 'Income' },
  { href: '/dashboard/budget', icon: PieChart, label: 'Budget' },
  { href: '/dashboard/expenses', icon: CreditCard, label: 'Expenses' },
  { href: '/dashboard/savings', icon: PiggyBank, label: 'Savings' },
  { href: '/dashboard/debts', icon: TrendingDown, label: 'Debts' },
  { href: '/dashboard/simulator', icon: FlaskConical, label: 'Simulator' },
  { href: '/dashboard/modules', icon: GraduationCap, label: 'Learn' },
  { href: '/dashboard/quizzes', icon: Brain, label: 'Quizzes' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const notifIcons: Record<string, React.ElementType> = {
  warning: AlertTriangle, info: Info, success: CheckCircle,
}
const notifColors: Record<string, string> = {
  warning: 'text-orange-500', info: 'text-blue-500', success: 'text-brand-500',
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useSession()
  const { logout } = useSession()
  const [notifOpen, setNotifOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const { isDark, setTheme } = useTheme()

  const notifications = [
    { id: 1, text: "You're 85% through your Food budget!", time: '2h ago', type: 'warning' },
    { id: 2, text: 'New module available: Tax Basics', time: '1d ago', type: 'info' },
    { id: 3, text: 'Quiz completed! +100 XP earned', time: '2d ago', type: 'success' },
  ]

  const handleLogout = () => { logout(); router.push('/login') }

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {titles[pathname] ?? 'iBudget'}
          </h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors"
            aria-label="Toggle dark mode">
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
          </button>

          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl flex items-center justify-center transition-colors">
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-11 w-72 sm:w-80 card shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <p className="font-semibold text-sm dark:text-gray-100">Notifications</p>
                    <button onClick={() => setNotifOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
                  </div>
                  {notifications.map(n => {
                    const NIcon = notifIcons[n.type]
                    return (
                      <div key={n.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer flex items-start gap-3">
                        <NIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${notifColors[n.type]}`} />
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{n.text}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <Link href="/dashboard/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
              {user?.avatar ?? '?'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">{user?.name?.split(' ')[0] ?? 'User'}</p>
              <p className="text-xs text-gray-400">Level {user?.level ?? 1}</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile bottom nav — 4 primary + More */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex safe-area-pb">
        {primaryNav.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={clsx('flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors min-w-0',
                active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500')}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          )
        })}
        <button onClick={() => setMoreOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-400 dark:text-gray-500">
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* More drawer */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl p-6 pb-10 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-gray-900 dark:text-gray-100">iBudget</span>
              </div>
              <button onClick={() => setMoreOpen(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {allNav.map(item => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)}
                    className={clsx('flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all',
                      active ? 'bg-brand-50 dark:bg-brand-900/40' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700')}>
                    <Icon className={clsx('w-5 h-5', active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400')} />
                    <span className={clsx('text-[10px] font-medium text-center leading-tight', active ? 'text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400')}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 font-medium text-sm">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  )
}
