'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Pencil, BookOpen, X, ChevronRight } from 'lucide-react'

const CATEGORIES = ['Budgeting', 'Saving', 'Investing', 'Debt Management', 'Financial Planning', 'Banking', 'Credit', 'Taxes']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444']

const emptyModule = { title: '', description: '', category: 'Budgeting', difficulty: 'Beginner', xpReward: '100', color: '#22c55e' }

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([])
  const [lessonCounts, setLessonCounts] = useState<Record<number, number>>({})
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyModule)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/admin/modules')
      const data = await res.json()
      setModules(data)
      
      const lessonsRes = await fetch('/api/admin/lessons')
      const lessons = await lessonsRes.json()
      const counts: Record<number, number> = {}
      lessons.forEach((lesson: any) => {
        counts[lesson.module_id] = (counts[lesson.module_id] || 0) + 1
      })
      setLessonCounts(counts)
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { alert('Title is required'); return }
    if (!form.category) { alert('Category is required'); return }

    const body = { ...form, xpReward: Number(form.xpReward) }
    
    try {
      if (editing) {
        await fetch('/api/admin/modules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...body }),
        })
      } else {
        await fetch('/api/admin/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      await fetchModules()
      setShowModal(false)
      setForm(emptyModule)
      setEditing(null)
    } catch (error) {
      console.error('Failed to save module:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/modules?id=${id}`, { method: 'DELETE' })
      await fetchModules()
      setDeleteId(null)
    } catch (error) {
      console.error('Failed to delete module:', error)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyModule)
    setShowModal(true)
  }

  const openEdit = (m: any) => {
    setEditing(m)
    setForm({
      title: m.title,
      description: m.description,
      category: m.category,
      difficulty: m.difficulty,
      xpReward: String(m.xp_reward),
      color: m.color,
    })
    setShowModal(true)
  }

  const diffColor: Record<string, string> = {
    Beginner: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Intermediate: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Advanced: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Modules</h1>
          <p className="text-sm text-gray-400 mt-1">{modules.length} modules</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Module
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No modules yet</p>
          <p className="text-sm">Create your first module to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map(m => (
            <div key={m.id} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: m.color + '20' }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: m.color }} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(m)} className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/40 text-gray-500 hover:text-brand-600 rounded-lg flex items-center justify-center transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(m.id)} className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-500 rounded-lg flex items-center justify-center transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{m.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{m.description}</p>

              <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{m.category}</span>
                <span className={`badge ${diffColor[m.difficulty]}`}>{m.difficulty}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <span>+{m.xp_reward} XP</span>
                <span>{lessonCounts[m.id] || 0} lessons</span>
              </div>

              <Link href={`/admin/lms/modules/${m.id}`} className="w-full py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1 transition-colors">
                View <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{editing ? 'Edit Module' : 'New Module'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input className="input" placeholder="e.g. Budgeting Basics" value={form.title} onChange={e => set('title', e.target.value)} maxLength={150} required />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/150</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea className="input resize-none" rows={3} placeholder="Brief overview" value={form.description} onChange={e => set('description', e.target.value)} maxLength={500} />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/500</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select className="input" value={form.category} onChange={e => set('category', e.target.value)} required>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">XP Reward <span className="text-red-500">*</span></label>
                <input className="input" type="number" value={form.xpReward} onChange={e => set('xpReward', e.target.value)} min="10" max="1000" required />
                <p className="text-xs text-gray-400 mt-1">10-1000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => set('color', c)} className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`} style={{ background: c }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This will delete all associated lessons and quizzes.</p>
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
