'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Trash2, Pencil, Brain, ArrowLeft, CheckCircle, GripVertical } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Option = string
type DraftQuestion = {
  id?: number          // present when editing a saved question
  question: string
  options: Option[]
  correctIndex: number
  explanation: string
}
type Quiz = {
  id: number
  module_id: number
  lesson_id: number | null
  title: string
  description: string
  xp_reward: number
  time_limit: number
  color: string
  questions: any[]
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444']
const MIN_OPTIONS = 2
const MAX_OPTIONS = 6
const emptyQuestion = (): DraftQuestion => ({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' })

// ─── QuestionCard ─────────────────────────────────────────────────────────────
function QuestionCard({
  index, q, onChange, onDelete, saving,
}: {
  index: number
  q: DraftQuestion
  onChange: (q: DraftQuestion) => void
  onDelete: () => void
  saving: boolean
}) {
  const setOption = (i: number, v: string) => {
    const opts = [...q.options]; opts[i] = v; onChange({ ...q, options: opts })
  }
  const addOption = () => {
    if (q.options.length < MAX_OPTIONS) onChange({ ...q, options: [...q.options, ''] })
  }
  const removeOption = (i: number) => {
    if (q.options.length <= MIN_OPTIONS) return
    const opts = q.options.filter((_, idx) => idx !== i)
    onChange({ ...q, options: opts, correctIndex: q.correctIndex >= opts.length ? 0 : q.correctIndex })
  }

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Question {index + 1}</span>
          {q.id && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">saved</span>}
        </div>
        <button type="button" onClick={onDelete} disabled={saving}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Question text */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
          Question Text
        </label>
        <textarea
          className="input resize-none text-sm"
          rows={2}
          placeholder="e.g. What is the area of a rectangle with width 5 and length 7?"
          value={q.question}
          onChange={e => onChange({ ...q, question: e.target.value })}
          required
        />
      </div>

      {/* Answer options */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Answer Options
          </label>
          {q.options.length < MAX_OPTIONS && (
            <button type="button" onClick={addOption}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add option
            </button>
          )}
        </div>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isCorrect = q.correctIndex === i
            return (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${
                isCorrect
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
              }`}>
                {/* Radio — correct answer selector */}
                <label className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={isCorrect}
                    onChange={() => onChange({ ...q, correctIndex: i })}
                    className="w-4 h-4 accent-green-500 cursor-pointer"
                  />
                  <span className={`text-xs font-bold w-4 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                </label>

                {/* Option text input */}
                <input
                  className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={e => setOption(i, e.target.value)}
                  required
                />

                {isCorrect && (
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex-shrink-0 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Correct
                  </span>
                )}
                {!isCorrect && q.options.length > MIN_OPTIONS && (
                  <button type="button" onClick={() => removeOption(i)}
                    className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Select the radio button next to the correct answer · {q.options.length}/{MAX_OPTIONS} options
        </p>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
          Explanation <span className="normal-case font-normal text-gray-400">— why is this the correct answer?</span>
        </label>
        <textarea
          className="input resize-none text-sm"
          rows={2}
          placeholder="e.g. Area = length × width → 7 × 5 = 35"
          value={q.explanation}
          onChange={e => onChange({ ...q, explanation: e.target.value })}
          required
        />
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminQuizzesPage() {
  const [modules, setModules] = useState<any[]>([])
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [lessons, setLessons] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  // builder view state
  const [view, setView] = useState<'list' | 'builder'>('list')
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)

  // quiz meta form
  const [meta, setMeta] = useState({ moduleId: '', lessonId: '', title: '', description: '', xpReward: '100', timeLimit: '10', color: '#22c55e' })

  // question drafts — all questions shown inline
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()])

  const [saving, setSaving] = useState(false)
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/modules').then(r => r.json()).then(setModules)
    fetch('/api/admin/lessons').then(r => r.json()).then(setAllLessons)
    fetch('/api/admin/quizzes').then(r => r.json()).then(setQuizzes)
  }, [])

  const loadLessons = (moduleId: string) => {
    if (!moduleId) { setLessons([]); return }
    fetch(`/api/admin/lessons?moduleId=${moduleId}`).then(r => r.json()).then(setLessons)
  }

  // ── Open builder ────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditingQuiz(null)
    setMeta({ moduleId: '', lessonId: '', title: '', description: '', xpReward: '100', timeLimit: '10', color: '#22c55e' })
    setQuestions([emptyQuestion()])
    setLessons([])
    setView('builder')
  }

  const openEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setMeta({
      moduleId: String(quiz.module_id),
      lessonId: quiz.lesson_id ? String(quiz.lesson_id) : '',
      title: quiz.title,
      description: quiz.description ?? '',
      xpReward: String(quiz.xp_reward),
      timeLimit: String(quiz.time_limit),
      color: quiz.color,
    })
    // map saved questions into draft shape
    const drafts: DraftQuestion[] = quiz.questions.length > 0
      ? quiz.questions.map(q => ({
          id: q.id,
          question: q.question,
          options: [...q.options],
          correctIndex: q.correct_index,
          explanation: q.explanation ?? '',
        }))
      : [emptyQuestion()]
    setQuestions(drafts)
    loadLessons(String(quiz.module_id))
    setView('builder')
  }

  // ── Question helpers ────────────────────────────────────────────────────────
  const updateQuestion = (i: number, q: DraftQuestion) =>
    setQuestions(prev => prev.map((x, idx) => idx === i ? q : x))

  const deleteQuestion = async (i: number) => {
    const q = questions[i]
    if (q.id) await fetch(`/api/admin/questions?id=${q.id}`, { method: 'DELETE' })
    setQuestions(prev => prev.filter((_, idx) => idx !== i))
  }

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()])

  // ── Save quiz + all questions ───────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const metaBody = {
        moduleId: Number(meta.moduleId),
        lessonId: meta.lessonId ? Number(meta.lessonId) : null,
        title: meta.title,
        description: meta.description,
        xpReward: Number(meta.xpReward),
        timeLimit: Number(meta.timeLimit),
        color: meta.color,
      }

      let quizId: number
      if (editingQuiz) {
        await fetch('/api/admin/quizzes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingQuiz.id, ...metaBody }) })
        quizId = editingQuiz.id
      } else {
        const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(metaBody) })
        const created = await res.json()
        quizId = created.id
      }

      // save each question (upsert)
      const savedQuestions = await Promise.all(questions.map(async q => {
        const body = { quizId, question: q.question, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation }
        if (q.id) {
          const res = await fetch('/api/admin/questions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: q.id, ...body }) })
          return res.json()
        } else {
          const res = await fetch('/api/admin/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          return res.json()
        }
      }))

      // refresh quiz list
      const updated: Quiz = {
        ...(editingQuiz ?? { id: quizId } as any),
        ...metaBody,
        module_id: metaBody.moduleId,
        lesson_id: metaBody.lessonId,
        xp_reward: metaBody.xpReward,
        time_limit: metaBody.timeLimit,
        questions: savedQuestions.map(q => ({ ...q, options: Array.isArray(q.options) ? q.options : JSON.parse(q.options) })),
      }
      setQuizzes(prev => editingQuiz
        ? prev.map(q => q.id === editingQuiz.id ? updated : q)
        : [...prev, updated]
      )
      setView('list')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuiz = async (id: number) => {
    await fetch(`/api/admin/quizzes?id=${id}`, { method: 'DELETE' })
    setQuizzes(prev => prev.filter(q => q.id !== id))
    setDeleteQuizId(null)
  }

  // ── Builder view ────────────────────────────────────────────────────────────
  if (view === 'builder') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {editingQuiz ? 'Edit Quiz' : 'New Quiz'}
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ── Quiz settings card ── */}
          <div className="card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Quiz Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Module</label>
                <select className="input" value={meta.moduleId} onChange={e => {
                  setMeta(f => ({ ...f, moduleId: e.target.value, lessonId: '' }))
                  loadLessons(e.target.value)
                }} required>
                  <option value="">Select module...</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Lesson <span className="normal-case font-normal">(optional)</span>
                </label>
                <select className="input" value={meta.lessonId} onChange={e => setMeta(f => ({ ...f, lessonId: e.target.value }))} disabled={!meta.moduleId}>
                  <option value="">No lesson — module-level quiz</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Quiz Title</label>
              <input className="input" placeholder="e.g. Budgeting Basics Quiz" value={meta.title} onChange={e => setMeta(f => ({ ...f, title: e.target.value }))} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
              <textarea className="input resize-none" rows={2} placeholder="Brief description of what this quiz covers..." value={meta.description} onChange={e => setMeta(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">XP Reward</label>
                <input className="input" type="number" min="1" value={meta.xpReward} onChange={e => setMeta(f => ({ ...f, xpReward: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Time Limit (min)</label>
                <input className="input" type="number" min="1" value={meta.timeLimit} onChange={e => setMeta(f => ({ ...f, timeLimit: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setMeta(f => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full transition-all ${meta.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Question cards ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Questions <span className="text-gray-400 font-normal normal-case">({questions.length})</span>
              </h2>
            </div>

            {questions.map((q, i) => (
              <QuestionCard
                key={i}
                index={i}
                q={q}
                onChange={updated => updateQuestion(i, updated)}
                onDelete={() => deleteQuestion(i)}
                saving={saving}
              />
            ))}

            {/* Add another question */}
            <button type="button" onClick={addQuestion}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> Add Another Question
            </button>
          </div>

          {/* ── Save / Cancel ── */}
          <div className="flex gap-3 pb-8">
            <button type="button" onClick={() => setView('list')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? 'Saving...' : <><CheckCircle className="w-4 h-4" /> {editingQuiz ? 'Save Changes' : 'Save Quiz'}</>}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quizzes</h1>
          <p className="text-sm text-gray-400 mt-1">
            {quizzes.length} quizzes · {quizzes.reduce((s, q) => s + (q.questions?.length ?? 0), 0)} questions total
          </p>
        </div>
        <button onClick={openNew} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No quizzes yet</p>
          <p className="text-sm mb-5">Create your first quiz and add questions</p>
          <button onClick={openNew} className="btn-primary text-sm inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Quiz
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="card p-5">
              <div className="flex items-start gap-4">
                {/* Color dot */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: quiz.color + '20' }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: quiz.color }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {modules.find(m => m.id === quiz.module_id)?.title ?? '—'}
                    {quiz.lesson_id ? ` · ${allLessons.find(l => l.id === quiz.lesson_id)?.title ?? 'Lesson #' + quiz.lesson_id}` : ''}
                    {' · '}{quiz.questions?.length ?? 0} questions · +{quiz.xp_reward} XP · {quiz.time_limit} min
                  </p>
                  {quiz.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{quiz.description}</p>}

                  {/* Question preview pills */}
                  {quiz.questions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {quiz.questions.map((q: any, i: number) => (
                        <span key={q.id} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-lg">
                          Q{i + 1}: {q.question.length > 40 ? q.question.slice(0, 40) + '…' : q.question}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(quiz)}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => setDeleteQuizId(quiz.id)}
                    className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-500 rounded-lg flex items-center justify-center transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Delete Quiz?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">All questions in this quiz will also be deleted.</p>
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
