'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Trash2, Banknote, TrendingUp } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'
import { fmt } from '@/lib/currency'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CATEGORIES = ['Scholarship', 'Allowance', 'Part-time Job', 'Family Support', 'Freelance', 'Bursary', 'Other']
const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'once', label: 'Once-off' },
]
const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#ec4899', '#14b8a6', '#f59e0b']

export default function IncomePage() {
  const { user } = useSession()
  const [income, setIncome] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({
    source: '', category: 'Scholarship', amount: '',
    frequency: 'monthly', date: new Date().toISOString().split('T')[0], color: '#22c55e',
  })

  useEffect(() => {
    if (!user) return
    fetch(`/api/income?userId=${user.id}`).then(r => r.json()).then(setIncome)
  }, [user])

  if (!user) return null

  // Normalise all to monthly equivalent
  const toMonthly = (item: any) => {
    const amt = Number(item.amount)
    if (item.frequency === 'weekly') return amt * 4.33
    if (item.frequency === 'once') return 0
    return amt
  }

  const monthlyTotal = income.reduce((s, i) => s + toMonthly(i), 0)
  const onceOffTotal = income.filter(i => i.frequency === 'once').reduce((s, i) => s + Number(i.amount), 0)

  // Group by category for chart
  const chartData = CATEGORIES
    .map(cat => ({
      category: cat,
      amount: income.filter(i => i.category === cat).reduce((s, i) => s + toMonthly(i), 0),
      color: income.find(i => i.category === cat)?.color ?? '#e5e7eb',
    }))
    .filter(d => d.amount > 0)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...form, amount: Number(form.amount) }),
    })
    const newIncome = await res.json()
    setIncome(prev => [newIncome, ...prev])
    setShowModal(false)
    setForm({ source: '', category: 'Scholarship', amount: '', frequency: 'monthly', date: new Date().toISOString().split('T')[0], color: '#22c55e' })
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/income?id=${id}`, { method: 'DELETE' })
    setIncome(prev => prev.filter(i => i.id !== id))
    setDeleteId(null)
  }

  const freqLabel = (f: string) => FREQUENCIES.find(x => x.value === f)?.label ?? f

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{fmt(monthlyTotal)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Monthly Income</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-blue-600">{fmt(monthlyTotal * 12)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Annual Income</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-purple-600">{income.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Income Sources</p>
        </div>
      </div>

      {/* 50/30/20 quick breakdown */}
      {monthlyTotal > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Your 50/30/20 Breakdown</h3>
            <span className="text-xs text-gray-400">based on {fmt(monthlyTotal)}/month</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Needs (50%)', amount: monthlyTotal * 0.5, color: '#22c55e', desc: 'Rent, food, transport' },
              { label: 'Wants (30%)', amount: monthlyTotal * 0.3, color: '#3b82f6', desc: 'Entertainment, dining' },
              { label: 'Savings (20%)', amount: monthlyTotal * 0.2, color: '#a855f7', desc: 'Goals, emergency fund' },
            ].map(b => (
              <div key={b.label} className="p-4 rounded-xl text-center" style={{ background: b.color + '15' }}>
                <p className="text-xl font-bold" style={{ color: b.color }}>{fmt(b.amount)}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: b.color }}>{b.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Income by Source (Monthly)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `M${v}`} />
              <Tooltip formatter={(v: number) => [fmt(v), 'Monthly']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Income Sources</h2>
          <p className="text-sm text-gray-400">{income.length} source{income.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Income
        </button>
      </div>

      {income.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Banknote className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium mb-1">No income recorded yet</p>
          <p className="text-sm">Add your scholarship, allowance, or job income to get started</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Source</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4 hidden sm:table-cell">Category</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Frequency</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Date</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Amount</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {income.map((inc: any) => (
                <tr key={inc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: inc.color + '20' }}>
                        <Banknote className="w-4 h-4" style={{ color: inc.color }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{inc.source}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{inc.category}</span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`badge ${inc.frequency === 'monthly' ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400' : inc.frequency === 'weekly' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
                      {freqLabel(inc.frequency)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {inc.date?.split('T')[0] ?? inc.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div>
                      <span className="text-sm font-bold text-brand-600 dark:text-brand-400">+{fmt(inc.amount)}</span>
                      {inc.frequency !== 'once' && (
                        <p className="text-xs text-gray-400">{fmt(toMonthly(inc))}/mo</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button onClick={() => setDeleteId(inc.id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-500 rounded-lg flex items-center justify-center transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {onceOffTotal > 0 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Once-off income (not in monthly total)</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{fmt(onceOffTotal)}</span>
            </div>
          )}
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add Income Source</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Source Name</label>
                <input className="input" placeholder="e.g. NMDS Scholarship" value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Frequency</label>
                  <select className="input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                    {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (M)</label>
                  <input className="input" type="number" step="0.01" placeholder="0.00" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date Received</label>
                  <input className="input" type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Income</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-5 sm:p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Remove Income Source?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This will permanently remove this income record.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
