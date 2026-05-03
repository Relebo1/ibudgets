'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { SectionHeader, ProgressIndicator, OptionGrid, StickyActionBar, CollapsibleSection } from '@/components/admin/enhanced-ui'
import { Button, IconButton, FormGroup, Textarea } from '@/components/admin/ui'
import { DESIGN_SYSTEM, cn } from '@/lib/design-system'

interface Question {
  id: number
  question: string
  options: string[]
  correct_index: number
  explanation: string
  order_index: number
}

interface QuestionManagerProps {
  quizId: number
}

export function QuestionManager({ quizId }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_index: 0,
    explanation: '',
    order_index: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

  useEffect(() => {
    fetchQuestions()
  }, [quizId])

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`)
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!form.question.trim()) newErrors.question = 'Question is required'
    if (form.options.some(o => !o.trim())) newErrors.options = 'All options must be filled'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setAutoSaveStatus('saving')

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = `/api/admin/quizzes/${quizId}/questions`

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, questionId: editingId }),
      })

      if (!res.ok) throw new Error('Failed to save')

      setForm({ question: '', options: ['', '', '', ''], correct_index: 0, explanation: '', order_index: 0 })
      setEditingId(null)
      setShowForm(false)
      setErrors({})
      setAutoSaveStatus('saved')
      fetchQuestions()

      // Reset autosave status after 2 seconds
      setTimeout(() => setAutoSaveStatus('saved'), 2000)
    } catch (error) {
      setAutoSaveStatus('error')
      setErrors({ submit: 'Error saving question' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this question?')) return
    try {
      await fetch(`/api/admin/quizzes/${quizId}/questions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: id }),
      })
      fetchQuestions()
    } catch (error) {
      alert('Error deleting question')
    }
  }

  const handleEdit = (q: Question) => {
    setForm({ question: q.question, options: q.options, correct_index: q.correct_index, explanation: q.explanation, order_index: q.order_index })
    setEditingId(q.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm({ question: '', options: ['', '', '', ''], correct_index: 0, explanation: '', order_index: 0 })
    setErrors({})
  }

  const filledCount = questions.length
  const totalCount = questions.length + (showForm ? 1 : 0)
  const errorCount = Object.keys(errors).length

  return (
    <div className={DESIGN_SYSTEM.layout.sectionSpacing}>
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Questions" count={questions.length} />
          {!showForm && (
            <Button icon={Plus} size="sm" onClick={() => setShowForm(true)}>
              Add Question
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        {questions.length > 0 && (
          <ProgressIndicator current={filledCount} total={totalCount} errors={errorCount} />
        )}
      </div>

      {/* Questions List */}
      <div className={DESIGN_SYSTEM.layout.itemSpacing}>
        {questions.length === 0 && !showForm ? (
          <div className={cn(DESIGN_SYSTEM.card.base, 'p-8 text-center')}>
            <p className={DESIGN_SYSTEM.typography.body}>No questions yet. Add one to get started.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <CollapsibleSection
              key={q.id}
              title={`Q${idx + 1}: ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}`}
              isOpen={false}
              onToggle={() => {}}
            >
              <div className="space-y-4">
                <div>
                  <p className={cn(DESIGN_SYSTEM.typography.label, 'mb-2')}>Question</p>
                  <p className={DESIGN_SYSTEM.typography.body}>{q.question}</p>
                </div>

                <div>
                  <p className={cn(DESIGN_SYSTEM.typography.label, 'mb-2')}>Options</p>
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-2 rounded-lg text-sm',
                          i === q.correct_index
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium'
                            : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300'
                        )}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>

                {q.explanation && (
                  <div>
                    <p className={cn(DESIGN_SYSTEM.typography.label, 'mb-2')}>Explanation</p>
                    <p className={DESIGN_SYSTEM.typography.body}>{q.explanation}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <IconButton icon={Edit2} onClick={() => handleEdit(q)} />
                  <IconButton icon={Trash2} variant="danger" onClick={() => handleDelete(q.id)} />
                </div>
              </div>
            </CollapsibleSection>
          ))
        )}
      </div>

      {/* Question Form */}
      {showForm && (
        <div className={cn(DESIGN_SYSTEM.card.base, 'p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800')}>
          <form onSubmit={handleSave} className={DESIGN_SYSTEM.layout.sectionSpacing}>
            <div>
              <h4 className={DESIGN_SYSTEM.typography.cardTitle}>
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h4>
            </div>

            <FormGroup label="Question" required error={errors.question}>
              <Textarea
                placeholder="Enter your question"
                rows={2}
                value={form.question}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, question: e.target.value })}
                error={!!errors.question}
              />
            </FormGroup>

            <div>
              <FormGroup label="Options" required error={errors.options}>
                <OptionGrid
                  options={form.options}
                  correctIndex={form.correct_index}
                  onChange={(i, val) => {
                    const newOpts = [...form.options]
                    newOpts[i] = val
                    setForm({ ...form, options: newOpts })
                  }}
                  onCorrectChange={i => setForm({ ...form, correct_index: i })}
                />
              </FormGroup>
            </div>

            <FormGroup label="Explanation">
              <Textarea
                placeholder="Why is this answer correct? (optional)"
                rows={2}
                value={form.explanation}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, explanation: e.target.value })}
              />
            </FormGroup>

            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-200">
                {errors.submit}
              </div>
            )}

            <StickyActionBar>
              <Button variant="secondary" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingId ? 'Update Question' : 'Add Question'}
              </Button>
            </StickyActionBar>
          </form>
        </div>
      )}
    </div>
  )
}
