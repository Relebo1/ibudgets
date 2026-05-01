'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Brain, X, ArrowLeft, AlertCircle, Save, CheckCircle, GripVertical } from 'lucide-react'

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444']
const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

const emptyQuestion = (): any => ({
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
})

function validateQuestion(q: any, index: number): string | null {
  if (!q.question.trim()) return `Question ${index + 1}: Question text is required.`
  const filled = q.options.filter((o: string) => o.trim())
  if (filled.length < MIN_OPTIONS) return `Question ${index + 1}: At least ${MIN_OPTIONS} options required.`
  if (q.correctIndex < 0 || q.correctIndex >= q.options.length) return `Question ${index + 1}: Invalid correct answer.`
  if (!q.options[q.correctIndex]?.trim()) return `Question ${index + 1}: Correct answer cannot be empty.`
  if (!q.explanation.trim()) return `Question ${index + 1}: Explanation is required.`
  return null
}

export default function QuizzesPage() {
  const [lessons, setLessons] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [view, setView] = useState<'list' | 'builder'>('list')
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null)
  const [meta, setMeta] = useState({ lessonId: '', title: '', description: '', xpReward: '100', timeLimit: '10', color: '#22c55e' })
  const [questions, setQuestions] = useState<any[]>([emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [lessonsRes, quizzesRes] = await Promise.all([
        fetch('/api/admin/lessons'),
        fetch('/api/admin/quizzes'),
      ])
      setLessons(await lessonsRes.json())
      setQuizzes(await quizzesRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const openNew = () => {
    setEditingQuiz(null)
    setMeta({ lessonId: '', title: '', description: '', xpReward: '100', timeLimit: '10', color: '#22c55e' })
    setQuestions([emptyQuestion()])
    setFormError(null)
    setView('builder')
  }

  const openEdit = (quiz: any) => {
    setEditingQuiz(quiz)
    setMeta({
      lessonId: String(quiz.lesson_id),
      title: quiz.title,
      description: quiz.description ?? '',
      xpReward: String(quiz.xp_reward),
      timeLimit: String(quiz.time_limit),
      color: quiz.color,
    })
    setQuestions(quiz.questions.length > 0 ? quiz.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: Array.isArray(q.options) ? [...q.options] : JSON.parse(q.options),
      correctIndex: q.correct_index,
      explanation: q.explanation ?? '',
    })) : [emptyQuestion()])
    setFormError(null)
    setView('builder')
  }

  const updateQuestion = (i: number, q: any) => setQuestions(prev => prev.map((x, idx) => idx === i ? q : x))

  const deleteQuestion = async (i: number) => {
    const q = questions[i]
    if (q.id) await fetch(`/api/admin/questions?id=${q.id}`, { method: 'DELETE' })
    setQuestions(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!meta.lessonId) { setFormError('Please select a lesson.'); return }
    if (!meta.title.trim()) { setFormError('Quiz title is required.'); return }
    if (questions.length === 0) { setFormError('Add at least one question.'); return }

    for (let i = 0; i < questions.length; i++) {
      const err = validateQuestion(questions[i], i)
      if (err) { setFormError(err); return }
    }

    setSaving(true)
    try {
      const metaBody = {
        lessonId: Number(meta.lessonId),
        title: meta.title,
        description: meta.description,
        xpReward: Number(meta.xpReward),
        timeLimit: Number(meta.timeLimit),
        color: meta.color,
      }

      let quizId: number
      if (editingQuiz) {
        await fetch('/api/admin/quizzes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingQuiz.id, ...metaBody }),
        })
        quizId = editingQuiz.id
      } else {
        const res = await fetch('/api/admin/quizzes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metaBody),
        })
        const created = await res.json()
        quizId = created.id
      }

      await Promise.all(questions.map(async (q, idx) => {
        const filledOptions = q.options.filter((o: string) => o.trim())
        const correctIndexInFilled = filledOptions.indexOf(q.options[q.correctIndex])

        const body = {
          quizId,
          question: q.question,
          options: filledOptions,
          correctIndex: correctIndexInFilled,
          explanation: q.explanation,
          orderIndex: idx,
        }

        if (q.id) {
          await fetch('/api/admin/questions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: q.id, ...body }),
          })
        } else {
          await fetch('/api/admin/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        }
      }))

      await fetchData()
      setView('list')
    } catch (err) {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuiz = async (id: number) => {
    try {
      await fetch(`/api/admin/quizzes?id=${id}`, { method: 'DELETE' })
      await fetchData()
      setDeleteQuizId(null)
    } catch (error) {
      console.error('Failed to delete quiz:', error)
    }
  }

  if (view === 'builder') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{editingQuiz ? 'Edit Quiz' : 'New Quiz'}</h1>
        </div>

        {formError && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {formError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Quiz Settings</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Lesson <span className="text-red-400">*</span></label>
              <select className="input" value={meta.lessonId} onChange={e => setMeta({ ...meta, lessonId: e.target.value })} required>
                <option value="">Select lesson...</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Quiz Title <span className="text-red-400">*</span></label>
              <input className="input" placeholder="e.g. Budgeting Basics Quiz" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
              <textarea className="input resize-none" rows={2} placeholder="Brief description..." value={meta.description} onChange={e => setMeta({ ...meta, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">XP Reward</label>
                <input className="input" type="number" min="1" value={meta.xpReward} onChange={e => setMeta({ ...meta, xpReward: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Time Limit (min)</label>
                <input className="input" type="number" min="1" value={meta.timeLimit} onChange={e => setMeta({ ...meta, timeLimit: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setMeta({ ...meta, color: c })} className={`w-8 h-8 rounded-full transition-all ${meta.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`} style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Questions ({questions.length})</h2>
            </div>

            {questions.map((q, i) => {
              const error = validateQuestion(q, i)
              return (
                <div key={i} className={`card p-5 space-y-4 border-2 transition-colors ${error ? 'border-red-200 dark:border-red-800' : 'border-transparent'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Question {i + 1}</span>
                    </div>
                    <button type="button" onClick={() => deleteQuestion(i)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-xs">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Question <span className="text-red-400">*</span></label>
                    <textarea className="input resize-none text-sm" rows={2} placeholder="Question text..." value={q.question} onChange={e => updateQuestion(i, { ...q, question: e.target.value })} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Options <span className="text-red-400">*</span></label>
                      {q.options.length < MAX_OPTIONS && (
                        <button type="button" onClick={() => updateQuestion(i, { ...q, options: [...q.options, ''] })} className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt: string, j: number) => {
                        const isCorrect = q.correctIndex === j
                        return (
                          <div key={j} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${isCorrect ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'}`}>
                            <label className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
                              <input type="radio" name={`correct-${i}`} checked={isCorrect} onChange={() => updateQuestion(i, { ...q, correctIndex: j })} className="w-4 h-4 accent-green-500 cursor-pointer" />
                              <span className={`text-xs font-bold w-4 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>{String.fromCharCode(65 + j)}</span>
                            </label>
                            <input className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400" placeholder={`Option ${String.fromCharCode(65 + j)}`} value={opt} onChange={e => { const opts = [...q.options]; opts[j] = e.target.value; updateQuestion(i, { ...q, options: opts }) }} />
                            {isCorrect && <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Correct</span>}
                            {!isCorrect && q.options.length > MIN_OPTIONS && (
                              <button type="button" onClick={() => { const opts = q.options.filter((_: string, idx: number) => idx !== j); let newCorrect = q.correctIndex; if (q.correctIndex === j) newCorrect = 0; else if (q.correctIndex > j) newCorrect = q.correctIndex - 1; updateQuestion(i, { ...q, options: opts, correctIndex: newCorrect }) }} className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">{q.options.length}/{MAX_OPTIONS} options</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Explanation <span className="text-red-400">*</span></label>
                    <textarea className="input resize-none text-sm" rows={2} placeholder="Why is this the correct answer?" value={q.explanation} onChange={e => updateQuestion(i, { ...q, explanation: e.target.value })} />
                  </div>
                </div>
              )
            })}

            <button type="button" onClick={() => setQuestions(prev => [...prev, emptyQuestion()])} className="w-full py-3.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          <div className="flex gap-3 pb-8">
            <button type="button" onClick={() => setView('list')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
              {saving ? 'Saving...' : <><Save className="w-4 h-4" /> {editingQuiz ? 'Save Changes' : 'Save Quiz'}</>}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quizzes</h1>
          <p className="text-sm text-gray-400 mt-1">{quizzes.length} quizzes</p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No quizzes yet</p>
          <p className="text-sm mb-5">Create your first quiz</p>
          <button onClick={openNew} className="btn-primary text-sm inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: quiz.color + '20' }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: quiz.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{lessons.find(l => l.id === quiz.lesson_id)?.title || '—'} · {quiz.questions?.length || 0} questions · +{quiz.xp_reward} XP · {quiz.time_limit} min</p>
                  {quiz.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{quiz.description}</p>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(quiz)} className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteQuizId(quiz.id)} className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-500 rounded-lg flex items-center justify-center transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Delete Quiz?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">All questions will be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteQuizId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDeleteQuiz(deleteQuizId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
