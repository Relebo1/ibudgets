'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Clock, Video, FileText } from 'lucide-react'
import { PageHeader, Card, Button, IconButton, Modal, FormGroup, Input, Textarea, Select, EmptyState, LoadingState, Section, Badge } from '@/components/admin/ui'

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null)
  const [form, setForm] = useState({ module_id: '', title: '', description: '', content: '', youtube_url: '', duration_minutes: 0, order_index: 0 })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
        body: JSON.stringify({ ...form, module_id: Number(form.module_id), duration_minutes: Number(form.duration_minutes), order_index: Number(form.order_index) }),
      })

      if (!res.ok) throw new Error('Failed to save')

      setForm({ module_id: '', title: '', description: '', content: '', youtube_url: '', duration_minutes: 0, order_index: 0 })
      setEditingId(null)
      setShowModal(false)
      setErrors({})

      const lessonsData = await fetch('/api/admin/lessons').then(r => r.json())
      setLessons(lessonsData)
    } catch (error) {
      setErrors({ submit: 'Error saving lesson' })
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

  const openCreateModal = () => {
    setEditingId(null)
    setForm({ module_id: '', title: '', description: '', content: '', youtube_url: '', duration_minutes: 0, order_index: 0 })
    setErrors({})
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lessons"
        description="Create and manage lesson content"
        action={<Button icon={Plus} onClick={openCreateModal}>New Lesson</Button>}
      />

      {loading ? (
        <LoadingState />
      ) : groupedLessons.every(m => m.lessons.length === 0) ? (
        <EmptyState
          icon={Plus}
          title="No lessons yet"
          description="Create your first lesson to get started"
          action={<Button icon={Plus} onClick={openCreateModal}>Create Lesson</Button>}
        />
      ) : (
        <div className="space-y-6">
          {groupedLessons.map(module => (
            module.lessons.length > 0 && (
              <Section key={module.id} title={module.title} description={`${module.lessons.length} lesson${module.lessons.length !== 1 ? 's' : ''}`}>
                <div className="space-y-3">
                  {module.lessons.map((lesson: any, idx: number) => (
                    <Card key={lesson.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">L{idx + 1}</span>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{lesson.title}</h4>
                          </div>
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            {lesson.duration_minutes > 0 && (
                              <Badge variant="default" size="sm">
                                <Clock className="w-3 h-3 mr-1" />
                                {lesson.duration_minutes} min
                              </Badge>
                            )}
                            {lesson.youtube_url && (
                              <Badge variant="default" size="sm">
                                <Video className="w-3 h-3 mr-1" />
                                Video
                              </Badge>
                            )}
                            {lesson.content && (
                              <Badge variant="default" size="sm">
                                <FileText className="w-3 h-3 mr-1" />
                                Content
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <IconButton icon={Edit2} onClick={() => handleEdit(lesson)} />
                          <IconButton icon={Trash2} variant="danger" onClick={() => handleDelete(lesson.id)} />
                          <button
                            onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            {expandedLesson === lesson.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {expandedLesson === lesson.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                          {lesson.description && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{lesson.description}</p>
                            </div>
                          )}
                          {lesson.content && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Content Preview</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{lesson.content}</p>
                            </div>
                          )}
                          {lesson.youtube_url && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">YouTube URL</p>
                              <p className="text-sm text-blue-600 dark:text-blue-400 truncate">{lesson.youtube_url}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </Section>
            )
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Lesson' : 'Create Lesson'}>
        <form onSubmit={handleSave} className="space-y-5">
          <FormGroup label="Module" required error={errors.module_id}>
            <Select
              value={form.module_id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, module_id: e.target.value })}
              options={[{ value: '', label: 'Select a module' }, ...modules.map(m => ({ value: m.id, label: m.title }))]}
              error={!!errors.module_id}
            />
          </FormGroup>

          <FormGroup label="Title" required error={errors.title}>
            <Input
              placeholder="e.g., Introduction to Budgeting"
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
              maxLength={150}
              error={!!errors.title}
            />
          </FormGroup>

          <FormGroup label="Description">
            <Textarea
              placeholder="Brief description of the lesson"
              rows={2}
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
              maxLength={500}
            />
          </FormGroup>

          <Section title="Content" description="Add lesson content and media">
            <FormGroup label="Content (Markdown supported)">
              <Textarea
                placeholder="Lesson content..."
                rows={4}
                value={form.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, content: e.target.value })}
                maxLength={5000}
              />
            </FormGroup>

            <FormGroup label="YouTube URL">
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.youtube_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, youtube_url: e.target.value })}
              />
            </FormGroup>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Duration (minutes)">
              <Input
                type="number"
                value={form.duration_minutes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                min="0"
                max="300"
              />
            </FormGroup>

            <FormGroup label="Order">
              <Input
                type="number"
                value={form.order_index}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, order_index: Number(e.target.value) })}
                min="0"
              />
            </FormGroup>
          </div>

          {errors.submit && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-200">{errors.submit}</div>}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
