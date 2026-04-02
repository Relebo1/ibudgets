'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Trash2, CreditCard, Banknote } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'
import { fmt } from '@/lib/currency'

export default function ExpensesPage() {
  const { user } = useSession()
  const [expenses, setExpenses] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({ description: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'Card' })

  useEffect(() => {
    if (!user) return
    fetch(`/api/expenses?userId=${user.id}`).then(r => r.json()).then(setExpenses)
    fetch(`/api/budgets?userId=${user.id}`).then(r => r.json()).then(data => {
      setBudgets(data)
      if (data.length > 0) setForm(f => ({ ...f, category: data[0].category }))
    })
  }, [user])

  if (!user) return null

  const categories = ['All', ...Array.from(new Set(expenses.map((e: any) => e.category)))]
  const filtered = filter === 'All' ? expenses : expenses.filter((e: any) => e.category === filter)
  const total = filtered.reduce((s: number, e: any) => s + Number(e.amount), 0)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...form, amount: Number(form.amount) }),
    })
    const newExp = await res.json()
    setExpenses(prev => [newExp, ...prev])
    setShowModal(false)
    setForm({ description: '', category: budgets[0]?.category ?? '', amount: '', date: new Date().toISOString().split('T')[0], paymentMethod: 'Card' })
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' })
    setExpenses(prev => prev.filter((e: any) => e.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Expense Tracker</h2>
          <p className="text-sm text-gray-400">{filtered.length} transactions · Total: {fmt(total)}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0 ${filter === cat ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No expenses yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Description</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4 hidden sm:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Method</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Amount</th>
                  <th className="px-4 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{exp.description}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{exp.category}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{exp.date?.split('T')[0] ?? exp.date}</td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {exp.payment_method === 'Card' ? <CreditCard className="w-3.5 h-3.5 text-blue-500" /> : <Banknote className="w-3.5 h-3.5 text-green-500" />}
                        <span className={`badge ${exp.payment_method === 'Card' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40' : 'bg-green-50 text-green-600 dark:bg-green-950/40'}`}>{exp.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">-{fmt(exp.amount)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => setDeleteId(exp.id)}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-500 rounded-lg flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add Expense</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <input className="input" placeholder="What did you spend on?" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  {budgets.length > 0 ? (
                    <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {budgets.map((b: any) => <option key={b.id}>{b.category}</option>)}
                    </select>
                  ) : (
                    <input className="input" placeholder="Category" value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (M)</label>
                  <input className="input" type="number" step="0.01" placeholder="0.00" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="0.01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
                  <input className="input" type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment</label>
                  <select className="input" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
                    <option>Card</option><option>Cash</option><option>Transfer</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-5 sm:p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Delete Expense?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
