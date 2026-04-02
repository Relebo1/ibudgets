'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { PieChart as PieIcon, Banknote, CreditCard, Zap, Trophy, ArrowRight, Flame, Wallet } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'
import { fmt } from '@/lib/currency'
import BudgetAlerts from '@/components/BudgetAlerts'

const spendingTrend = [
  { month: 'Feb', spent: 0 }, { month: 'Mar', spent: 0 }, { month: 'Apr', spent: 0 },
  { month: 'May', spent: 0 }, { month: 'Jun', spent: 0 }, { month: 'Jul', spent: 0 },
]

export default function DashboardPage() {
  const { user } = useSession()
  const [budgets, setBudgets] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [savings, setSavings] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [income, setIncome] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    fetch(`/api/budgets?userId=${user.id}`).then(r => r.json()).then(setBudgets)
    fetch(`/api/expenses?userId=${user.id}`).then(r => r.json()).then(setExpenses)
    fetch(`/api/savings?userId=${user.id}`).then(r => r.json()).then(setSavings)
    fetch(`/api/modules?userId=${user.id}`).then(r => r.json()).then(setModules)
    fetch(`/api/income?userId=${user.id}`).then(r => r.json()).then(setIncome)
  }, [user])

  if (!user) return null

  const totalBudget = budgets.reduce((s: number, b: any) => s + Number(b.allocated), 0)
  const totalSpent = budgets.reduce((s: number, b: any) => s + Number(b.spent), 0)
  const totalSaved = savings.reduce((s: number, g: any) => s + Number(g.current_amount), 0)
  const monthlyIncome = income.reduce((s: number, i: any) => {
    const amt = Number(i.amount)
    if (i.frequency === 'weekly') return s + amt * 4.33
    if (i.frequency === 'once') return s
    return s + amt
  }, 0)
  const completedModules = modules.filter((m: any) => m.completed).length
  const recentExpenses = expenses.slice(0, 5)
  const xpProgress = (user.xp % 500) / 500 * 100

  const summaryCards = [
    { label: 'Monthly Income', value: fmt(monthlyIncome), sub: `${income.length} source${income.length !== 1 ? 's' : ''}`, Icon: Wallet, color: 'from-brand-400 to-brand-600', href: '/dashboard/income' },
    { label: 'Total Saved', value: fmt(totalSaved), sub: `${savings.length} active goals`, Icon: Banknote, color: 'from-blue-400 to-blue-600', href: '/dashboard/savings' },
    { label: 'This Month Spent', value: fmt(totalSpent), sub: `${totalBudget ? Math.round(totalSpent / totalBudget * 100) : 0}% of budget`, Icon: CreditCard, color: 'from-orange-400 to-orange-600', href: '/dashboard/expenses' },
    { label: 'Learning XP', value: user.xp.toLocaleString(), sub: `Level ${user.level} · ${user.streak} day streak`, Icon: Zap, color: 'from-purple-400 to-purple-600', href: '/dashboard/modules' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <BudgetAlerts />
      {/* Welcome banner */}
      <div className="card p-4 sm:p-6 bg-gradient-to-r from-brand-500 to-emerald-400 border-0 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="absolute rounded-full border-2 border-white"
              style={{ width: `${(i+1)*100}px`, height: `${(i+1)*100}px`, right: `-${i*20}px`, top: '50%', transform: 'translateY(-50%)' }} />
          ))}
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">Good morning</p>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-white/70 text-sm mt-1">{user.major} · {user.year} · {user.school}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-2xl px-4 py-3">
            <Flame className="w-5 h-5 text-orange-300" />
            <div className="text-right">
              <div className="text-2xl font-bold leading-none">{user.streak}</div>
              <div className="text-white/70 text-xs">day streak</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-white/80">Level {user.level} Progress</span>
            <span className="text-white/80">{user.xp % 500}/500 XP</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {summaryCards.map(card => (
          <Link key={card.label} href={card.href} className="card card-hover p-5 flex flex-col gap-3 cursor-pointer">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
              <card.Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Spending Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendingTrend}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `M${v}`} />
              <Tooltip formatter={(v: number) => [`M${v}`, 'Spent']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="spent" stroke="#22c55e" strokeWidth={2.5} fill="url(#spendGrad)" dot={{ fill: '#22c55e', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Budget Breakdown</h3>
          <p className="text-xs text-gray-400 mb-4">This month</p>
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
              <PieIcon className="w-8 h-8 mb-2 opacity-30" />
              No budgets yet
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <PieChart width={140} height={140}>
                  <Pie data={budgets} dataKey="spent" cx={65} cy={65} innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {budgets.map((b: any, i: number) => <Cell key={i} fill={b.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2">
                {budgets.slice(0, 4).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{b.category.split(' ')[0]}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{fmt(b.spent)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Expenses</h3>
            <Link href="/dashboard/expenses" className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-gray-400 text-sm">
              <CreditCard className="w-7 h-7 mb-2 opacity-30" />
              No expenses yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((exp: any) => (
                <div key={exp.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{exp.description}</p>
                    <p className="text-xs text-gray-400">{exp.category} · {exp.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">-{fmt(exp.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Learning Progress</h3>
            <Link href="/dashboard/modules" className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mb-4 p-3 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center gap-3">
            <Trophy className="w-6 h-6 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">{completedModules}/{modules.length} Modules Complete</p>
              <p className="text-xs text-brand-600 dark:text-brand-400">{modules.length ? Math.round(completedModules / modules.length * 100) : 0}% of curriculum finished</p>
            </div>
          </div>
          <div className="space-y-3">
            {modules.slice(0, 4).map((m: any) => (
              <div key={m.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{m.title}</span>
                  <span className="text-xs text-gray-400">{m.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.progress}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
