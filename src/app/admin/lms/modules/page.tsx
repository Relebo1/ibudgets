'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, BookOpen } from 'lucide-react'

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444']
const CATEGORIES = ['Budgeting', 'Saving', 'Investing', 'Debt Management', 'Financial Planning', 'Banking', 'Credit', 'Taxes']

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'Budgeting', difficulty: 'Beginner', color: '#22c55e' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/admin/modules')
      const data = await res.json()
      setModules(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { alert('Title required'); return }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/modules/${editingId}` : '/api/admin/modules'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to save')

      setForm({ title: '', description: '', category: 'Budgeting', difficulty: 'Beginner', color: '#22c55e' })
      setEditingId(null)
      setShowModal(false)
      fetchModules()
    } catch (error) {
      alert('Error saving module')
    }
  }

  const handleEdit = (module: any) => {
    setForm({ title: module.title, description: module.description, category: module.category, difficulty: module.difficulty, color: module.color })
    setEditingId(module.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this module?')) return
    try {
      await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' })
      fetchModules()
    } catch (error) {
      alert('Error deleting module')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Modules</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage learning modules</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ title: '', description: '', category: 'Budgeting', difficulty: 'Beginner', color: '#22c55e' }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Module
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : modules.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No modules yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(m => (
            <div key={m.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: m.color + '20' }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(m)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{m.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{m.category}</p>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">{m.difficulty}</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">{m.lesson_count} lessons</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Edit Module' : 'New Module'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input className="input" placeholder="e.g. Budgeting Basics" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={150} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea className="input resize-none" rows={2} placeholder="Brief overview" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
