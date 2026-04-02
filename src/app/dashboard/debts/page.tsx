'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Trash2, TrendingDown, AlertCircle, CheckCircle, PlusCircle } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'
import { fmt } from '@/lib/currency'

const CATEGORIES = ['Loan', 'Student Loan', 'Credit Card', 'Family Debt', 'Bank Overdraft', 'Other']
const COLORS = ['#ef4444', '#f97316', '#a855f7', '#3b82f6', '#ec4899', '#14b8a6']

export default function DebtsPage() {
  const { user } = useSession()
  const [debts, setDebts] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [payId, setPayId] = useState<number | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '', lender: '', totalAmount: '', interestRate: '',
    monthlyPayment: '', dueDate: '', category: 'Loan', color: '#ef4444',
  })

  useEffect(() => {
    if (!user) return
    fetch(`/api/debts?userId=${user.id}`).then(r => r.json()).then(setDebts)
  }, [user])

  if (!user) return null

  const totalDebt = debts.reduce((s, d) => s + Number(d.remaining), 0)
  const totalOriginal = debts.reduce((s, d) => s + Number(d.total_amount), 0)
  const totalPaid = totalOriginal - totalDebt
  const paidPct = totalOriginal > 0 ? Math.round(totalPaid / totalOriginal * 100) : 0

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/debts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...form, totalAmount: Number(form.totalAmount), interestRate: Number(form.interestRate || 0), monthlyPayment: Number(form.monthlyPayment || 0) }),
    })
    const newDebt = await res.json()
    setDebts(prev => [...prev, newDebt])
    setShowModal(false)
    setForm({ name: '', lender: '', totalAmount: '', interestRate: '', monthlyPayment: '', dueDate: '', category: 'Loan', color: '#ef4444' })
  }

  const handlePayment = async () => {
    if (!payId || !payAmount) return
    const debt = debts.find(d => d.id === payId)
    const newRemaining = Math.max(0, Number(debt.remaining) - Number(payAmount))
    const res = await fetch('/api/debts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: payId, remaining: newRemaining }),
    })
    const updated = await res.json()
    setDebts(prev => prev.map(d => d.id === payId ? { ...d, remaining: updated.remaining } : d))
    setPayId(null)
    setPayAmount('')
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/debts?id=${id}`, { method: 'DELETE' })
    setDebts(prev => prev.filter(d => d.id !== id))
    setDeleteId(null)
  }

  const monthsLeft = (debt: any) => {
    if (!debt.monthly_payment || debt.monthly_payment <= 0) return '—'
    return Math.ceil(debt.remaining / debt.monthly_payment) + ' months'
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-red-500">{fmt(totalDebt)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Remaining</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{fmt(totalPaid)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Paid Off</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-purple-600">{paidPct}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall Progress</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Debt Tracker</h2>
          <p className="text-sm text-gray-400">{debts.length} active debt{debts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Debt
        </button>
      </div>

      {debts.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <TrendingDown className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium mb-1">No debts recorded</p>
          <p className="text-sm">Track loans, credit cards, and other debts here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {debts.map((d: any) => {
            const pct = d.total_amount > 0 ? Math.min(Math.round((d.total_amount - d.remaining) / d.total_amount * 100), 100) : 0
            const paid = pct === 100
            return (
              <div key={d.id} className="card card-hover p-5 group relative">
                <button onClick={() => setDeleteId(d.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-500 rounded-lg flex items-center justify-center transition-all">
                  <X className="w-3 h-3" />
                </button>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: d.color + '20' }}>
                    <TrendingDown className="w-5 h-5" style={{ color: d.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{d.name}</p>
                      {paid && <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-400">{d.category}{d.lender ? ` · ${d.lender}` : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
                    <p className="font-bold text-red-500">{fmt(d.remaining)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Original</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{fmt(d.total_amount)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Interest Rate</p>
                    <p className="font-bold text-orange-600">{d.interest_rate}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Est. Payoff</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{monthsLeft(d)}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Paid off</span>
                    <span style={{ color: d.color }}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: paid ? '#22c55e' : d.color }} />
                  </div>
                </div>

                {!paid && (
                  <button onClick={() => setPayId(d.id)}
                    className="w-full py-2 rounded-xl text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-1.5">
                    <PlusCircle className="w-4 h-4" /> Make Payment
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Tip card */}
      <div className="card p-5 border-orange-100 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">Debt Management Tip</p>
            <p className="text-xs text-orange-700 dark:text-orange-400">Use the <strong>avalanche method</strong> — pay minimums on all debts, then put extra money toward the highest interest rate debt first. This saves the most money over time.</p>
          </div>
        </div>
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Add Debt</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Debt Name</label>
                <input className="input" placeholder="e.g. Student Loan" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lender</label>
                  <input className="input" placeholder="e.g. NMDS" value={form.lender} onChange={e => setForm(f => ({ ...f, lender: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total Amount (M)</label>
                  <input className="input" type="number" placeholder="0.00" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} required min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Interest Rate (%)</label>
                  <input className="input" type="number" step="0.01" placeholder="0.00" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Monthly Payment (M)</label>
                  <input className="input" type="number" placeholder="0.00" value={form.monthlyPayment} onChange={e => setForm(f => ({ ...f, monthlyPayment: e.target.value }))} min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date</label>
                  <input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
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
                <button type="submit" className="btn-primary flex-1">Add Debt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {payId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-5 sm:p-6 shadow-2xl">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Make Payment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Debt: <strong className="text-gray-900 dark:text-gray-100">{debts.find(d => d.id === payId)?.name}</strong>
              <br />Remaining: <strong className="text-red-500">{fmt(debts.find(d => d.id === payId)?.remaining)}</strong>
            </p>
            <input className="input mb-4" type="number" placeholder="Payment amount (M)" value={payAmount} onChange={e => setPayAmount(e.target.value)} min="1" />
            <div className="flex gap-3">
              <button onClick={() => setPayId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handlePayment} className="btn-primary flex-1">Pay</button>
            </div>
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
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Remove Debt?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This will permanently remove this debt record.</p>
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
