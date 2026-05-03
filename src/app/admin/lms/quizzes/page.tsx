'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X, Brain, ChevronDown, ChevronUp } from 'lucide-react'

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [expandedQuiz, setExpandedQuiz] = useState<number | null>(null)
  const [form, setForm] = useState({ lesson_id: '', title: '', description: '', xp_reward: 100, time_limit: 10 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/quizzes').then(r => r.json()),
      fetch('/api/admin/lessons').then(r => r.json()),
    ]).then(([quizzesData, lessonsData]) => {
      setQuizzes(quizzesData)
      setLessons(lessonsData)
      setLoading(false)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { alert('Title required'); return }
    if (!form.lesson_id) { alert('Lesson required'); return }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/quizzes/${editingId}` : '/api/admin/quizzes'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lesson_id: Number(form.lesson_id), xp_reward: Number(form.xp_reward), time_limit: Number(form.time_limit) }),
      })

      if (!res.ok) throw new Error('Failed to save')

      setForm({ lesson_id: '', title: '', description: '', xp_reward: 100, time_limit: 10 })
      setEditingId(null)
      setShowModal(false)

      const quizzesData = await fetch('/api/admin/quizzes').then(r => r.json())
      setQuizzes(quizzesData)
    } catch (error) {
      alert('Error saving quiz')
    }
  }

  const handleEdit = (quiz: any) => {
    setForm({ lesson_id: quiz.lesson_id, title: quiz.title, description: quiz.description, xp_reward: quiz.xp_reward, time_limit: quiz.time_limit })
    setEditingId(quiz.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this quiz?')) return
    try {
      await fetch(`/api/admin/quizzes/${id}`, { method: 'DELETE' })
      setQuizzes(quizzes.filter(q => q.id !== id))
    } catch (error) {
      alert('Error deleting quiz')
    }
  }

  const getLessonTitle = (lessonId: number) => lessons.find(l => l.id === lessonId)?.title || 'Unknown'

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quizzes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage quizzes and questions</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ lesson_id: '', title: '', description: '', xp_reward: 100, time_limit: 10 }); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Quiz
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="card p-12 text-center">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No quizzes yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getLessonTitle(quiz.lesson_id)}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">{quiz.question_count} questions</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">{quiz.xp_reward} XP</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <button onClick={() => setExpandedQuiz(expandedQuiz === quiz.id ? null : quiz.id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    {expandedQuiz === quiz.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(quiz)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(quiz.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {expandedQuiz === quiz.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <QuestionManager quizId={quiz.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{editingId ? 'Edit Quiz' : 'New Quiz'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lesson <span className="text-red-500">*</span></label>
                <select className="input" value={form.lesson_id} onChange={e => setForm({ ...form, lesson_id: e.target.value })} required>
                  <option value="">Select a lesson</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input className="input" placeholder="e.g. Budgeting Basics Quiz" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={150} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea className="input resize-none" rows={2} placeholder="Quiz description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={500} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">XP Reward</label>
                  <input className="input" type="number" value={form.xp_reward} onChange={e => setForm({ ...form, xp_reward: Number(e.target.value) })} min="10" max="1000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Time Limit (min)</label>
                  <input className="input" type="number" value={form.time_limit} onChange={e => setForm({ ...form, time_limit: Number(e.target.value) })} min="1" max="120" />
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

function QuestionManager({ quizId }: { quizId: number }) {
  const [questions, setQuestions] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correct_index: 0, explanation: '', order_index: 0 })

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.question.trim()) { alert('Question required'); return }
    if (form.options.some(o => !o.trim())) { alert('All options required'); return }

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
      fetchQuestions()
    } catch (error) {
      alert('Error saving question')
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Questions ({questions.length})</h4>
        <button onClick={() => { setEditingId(null); setForm({ question: '', options: ['', '', '', ''], correct_index: 0, explanation: '', order_index: 0 }); setShowForm(true) }} className="btn-secondary text-xs flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add Question
        </button>
      </div>

      <div className="space-y-2">
        {questions.map((q, idx) => (
          <div key={q.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{idx + 1}. {q.question}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Correct: {q.options[q.correct_index]}</p>
              </div>
              <div className="flex gap-1 ml-2">
                <button onClick={() => { setForm({ question: q.question, options: q.options, correct_index: q.correct_index, explanation: q.explanation, order_index: q.order_index }); setEditingId(q.id); setShowForm(true) }} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
                  <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                </button>
                <button onClick={() => handleDelete(q.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Question <span className="text-red-500">*</span></label>
              <textarea className="input text-sm resize-none" rows={2} placeholder="Enter question" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Options <span className="text-red-500">*</span></label>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={form.correct_index === i} onChange={() => setForm({ ...form, correct_index: i })} className="w-4 h-4" />
                    <input className="input text-sm flex-1" placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => { const newOpts = [...form.options]; newOpts[i] = e.target.value; setForm({ ...form, options: newOpts }) }} required />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Explanation</label>
              <textarea className="input text-sm resize-none" rows={2} placeholder="Why is this answer correct?" value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-xs flex-1">Cancel</button>
              <button type="submit" className="btn-primary text-xs flex-1">{editingId ? 'Update' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
