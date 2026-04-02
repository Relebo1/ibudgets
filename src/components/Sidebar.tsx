'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import {
  LayoutDashboard, PieChart, CreditCard, PiggyBank,
  GraduationCap, User, Settings, LogOut, DollarSign, TrendingDown, FlaskConical, Wallet,
} from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/income', label: 'Income', icon: Wallet },
  { href: '/dashboard/budget', label: 'Budget', icon: PieChart },
  { href: '/dashboard/expenses', label: 'Expenses', icon: CreditCard },
  { href: '/dashboard/savings', label: 'Savings', icon: PiggyBank },
  { href: '/dashboard/debts', label: 'Debts', icon: TrendingDown },
  { href: '/dashboard/simulator', label: 'Simulator', icon: FlaskConical },
  { href: '/dashboard/modules', label: 'Learn', icon: GraduationCap },
]

const bottom = [
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useSession()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-screen sticky top-0 py-6 px-4">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">iBudget</span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Main</p>
        {nav.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100')}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <span className="ml-auto w-1.5 h-1.5 bg-brand-500 rounded-full" />}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-gray-100 dark:border-gray-800 pt-4">
        {bottom.map(item => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100')}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-150">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
