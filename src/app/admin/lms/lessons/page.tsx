'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, BookMarked, Play, FileText, Layers } from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'

const LESSON_TYPES = ['Video', 'Written', 'Mixed']

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    module_id: '',
    title: '',
    lesson_type: 'Mixed',
    content: '',
    youtube_url: '',
    duration_minutes: 0,
    order_index: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/lessons').then(r => r.json()),
      fetch('/api/admin/modules').then(r => r.json()),
    ]).then(([lessonsData, modulesData]) => {
      setLessons(lessonsData)
      setModules(modulesData)
      setLoading(false)
    })
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.module_id) newErrors.module_id = 'Module is required'
    if (!form.lesson_type) newErrors.lesson_type = 'Lesson type is required'

    if (form.lesson_type === 'Video') {
      if (!form.youtube_url?.trim()) newErrors.youtube_url = 'Video URL is required for Video lessons'
    } else if (form.lesson_type === 'Written') {
      if (!form.content?.trim()) newErrors.content = 'Content is required for Written lessons'
    } else if (form.lesson_type === 'Mixed') {
      if (!form.content?.trim()) newErrors.content = 'Content is required for Mixed lessons'
      if (!form.youtube_url?.trim()) newErrors.youtube_url = 'Video URL is required for Mixed lessons'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/lessons/${editingId}` : '/api/admin/lessons'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          module_id: Number(form.module_id),
          duration_minutes: Number(form.duration_minutes),
          order_index: Number(form.order_index)
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        setErrors({ submit: error.error || 'Failed to save lesson' })
        return
      }

      setForm({
        module_id: '',
        title: '',
        lesson_type: 'Mixed',
        content: '',
        youtube_url: '',
        duration_minutes: 0,
        order_index: 0
      })
      setErrors({})
      setEditingId(null)
      setShowModal(false)

      const lessonsData = await fetch('/api/admin/lessons').then(r => r.json())
      setLessons(lessonsData)
    } catch (error) {
      setErrors({ submit: 'Error saving lesson' })
    }
  }

  const handleEdit = (lesson: any) => {
    setForm({
      module_id: lesson.module_id,
      title: lesson.title,
      lesson_type: lesson.lesson_type || 'Mixed',
      content: lesson.content || '',
      youtube_url: lesson.youtube_url || '',
      duration_minutes: lesson.duration_minutes || 0,
      order_index: lesson.order_index || 0
    })
    setErrors({})
    setEditingId(lesson.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this lesson? This action cannot be undone.')) return
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

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Play className="w-4 h-4" />
      case 'Written': return <FileText className="w-4 h-4" />
      case 'Mixed': return <Layers className="w-4 h-4" />
      default: return null
    }
  }

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'Video': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
      case 'Written': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
      case 'Mixed': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
      default: return ''
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Lessons Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage lesson content with dynamic types</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setForm({
              module_id: '',
              title: '',
              lesson_type: 'Mixed',
              content: '',
              youtube_url: '',
              duration_minutes: 0,
              order_index: 0
            })
            setErrors({})
            setShowModal(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Lesson
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading lessons...</div>
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
                  <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-auto">
                    {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div className="space-y-2">
                  {module.lessons.map((lesson: any, idx: number) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-brand-600 dark:text-brand-400 font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{lesson.title}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getLessonTypeColor(lesson.lesson_type)}`}>
                              {getLessonTypeIcon(lesson.lesson_type)}
                              {lesson.lesson_type}
                            </span>
                            {lesson.duration_minutes > 0 && (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                                ⏱️ {lesson.duration_minutes} min
                              </span>
                            )}
                            {lesson.content && (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                                📝 Content
                              </span>
                            )}
                            {lesson.youtube_url && (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                                🎥 Video
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit lesson"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete lesson"
                        >
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
          <div className="card w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {editingId ? 'Edit Lesson' : 'Create New Lesson'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Module <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`input ${errors.module_id ? 'border-red-500' : ''}`}
                    value={form.module_id}
                    onChange={e => {
                      setForm({ ...form, module_id: e.target.value })
                      setErrors({ ...errors, module_id: '' })
                    }}
                    required
                  >
                    <option value="">Select a module</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                  {errors.module_id && <p className="text-xs text-red-500 mt-1">{errors.module_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Lesson Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`input ${errors.lesson_type ? 'border-red-500' : ''}`}
                    value={form.lesson_type}
                    onChange={e => {
                      setForm({ ...form, lesson_type: e.target.value })
                      setErrors({ ...errors, lesson_type: '', content: '', youtube_url: '' })
                    }}
                    required
                  >
                    {LESSON_TYPES.map(type => <option key={type}>{type}</option>)}
                  </select>
                  {errors.lesson_type && <p className="text-xs text-red-500 mt-1">{errors.lesson_type}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  className={`input ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="e.g. Introduction to Budgeting"
                  value={form.title}
                  onChange={e => {
                    setForm({ ...form, title: e.target.value })
                    setErrors({ ...errors, title: '' })
                  }}
                  maxLength={150}
                  required
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/150</p>
              </div>

              {(form.lesson_type === 'Written' || form.lesson_type === 'Mixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Content {(form.lesson_type === 'Written' || form.lesson_type === 'Mixed') && <span className="text-red-500">*</span>}
                  </label>
                  <RichTextEditor
                    value={form.content}
                    onChange={content => {
                      setForm({ ...form, content })
                      setErrors({ ...errors, content: '' })
                    }}
                    placeholder="Enter lesson content (supports markdown)"
                    maxLength={5000}
                  />
                  {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
                </div>
              )}

              {(form.lesson_type === 'Video' || form.lesson_type === 'Mixed') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    YouTube URL {(form.lesson_type === 'Video' || form.lesson_type === 'Mixed') && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    className={`input ${errors.youtube_url ? 'border-red-500' : ''}`}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    value={form.youtube_url}
                    onChange={e => {
                      setForm({ ...form, youtube_url: e.target.value })
                      setErrors({ ...errors, youtube_url: '' })
                    }}
                  />
                  {errors.youtube_url && <p className="text-xs text-red-500 mt-1">{errors.youtube_url}</p>}
                  <p className="text-xs text-gray-400 mt-1">Paste full YouTube URL or video ID</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Duration (minutes)
                  </label>
                  <input
                    className="input"
                    type="number"
                    value={form.duration_minutes}
                    onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    min="0"
                    max="300"
                  />
                  <p className="text-xs text-gray-400 mt-1">Optional</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Order (Position)
                  </label>
                  <input
                    className="input"
                    type="number"
                    value={form.order_index}
                    onChange={e => setForm({ ...form, order_index: Number(e.target.value) })}
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingId ? 'Update Lesson' : 'Create Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
