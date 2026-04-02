'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Trash2, Pencil, BookOpen } from 'lucide-react'

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444']

const empty = { title: '', description: '', youtube_url: '', category: '', duration: '30 min', difficulty: 'Beginner', xpReward: '100', lessons: '5', color: '#22c55e' }

export default function AdminModulesPage() {
  const [modules, setModules] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState(empty)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch('/api/admin/modules').then(r => r.json()).then(setModules)
  }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = (m: any) => {
    setEditing(m)
    setForm({ title: m.title, description: m.description, youtube_url: m.youtube_url ?? '', category: m.category, duration: m.duration, difficulty: m.difficulty, xpReward: String(m.xp_reward), lessons: String(m.lessons), color: m.color })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = { ...form, xpReward: Number(form.xpReward), lessons: Number(form.lessons) }
    if (editing) {
      const res = await fetch('/api/admin/modules', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...body }) })
      const updated = await res.json()
      setModules(prev => prev.map(m => m.id === editing.id ? updated : m))
    } else {
      const res = await fetch('/api/admin/modules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const created = await res.json()
      setModules(prev => [...prev, created])
    }
    setShowModal(false)
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/modules?id=${id}`, { method: 'DELETE' })
    setModules(prev => prev.filter(m => m.id !== id))
    setDeleteId(null)
  }

  const diffColor: Record<string, string> = {
    Beginner: 'bg-green-50 text-green-700 dark:bg-green-900/30',
    Intermediate: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30',
    Advanced: 'bg-red-50 text-red-700 dark:bg-red-900/30',
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Modules</h1>
          <p className="text-sm text-gray-400 mt-1">{modules.length} learning modules</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Module
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No modules yet</p>
          <p className="text-sm">Create your first learning module</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Module</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4 hidden sm:table-cell">Category</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4 hidden md:table-cell">Difficulty</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-4 hidden md:table-cell">XP</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {modules.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: m.color + '30' }}>
                        <div className="w-full h-full rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{m.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{m.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{m.category}</span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`badge ${diffColor[m.difficulty]}`}>{m.difficulty}</span>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-sm font-medium text-purple-600">+{m.xp_reward} XP</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(m)} className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/40 text-gray-500 hover:text-brand-600 rounded-lg flex items-center justify-center transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(m.id)} className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-500 rounded-lg flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{editing ? 'Edit Module' : 'New Module'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                <input className="input" placeholder="e.g. Budgeting Basics" value={form.title} onChange={e => set('title', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea className="input resize-none" rows={2} placeholder="Brief description..." value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">YouTube URL</label>
                <input className="input" placeholder="https://www.youtube.com/watch?v=..." value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <input className="input" placeholder="e.g. Budgeting" value={form.category} onChange={e => set('category', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration</label>
                  <input className="input" placeholder="e.g. 30 min" value={form.duration} onChange={e => set('duration', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">XP Reward</label>
                  <input className="input" type="number" placeholder="100" value={form.xpReward} onChange={e => set('xpReward', e.target.value)} min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lessons</label>
                  <input className="input" type="number" placeholder="5" value={form.lessons} onChange={e => set('lessons', e.target.value)} min="1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => set('color', c)}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editing ? 'Save Changes' : 'Create Module'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Delete Module?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This will also delete all associated quizzes and questions.</p>
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
