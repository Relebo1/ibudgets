'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, AlertCircle, FileText, HelpCircle, CheckCircle, Zap } from 'lucide-react'
import { PageHeader, Card, Button, IconButton, Modal, FormGroup, Input, Textarea, Select, EmptyState, LoadingState, Badge, Section } from '@/components/admin/ui'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/quizzes').then(r => r.json()),
      fetch('/api/admin/modules').then(r => r.json()),
    ]).then(([quizzesData, modulesData]) => {
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : [])
      setModules(Array.isArray(modulesData) ? modulesData : [])
      setLoading(false)
    }).catch(() => {
      setQuizzes([])
      setModules([])
      setLoading(false)
    })
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this quiz and all its questions?')) return
    try {
      await fetch(`/api/admin/quizzes/${id}`, { method: 'DELETE' })
      setQuizzes(quizzes.filter(q => q.id !== id))
    } catch (error) {
      alert('Error deleting quiz')
    }
  }

  const getModuleTitle = (moduleId: number) => modules.find(m => m.id === moduleId)?.title || 'Unknown'

  const openBuilder = () => {
    setEditingId(null)
    setShowBuilder(true)
  }

  const handleBuilderClose = () => {
    setShowBuilder(false)
    setEditingId(null)
    // Refresh quizzes
    fetch('/api/admin/quizzes').then(r => r.json()).then(data => {
      setQuizzes(Array.isArray(data) ? data : [])
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quizzes"
        description="Create and manage multiple choice quizzes"
        action={<Button icon={Plus} onClick={openBuilder}>New Quiz</Button>}
      />

      {loading ? (
        <LoadingState />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No quizzes yet"
          description="Create your first quiz to get started"
          action={<Button icon={Plus} onClick={openBuilder}>Create Quiz</Button>}
        />
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <Card key={quiz.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{getModuleTitle(quiz.module_id)}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant="default" size="sm"><HelpCircle className="w-3 h-3 mr-1" />{quiz.question_count || 0} questions</Badge>
                    <Badge variant="default" size="sm"><Zap className="w-3 h-3 mr-1" />{quiz.xp_reward} XP</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <IconButton icon={Trash2} variant="danger" onClick={() => handleDelete(quiz.id)} />
                  <button
                    onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {expandedQuiz === quiz.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedQuiz === quiz.id && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <QuestionList quizId={quiz.id} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {showBuilder && (
        <QuizBuilder
          moduleId={null}
          editingId={editingId}
          modules={modules}
          onClose={handleBuilderClose}
        />
      )}
    </div>
  )
}

function QuestionList({ quizId }: { quizId: number }) {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/quizzes/${quizId}`)
      .then(r => r.json())
      .then(data => {
        setQuestions(Array.isArray(data.questions) ? data.questions : [])
        setLoading(false)
      })
      .catch(() => {
        setQuestions([])
        setLoading(false)
      })
  }, [quizId])

  if (loading) return <LoadingState />

  return (
    <div className="space-y-3">
      {questions.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No questions yet</p>
      ) : (
        questions.map((q, idx) => (
          <div key={q.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              <span className="text-gray-500 dark:text-gray-400">Q{idx + 1}.</span> {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt: string, i: number) => (
                <div key={i} className={`p-2 rounded text-sm ${i === q.correct_index ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  <span className="font-semibold">{String.fromCharCode(65 + i)}.</span> {opt}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

interface QuizBuilderProps {
  moduleId: number | null
  editingId: number | null
  modules: any[]
  onClose: () => void
}

function QuizBuilder({ moduleId, editingId, modules, onClose }: QuizBuilderProps) {
  const [step, setStep] = useState<'meta' | 'questions'>('meta')
  const [meta, setMeta] = useState({ module_id: moduleId || '', title: '', description: '', xp_reward: 100 })
  const [questions, setQuestions] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const validateMeta = () => {
    const newErrors: Record<string, string> = {}
    if (!meta.module_id) newErrors.module_id = 'Module is required'
    if (!meta.title.trim()) newErrors.title = 'Quiz title is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleMetaNext = () => {
    if (validateMeta()) {
      setStep('questions')
    }
  }

  const handleAddQuestion = (question: any) => {
    setQuestions([...questions, { ...question, id: Date.now() }])
  }

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleSaveQuiz = async () => {
    if (questions.length === 0) {
      setErrors({ questions: 'Add at least one question' })
      return
    }

    setSaving(true)
    try {
      // Create quiz
      const quizRes = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: Number(meta.module_id),
          title: meta.title,
          description: meta.description,
          xp_reward: Number(meta.xp_reward),
          time_limit: 10,
          color: '#22c55e',
        }),
      })

      if (!quizRes.ok) throw new Error('Failed to create quiz')
      const quiz = await quizRes.json()

      // Add questions
      for (const q of questions) {
        await fetch(`/api/admin/quizzes/${quiz.id}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q.question,
            options: q.options,
            correct_index: q.correct_index,
            explanation: q.explanation,
            order_index: questions.indexOf(q),
          }),
        })
      }

      onClose()
    } catch (error) {
      setErrors({ submit: 'Error saving quiz' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {step === 'meta' ? 'Create New Quiz' : 'Add Questions'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 'meta' ? (
            <QuizMetaForm
              meta={meta}
              setMeta={setMeta}
              modules={modules}
              errors={errors}
            />
          ) : (
            <QuestionBuilder
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              errors={errors}
            />
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
          {step === 'questions' && (
            <Button variant="secondary" onClick={() => setStep('meta')} className="flex-1">
              ← Back
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          {step === 'meta' ? (
            <Button onClick={handleMetaNext} className="flex-1">
              Next: Add Questions →
            </Button>
          ) : (
            <Button onClick={handleSaveQuiz} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function QuizMetaForm({ meta, setMeta, modules, errors }: any) {
  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Step 1: Quiz Information
      </div>

      <FormGroup label="Module" required error={errors.module_id}>
        <Select
          value={meta.module_id}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMeta({ ...meta, module_id: e.target.value })}
          options={[{ value: '', label: 'Select a module' }, ...modules.map((m: any) => ({ value: m.id, label: m.title }))]}
          error={!!errors.module_id}
        />
      </FormGroup>

      <FormGroup label="Quiz Title" required error={errors.title}>
        <Input
          placeholder="e.g., Budgeting Basics Quiz"
          value={meta.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMeta({ ...meta, title: e.target.value })}
          maxLength={150}
          error={!!errors.title}
          autoFocus
        />
      </FormGroup>

      <FormGroup label="Description">
        <Textarea
          placeholder="What will students learn from this quiz?"
          rows={3}
          value={meta.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMeta({ ...meta, description: e.target.value })}
          maxLength={500}
        />
      </FormGroup>

      <FormGroup label="XP Reward">
        <Input
          type="number"
          value={meta.xp_reward}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMeta({ ...meta, xp_reward: Number(e.target.value) })}
          min="10"
          max="1000"
        />
      </FormGroup>
    </div>
  )
}

function QuestionBuilder({ questions, onAddQuestion, onDeleteQuestion, errors }: any) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Step 2: Add Questions (4 options each)
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q: any, idx: number) => (
          <div key={q.id} className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Question {idx + 1}</h4>
              <button
                onClick={() => onDeleteQuestion(q.id)}
                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Question</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{q.question}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Options</p>
                <div className="space-y-2">
                  {q.options.map((opt: string, i: number) => (
                    <div key={i} className={`p-2 rounded text-sm ${i === q.correct_index ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                      <span className="font-semibold">{String.fromCharCode(65 + i)}.</span> {opt}
                    </div>
                  ))}
                </div>
              </div>

              {q.explanation && (
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Explanation</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{q.explanation}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Form */}
      {showForm ? (
        <QuestionForm
          onAdd={(q: any) => {
            onAddQuestion(q)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Button variant="secondary" icon={Plus} onClick={() => setShowForm(true)} className="w-full">
          + Add Another Question
        </Button>
      )}

      {errors.questions && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errors.questions}
        </div>
      )}
    </div>
  )
}

function QuestionForm({ onAdd, onCancel }: any) {
  const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correct_index: 0, explanation: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!form.question.trim()) newErrors.question = 'Question is required'
    if (form.options.some(o => !o?.trim())) newErrors.options = 'All 4 options must be filled'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onAdd(form)
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 space-y-4">
      <FormGroup label="Question" required error={errors.question}>
        <Textarea
          placeholder="Enter your question..."
          rows={2}
          value={form.question}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, question: e.target.value })}
          error={!!errors.question}
          autoFocus
        />
      </FormGroup>

      <FormGroup label="Options (A, B, C, D)" required error={errors.options}>
        <div className="space-y-2">
          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-6">{String.fromCharCode(65 + i)}.</span>
              <Input
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newOpts = [...form.options]
                  newOpts[i] = e.target.value
                  setForm({ ...form, options: newOpts })
                }}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Correct Answer">
        <div className="space-y-2">
          {form.options.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="radio"
                name="correct"
                checked={form.correct_index === i}
                onChange={() => setForm({ ...form, correct_index: i })}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-6">{String.fromCharCode(65 + i)}.</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt || `Option ${String.fromCharCode(65 + i)}`}</span>
            </label>
          ))}
        </div>
      </FormGroup>

      <FormGroup label="Explanation (Optional)">
        <Textarea
          placeholder="Why is this answer correct?"
          rows={2}
          value={form.explanation}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, explanation: e.target.value })}
        />
      </FormGroup>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onCancel} className="flex-1" size="sm">
          Cancel
        </Button>
        <Button type="submit" className="flex-1" size="sm">
          <CheckCircle className="w-4 h-4" />
          Add Question
        </Button>
      </div>
    </form>
  )
}
