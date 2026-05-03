'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { PageHeader, Card, Button, IconButton, Modal, FormGroup, Input, Textarea, Select, EmptyState, LoadingState, Badge } from '@/components/admin/ui'

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const CATEGORIES = ['Budgeting', 'Saving', 'Investing', 'Debt Management', 'Financial Planning', 'Banking', 'Credit', 'Taxes']

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'Budgeting', difficulty: 'Beginner' })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.category.trim()) newErrors.category = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/modules/${editingId}` : '/api/admin/modules'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to save')

      setForm({ title: '', description: '', category: 'Budgeting', difficulty: 'Beginner' })
      setEditingId(null)
      setShowModal(false)
      setErrors({})
      fetchModules()
    } catch (error) {
      setErrors({ submit: 'Error saving module' })
    }
  }

  const handleEdit = (module: any) => {
    setForm({ title: module.title, description: module.description, category: module.category, difficulty: module.difficulty })
    setEditingId(module.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this module? All lessons and quizzes will be removed.')) return
    try {
      await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' })
      fetchModules()
    } catch (error) {
      alert('Error deleting module')
    }
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm({ title: '', description: '', category: 'Budgeting', difficulty: 'Beginner' })
    setErrors({})
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modules"
        description="Create and manage learning modules"
        action={<Button icon={Plus} onClick={openCreateModal}>New Module</Button>}
      />

      {loading ? (
        <LoadingState />
      ) : modules.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No modules yet"
          description="Create your first module to get started"
          action={<Button icon={Plus} onClick={openCreateModal}>Create Module</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(m => (
            <Card key={m.id} hover>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{m.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{m.category}</p>
                </div>
                <div className="flex gap-1">
                  <IconButton icon={Edit2} onClick={() => handleEdit(m)} />
                  <IconButton icon={Trash2} variant="danger" onClick={() => handleDelete(m.id)} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Badge variant="default" size="sm">{m.difficulty}</Badge>
                <Badge variant="default" size="sm">{m.lesson_count || 0} lessons</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Module' : 'Create Module'}>
        <form onSubmit={handleSave} className="space-y-5">
          <FormGroup label="Title" required error={errors.title}>
            <Input
              placeholder="e.g., Budgeting Basics"
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
              maxLength={150}
              error={!!errors.title}
            />
          </FormGroup>

          <FormGroup label="Description">
            <Textarea
              placeholder="Brief overview of the module"
              rows={3}
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
              maxLength={500}
            />
          </FormGroup>

          <FormGroup label="Category" required error={errors.category}>
            <Select
              value={form.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, category: e.target.value })}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              error={!!errors.category}
            />
          </FormGroup>

          <FormGroup label="Difficulty">
            <Select
              value={form.difficulty}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, difficulty: e.target.value })}
              options={DIFFICULTIES.map(d => ({ value: d, label: d }))}
            />
          </FormGroup>

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
