'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Pencil, BookMarked, X, ArrowLeft, AlertCircle, Youtube, Clock } from 'lucide-react'

const emptyLesson = (): any => ({
  module_id: 0,
  title: '',
  content: '',
  youtube_url: '',
  duration_minutes: 0,
  order_index: 0,
})

export default function LessonsPage() {
  const [modules, setModules] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState(emptyLesson())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/admin/modules')
      setModules(await res.json())
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  }

  const loadLessons = async (moduleId: number) => {
    try {
      const res = await fetch(`/api/admin/lessons?moduleId=${moduleId}`)
      setLessons(await res.json())
      setSelectedModule(moduleId)
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
    }
  }

  const openNew = (moduleId: number) => {
    setEditing(null)
    setForm({ ...emptyLesson(), module_id: moduleId })
    setError(null)
    setView('editor')
  }

  const openEdit = (lesson: any) => {
    setEditing(lesson)
    setForm(lesson)
    setError(null)
    setView('editor')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.content.trim()) { setError('Content is required'); return }

    setSaving(true)
    try {
      const body = {
        title: form.title,
        content: form.content,
        youtube_url: form.youtube_url,
        duration_minutes: Number(form.duration_minutes),
        order_index: Number(form.order_index),
      }

      if (editing) {
        await fetch('/api/admin/lessons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...body }),
        })
      } else {
        await fetch('/api/admin/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId: form.module_id, ...body }),
        })
      }

      if (selectedModule) await loadLessons(selectedModule)
      setView('list')
    } catch (err) {
      setError('Failed to save lesson')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/lessons?id=${id}`, { method: 'DELETE' })
      if (selectedModule) await loadLessons(selectedModule)
      setDeleteId(null)
    } catch (error) {
      console.error('Failed to delete lesson:', error)
    }
  }

  if (view === 'editor') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editing ? 'Edit Lesson' : 'New Lesson'}</h1>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Lesson Details</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Title <span className="text-red-400">*</span></label>
              <input className="input" placeholder="e.g. Introduction to Budgeting" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Duration (minutes)</label>
                <input className="input" type="number" min="0" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Order</label>
                <input className="input" type="number" min="0" value={form.order_index} onChange={e => setForm({ ...form, order_index: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Content</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Lesson Content <span className="text-red-400">*</span></label>
              <textarea className="input resize-none font-mono text-sm" rows={10} placeholder="Write your lesson content here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
              <p className="text-xs text-gray-400 mt-1">{form.content.length} characters</p>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Video (Optional)</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">YouTube URL</label>
              <input className="input" placeholder="https://www.youtube.com/watch?v=..." value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })} />
            </div>

            {form.youtube_url && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${(() => { const m = form.youtube_url.match(/(?:v=|youtu\.be\/)([^&?/]+)/); return m ? m[1] : form.youtube_url })()}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pb-8">
            <button type="button" onClick={() => setView('list')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Lesson'}</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lessons</h1>
        <p className="text-sm text-gray-400 mt-1">Create and manage lessons for your modules</p>
      </div>

      <div className="card p-5">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Select Module</label>
        <select className="input" value={selectedModule ?? ''} onChange={e => { const id = Number(e.target.value); if (id) loadLessons(id) }}>
          <option value="">Choose a module...</option>
          {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>

      {selectedModule && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{modules.find(m => m.id === selectedModule)?.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{lessons.length} lessons</p>
            </div>
            <button onClick={() => openNew(selectedModule)} className="btn-primary text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> New Lesson
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <BookMarked className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">No lessons yet</p>
              <p className="text-sm mb-5">Create your first lesson for this module</p>
              <button onClick={() => openNew(selectedModule)} className="btn-primary text-sm inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> New Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="card p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{idx + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{lesson.title}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <BookMarked className="w-3 h-3" /> {lesson.content.length} chars
                        </span>
                        {lesson.youtube_url && <span className="flex items-center gap-1 text-red-500"><Youtube className="w-3 h-3" /> Video</span>}
                        {lesson.duration_minutes > 0 && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration_minutes} min</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(lesson)} className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => setDeleteId(lesson.id)} className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-500 rounded-lg flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Delete Lesson?</h3>
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
