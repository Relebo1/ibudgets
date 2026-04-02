'use client'
import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { Calculator, TrendingUp, PiggyBank, CreditCard, Zap } from 'lucide-react'
import { fmt } from '@/lib/currency'
import { useSession } from '@/lib/SessionProvider'

type SimType = 'savings' | 'debt' | 'budget' | 'compound'

export default function SimulatorPage() {
  const { user } = useSession()
  const [active, setActive] = useState<SimType>('savings')

  // Savings goal sim
  const [savingsForm, setSavingsForm] = useState({ goal: '5000', monthly: '500', current: '0' })
  // Debt payoff sim
  const [debtForm, setDebtForm] = useState({ balance: '10000', rate: '12', monthly: '500' })
  // Budget 50/30/20 sim
  const [budgetForm, setBudgetForm] = useState({ income: '3000' })
  // Compound interest sim
  const [compoundForm, setCompoundForm] = useState({ principal: '1000', rate: '8', years: '10', monthly: '100' })

  // Pre-fill budget sim with real income
  useEffect(() => {
    if (!user) return
    fetch(`/api/income?userId=${user.id}`)
      .then(r => r.json())
      .then((data: any[]) => {
        const monthly = data.reduce((s, i) => {
          const amt = Number(i.amount)
          if (i.frequency === 'weekly') return s + amt * 4.33
          if (i.frequency === 'once') return s
          return s + amt
        }, 0)
        if (monthly > 0) setBudgetForm({ income: Math.round(monthly).toString() })
      })
  }, [user])

  // --- Savings projection ---
  const savingsData = (() => {
    const goal = Number(savingsForm.goal)
    const monthly = Number(savingsForm.monthly)
    let current = Number(savingsForm.current)
    const data = []
    let month = 0
    while (current < goal && month <= 120) {
      data.push({ month: `M${month}`, saved: Math.round(current) })
      current += monthly
      month++
    }
    data.push({ month: `M${month}`, saved: Math.min(Math.round(current), goal) })
    return { data, months: month, reachDate: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }
  })()

  // --- Debt payoff ---
  const debtData = (() => {
    let balance = Number(debtForm.balance)
    const rate = Number(debtForm.rate) / 100 / 12
    const monthly = Number(debtForm.monthly)
    const data = []
    let month = 0
    let totalInterest = 0
    while (balance > 0 && month <= 360) {
      const interest = balance * rate
      totalInterest += interest
      balance = Math.max(0, balance + interest - monthly)
      month++
      if (month % 3 === 0 || balance === 0) data.push({ month: `M${month}`, balance: Math.round(balance) })
    }
    return { data, months: month, totalInterest: Math.round(totalInterest) }
  })()

  // --- 50/30/20 budget ---
  const income = Number(budgetForm.income)
  const budgetBreakdown = [
    { label: 'Needs (50%)', amount: income * 0.5, color: '#22c55e', examples: 'Rent, food, transport, utilities' },
    { label: 'Wants (30%)', amount: income * 0.3, color: '#3b82f6', examples: 'Entertainment, dining out, hobbies' },
    { label: 'Savings (20%)', amount: income * 0.2, color: '#a855f7', examples: 'Emergency fund, goals, debt repayment' },
  ]

  // --- Compound interest ---
  const compoundData = (() => {
    const p = Number(compoundForm.principal)
    const r = Number(compoundForm.rate) / 100 / 12
    const years = Number(compoundForm.years)
    const monthly = Number(compoundForm.monthly)
    const data = []
    let balance = p
    for (let y = 0; y <= years; y++) {
      data.push({ year: `Y${y}`, balance: Math.round(balance), contributed: Math.round(p + monthly * 12 * y) })
      for (let m = 0; m < 12; m++) { balance = balance * (1 + r) + monthly }
    }
    return { data, final: Math.round(balance), totalContributed: Math.round(p + monthly * 12 * years), interest: Math.round(balance - p - monthly * 12 * years) }
  })()

  const tabs: { id: SimType; label: string; icon: React.ElementType }[] = [
    { id: 'savings', label: 'Savings Goal', icon: PiggyBank },
    { id: 'debt', label: 'Debt Payoff', icon: CreditCard },
    { id: 'budget', label: '50/30/20 Rule', icon: Calculator },
    { id: 'compound', label: 'Compound Interest', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Financial Simulator</h2>
        <p className="text-sm text-gray-400">Interactive what-if scenarios to plan your financial future</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${active === t.id ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Savings Goal Simulator */}
      {active === 'savings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"><PiggyBank className="w-5 h-5 text-brand-500" /> Savings Goal</h3>
            {[
              { label: 'Savings Goal (M)', key: 'goal', placeholder: '5000' },
              { label: 'Current Savings (M)', key: 'current', placeholder: '0' },
              { label: 'Monthly Contribution (M)', key: 'monthly', placeholder: '500' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                <input className="input" type="number" placeholder={f.placeholder}
                  value={savingsForm[f.key as keyof typeof savingsForm]}
                  onChange={e => setSavingsForm(p => ({ ...p, [f.key]: e.target.value }))} min="0" />
              </div>
            ))}
            <div className="p-4 bg-brand-50 dark:bg-brand-900/30 rounded-xl space-y-1">
              <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">You will reach your goal in</p>
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{savingsData.months} months</p>
              <p className="text-xs text-brand-600 dark:text-brand-400">Estimated: {savingsData.reachDate}</p>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Savings Projection</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={savingsData.data.filter((_, i) => i % Math.max(1, Math.floor(savingsData.data.length / 12)) === 0)}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `M${v}`} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Saved']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="saved" stroke="#22c55e" strokeWidth={2.5} fill="url(#sg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Debt Payoff Simulator */}
      {active === 'debt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"><CreditCard className="w-5 h-5 text-red-500" /> Debt Payoff</h3>
            {[
              { label: 'Debt Balance (M)', key: 'balance', placeholder: '10000' },
              { label: 'Annual Interest Rate (%)', key: 'rate', placeholder: '12' },
              { label: 'Monthly Payment (M)', key: 'monthly', placeholder: '500' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                <input className="input" type="number" placeholder={f.placeholder}
                  value={debtForm[f.key as keyof typeof debtForm]}
                  onChange={e => setDebtForm(p => ({ ...p, [f.key]: e.target.value }))} min="0" />
              </div>
            ))}
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Payoff time</span>
                <span className="font-bold text-red-600">{debtData.months} months</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total interest paid</span>
                <span className="font-bold text-orange-600">{fmt(debtData.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total paid</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(Number(debtForm.balance) + debtData.totalInterest)}</span>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Remaining Balance Over Time</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={debtData.data}>
                <defs>
                  <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `M${v}`} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Balance']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="balance" stroke="#ef4444" strokeWidth={2.5} fill="url(#dg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 50/30/20 Budget Rule */}
      {active === 'budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"><Calculator className="w-5 h-5 text-purple-500" /> 50/30/20 Rule</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Monthly Income (M)</label>
              <input className="input" type="number" placeholder="3000" value={budgetForm.income}
                onChange={e => setBudgetForm({ income: e.target.value })} min="0" />
            </div>
            <div className="space-y-3 pt-2">
              {budgetBreakdown.map(b => (
                <div key={b.label} className="p-4 rounded-xl" style={{ background: b.color + '15' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold" style={{ color: b.color }}>{b.label}</span>
                    <span className="text-lg font-bold" style={{ color: b.color }}>{fmt(b.amount)}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{b.examples}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Budget Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetBreakdown} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `M${v}`} />
                <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} width={90} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Amount']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                  {budgetBreakdown.map((b, i) => (
                    <rect key={i} fill={b.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">The 50/30/20 rule is a simple budgeting framework. Adjust percentages based on your personal situation — students may need to allocate more to needs.</p>
            </div>
          </div>
        </div>
      )}

      {/* Compound Interest Simulator */}
      {active === 'compound' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500" /> Compound Interest</h3>
            {[
              { label: 'Initial Investment (M)', key: 'principal', placeholder: '1000' },
              { label: 'Annual Return Rate (%)', key: 'rate', placeholder: '8' },
              { label: 'Monthly Contribution (M)', key: 'monthly', placeholder: '100' },
              { label: 'Investment Period (years)', key: 'years', placeholder: '10' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                <input className="input" type="number" placeholder={f.placeholder}
                  value={compoundForm[f.key as keyof typeof compoundForm]}
                  onChange={e => setCompoundForm(p => ({ ...p, [f.key]: e.target.value }))} min="0" />
              </div>
            ))}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Final balance</span>
                <span className="font-bold text-blue-600">{fmt(compoundData.final)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total contributed</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{fmt(compoundData.totalContributed)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Interest earned</span>
                <span className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{fmt(compoundData.interest)}</span>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Growth Over Time</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={compoundData.data}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `M${v}`} />
                <Tooltip formatter={(v: number, name: string) => [fmt(v), name === 'balance' ? 'Total Value' : 'Contributed']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="contributed" stroke="#9ca3af" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2.5} fill="url(#cg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
