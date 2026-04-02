'use client'
import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'
import { fmt } from '@/lib/currency'

export default function BudgetPage() {
  const { user } = useSession()
  const [budgets, setBudgets] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ category: '', allocated: '', color: '#22c55e' })

  useEffect(() => {
    if (!user) return
    fetch(`/api/budgets?userId=${user.id}`).then(r => r.json()).then(setBudgets)
  }, [user])

  if (!user) return null

  const totalAllocated = budgets.reduce((s, b) => s + Number(b.allocated), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent), 0)
  const remaining = totalAllocated - totalSpent

  const month = new Date().toISOString().slice(0, 7)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, category: form.category, allocated: Number(form.allocated), color: form.color, month }),
    })
    const newBudget = await res.json()
    setBudgets(prev => [...prev, newBudget])
    setShowModal(false)
    setForm({ category: '', allocated: '', color: '#22c55e' })
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/budgets?id=${id}`, { method: 'DELETE' })
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Budget', value: fmt(totalAllocated), color: 'text-gray-900 dark:text-gray-100' },
          { label: 'Total Spent', value: fmt(totalSpent), color: 'text-orange-600' },
          { label: 'Remaining', value: fmt(remaining), color: remaining >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="card p-5 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Budget Categories</h2>
          <p className="text-sm text-gray-400">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-lg font-medium mb-1">No budget categories yet</p>
          <p className="text-sm">Add your first category to start tracking</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((b: any) => {
            const pct = b.allocated > 0 ? Math.min(Math.round(b.spent / b.allocated * 100), 100) : 0
            const over = b.spent > b.allocated
            return (
              <div key={b.id} className="card card-hover p-5 group relative">
                <button onClick={() => handleDelete(b.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-500 rounded-lg flex items-center justify-center transition-all">
                  <X className="w-3 h-3" />
                </button>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-10 rounded-full flex-shrink-0" style={{ background: b.color }} />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{b.category}</p>
                      <p className="text-xs text-gray-400">{fmt(b.spent)} of {fmt(b.allocated)}</p>
                    </div>
                  </div>
                  <span className={`badge ${over ? 'bg-red-50 text-red-600 dark:bg-red-950/40' : pct >= 80 ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/40' : 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: over ? '#ef4444' : b.color }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400">Spent</span>
                  <span className="text-xs font-medium" style={{ color: over ? '#ef4444' : b.color }}>
                    {b.allocated - b.spent >= 0 ? `${fmt(b.allocated - b.spent)} left` : `${fmt(b.spent - b.allocated)} over`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add Budget Category</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category Name</label>
                <input className="input" placeholder="e.g. Food & Dining" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Monthly Budget (M)</label>
                <input className="input" type="number" placeholder="0.00" value={form.allocated}
                  onChange={e => setForm(f => ({ ...f, allocated: e.target.value }))} required min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
                <input className="input h-10 p-1 cursor-pointer" type="color" value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
