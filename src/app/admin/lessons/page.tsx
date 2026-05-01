'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Trash2, Pencil, BookOpen, ArrowLeft, AlertCircle, Youtube, Brain } from 'lucide-react'

type Lesson = {
  id: number
  module_id: number
  title: string
  description: string
  content: string
  youtube_url: string
  video_duration: string
  order_index: number
  quiz_count: number
}

const emptyLesson = (): Omit<Lesson, 'id' | 'quiz_count'> => ({
  module_id: 0,
  title: '',
  description: '',
  content: '',
  youtube_url: '',
  video_duration: '',
  order_index: 0,
})

export default function AdminLessonsPage() {
  const [modules, setModules] = useState<any[]>([])
  const [selectedModule, setSelectedModule] = useState<number | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [form, setForm] = useState(emptyLesson())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/modules').then(r => r.json()).then(setModules)
  }, [])

  const loadLessons = async (moduleId: number) => {
    setSelectedModule(moduleId)
    const res = await fetch(`/api/admin/lessons?moduleId=${moduleId}`)
    setLessons(await res.json())
  }

  const openNew = (moduleId: number) => {
    setEditingLesson(null)
    setForm({ ...emptyLesson(), module_id: moduleId })
    setError(null)
    setView('editor')
  }

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setForm(lesson)
    setError(null)
    setView('editor')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.title.trim()) { setError('Lesson title is required.'); return }
    if (!form.content.trim()) { setError('Lesson content is required.'); return }

    setSaving(true)
    try {
      const body = {
        title: form.title,
        description: form.description,
        content: form.content,
        youtube_url: form.youtube_url,
        video_duration: form.video_duration,
        order_index: form.order_index,
      }

      if (editingLesson) {
        await fetch('/api/admin/lessons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingLesson.id, ...body }),
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
    } catch {
      setError('Failed to save lesson.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/lessons?id=${id}`, { method: 'DELETE' })
    if (selectedModule) await loadLessons(selectedModule)
    setDeleteId(null)
  }

  // ── Editor view ────────────────────────────────────────────────────────────
  if (view === 'editor') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {editingLesson ? 'Edit Lesson' : 'New Lesson'}
          </h1>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic info */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Lesson Details</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input className="input" placeholder="e.g. Introduction to Budgeting"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Description
              </label>
              <textarea className="input resize-none" rows={2} placeholder="Brief description of this lesson..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Order <span className="text-gray-400 font-normal normal-case">(position in module)</span>
              </label>
              <input className="input" type="number" min="0" value={form.order_index}
                onChange={e => setForm(f => ({ ...f, order_index: Number(e.target.value) }))} />
            </div>
          </div>

          {/* Lesson content */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Lesson Content</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Written Content <span className="text-red-400">*</span>
                <span className="text-gray-400 font-normal normal-case ml-1">— educational text for students</span>
              </label>
              <textarea className="input resize-none font-mono text-sm" rows={8}
                placeholder="Write the lesson content here. You can use markdown formatting if needed..."
                value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              <p className="text-xs text-gray-400 mt-1">{form.content.length} characters</p>
            </div>
          </div>

          {/* Video */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Video Lesson</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                YouTube URL
              </label>
              <input className="input" placeholder="https://www.youtube.com/watch?v=..."
                value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} />
              <p className="text-xs text-gray-400 mt-1">Paste the full YouTube URL or just the video ID</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Video Duration
              </label>
              <input className="input" placeholder="e.g. 15 min"
                value={form.video_duration} onChange={e => setForm(f => ({ ...f, video_duration: e.target.value }))} />
            </div>

            {form.youtube_url && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${(() => {
                      const match = form.youtube_url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
                      return match ? match[1] : form.youtube_url
                    })()}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-3 pb-8">
            <button type="button" onClick={() => setView('list')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Saving...' : editingLesson ? 'Save Changes' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lessons</h1>
        <p className="text-sm text-gray-400 mt-1">Create and manage lessons for your modules</p>
      </div>

      {/* Module selector */}
      <div className="card p-5">
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Select Module
        </label>
        <select className="input" value={selectedModule ?? ''} onChange={e => {
          const id = Number(e.target.value)
          if (id) loadLessons(id)
        }}>
          <option value="">Choose a module...</option>
          {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>

      {selectedModule && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {modules.find(m => m.id === selectedModule)?.title}
              </h2>
              <p className="text-sm text-gray-400 mt-1">{lessons.length} lessons</p>
            </div>
            <button onClick={() => openNew(selectedModule)} className="btn-primary text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> New Lesson
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
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
                      {lesson.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lesson.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {lesson.content.length} chars
                        </span>
                        {lesson.youtube_url && (
                          <span className="flex items-center gap-1 text-red-500">
                            <Youtube className="w-3 h-3" /> Video
                          </span>
                        )}
                        {lesson.quiz_count > 0 && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <Brain className="w-3 h-3" /> {lesson.quiz_count} quiz
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEdit(lesson)}
                        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => setDeleteId(lesson.id)}
                        className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-500 rounded-lg flex items-center justify-center transition-all">
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

      {/* Delete confirm */}
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
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
