'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, BookMarked, ChevronDown, ChevronUp } from 'lucide-react'

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null)
  const [form, setForm] = useState({ module_id: '', title: '', description: '', content: '', youtube_url: '', duration_minutes: 0, order_index: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/lessons').then(r => r.json()),
      fetch('/api/admin/modules').then(r => r.json()),
      fetch('/api/admin/quizzes').then(r => r.json()),
    ]).then(([lessonsData, modulesData, quizzesData]) => {
      setLessons(lessonsData)
      setModules(modulesData)
      setQuizzes(quizzesData)
      setLoading(false)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { alert('Title required'); return }
    if (!form.module_id) { alert('Module required'); return }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/lessons/${editingId}` : '/api/admin/lessons'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, module_id: Number(form.module_id), duration_minutes: Number(form.duration_minutes), order_index: Number(form.order_index) }),
      })

      if (!res.ok) throw new Error('Failed to save')

      setForm({ module_id: '', title: '', description: '', content: '', youtube_url: '', duration_minutes: 0, order_index: 0 })
      setEditingId(null)
      setShowModal(false)

      const lessonsData = await fetch('/api/admin/lessons').then(r => r.json())
      setLessons(lessonsData)
    } catch (error) {
      alert('Error saving lesson')
    }
  }

  const handleEdit = (lesson: any) => {
    setForm({ module_id: lesson.module_id, title: lesson.title, description: lesson.description, content: lesson.content, youtube_url: lesson.youtube_url, duration_minutes: lesson.duration_minutes, order_index: lesson.order_index })
    setEditingId(lesson.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lesson?')) return
    try {
      await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' })
      setLessons(lessons.filter(l => l.id !== id))
    } catch (error) {
      alert('Error deleting lesson')
    }
  }

  const groupedLessons = modules.map(m => ({
    ...m,
    lessons: lessons.filter(l => l.module_id === m.id).sort((a, b) => a.order_index - b.order_index)
  }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lessons</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage lesson content</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ module_id: '', title: '', description: '', content: '', youtube_url: '', duration_minutes: 0, order_index: 0 }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Lesson
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : groupedLessons.every(m => m.lessons.length === 0) ? (
        <div className="card p-12 text-center">
          <BookMarked className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No lessons yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedLessons.map(module => (
            module.lessons.length > 0 && (
              <div key={module.id} className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: module.color }} />
                  {module.title}
                </h2>
                <div className="space-y-2">
                  {module.lessons.map((lesson: any, idx: number) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{idx + 1}. {lesson.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {lesson.duration_minutes > 0 && <span>⏱️ {lesson.duration_minutes} min</span>}
                          {lesson.youtube_url && <span>🎥 Video</span>}
                          {lesson.content && <span>📝 Content</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <button onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          {expandedLesson === lesson.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleEdit(lesson)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button onClick={() => handleDelete(lesson.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Edit Lesson' : 'New Lesson'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Module <span className="text-red-500">*</span></label>
                <select className="input" value={form.module_id} onChange={e => setForm({ ...form, module_id: e.target.value })} required>
                  <option value="">Select a module</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input className="input" placeholder="e.g. Introduction to Budgeting" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={150} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea className="input resize-none" rows={2} placeholder="Brief description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
                <textarea className="input resize-none" rows={3} placeholder="Lesson content (markdown supported)" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} maxLength={5000} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">YouTube URL</label>
                <input className="input" placeholder="https://www.youtube.com/watch?v=..." value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (minutes)</label>
                  <input className="input" type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} min="0" max="300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Order</label>
                  <input className="input" type="number" value={form.order_index} onChange={e => setForm({ ...form, order_index: Number(e.target.value) })} min="0" />
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
