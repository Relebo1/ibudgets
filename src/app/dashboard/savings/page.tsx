'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, X, CheckCircle, PlusCircle } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'
import { fmt } from '@/lib/currency'

export default function SavingsPage() {
  const { user } = useSession()
  const [goals, setGoals] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [depositGoalId, setDepositGoalId] = useState<number | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#22c55e', category: 'General' })

  useEffect(() => {
    if (!user) return
    fetch(`/api/savings?userId=${user.id}`).then(r => r.json()).then(setGoals)
  }, [user])

  if (!user) return null

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0)
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, name: form.name, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount || 0), deadline: form.deadline, color: form.color, category: form.category }),
    })
    const newGoal = await res.json()
    setGoals(prev => [...prev, newGoal])
    setShowModal(false)
    setForm({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#22c55e', category: 'General' })
  }

  const handleDeposit = async () => {
    if (!depositGoalId || !depositAmount) return
    const goal = goals.find(g => g.id === depositGoalId)
    const newAmount = Math.min(Number(goal.current_amount) + Number(depositAmount), Number(goal.target_amount))
    const res = await fetch('/api/savings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: depositGoalId, currentAmount: newAmount }),
    })
    const updated = await res.json()
    setGoals(prev => prev.map(g => g.id === depositGoalId ? { ...g, current_amount: updated.current_amount } : g))
    setDepositGoalId(null)
    setDepositAmount('')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{fmt(totalSaved)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Saved</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{fmt(totalTarget)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Target</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalTarget > 0 ? Math.round(totalSaved / totalTarget * 100) : 0}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall Progress</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Savings Goals</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="text-lg font-medium mb-1">No savings goals yet</p>
          <p className="text-sm">Create your first goal to start saving</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((g: any) => {
            const pct = g.target_amount > 0 ? Math.min(Math.round(g.current_amount / g.target_amount * 100), 100) : 0
            const done = pct === 100
            return (
              <div key={g.id} className="card card-hover p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: g.color + '20' }}>
                      <div className="w-4 h-4 rounded-full" style={{ background: g.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{g.name}</p>
                      <p className="text-xs text-gray-400">{g.category} · Due {g.deadline?.split('T')[0] ?? g.deadline}</p>
                    </div>
                  </div>
                  {done && <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Done</span>}
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{fmt(g.current_amount)}</span>
                  <span className="text-gray-400">of {fmt(g.target_amount)}</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: done ? '#22c55e' : g.color }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: g.color }}>{pct}% complete</span>
                  {!done && (
                    <button onClick={() => setDepositGoalId(g.id)}
                      className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <PlusCircle className="w-3.5 h-3.5" /> Deposit
                    </button>
                  )}
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">New Savings Goal</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Goal Name</label>
                <input className="input" placeholder="e.g. New Laptop" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target (M)</label>
                  <input className="input" type="number" placeholder="1000" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} required min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current (M)</label>
                  <input className="input" type="number" placeholder="0" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline</label>
                  <input className="input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <input className="input" placeholder="General" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
                <input className="input h-10 p-1 cursor-pointer" type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-5 sm:p-6 shadow-2xl">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Add Deposit</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Goal: <strong className="text-gray-900 dark:text-gray-100">{goals.find(g => g.id === depositGoalId)?.name}</strong></p>
            <input className="input mb-4" type="number" placeholder="Amount (M)" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} min="1" />
            <div className="flex gap-3">
              <button onClick={() => setDepositGoalId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDeposit} className="btn-primary flex-1">Deposit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
