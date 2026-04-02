'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Trash2, Pencil, Brain, ChevronDown, ChevronUp } from 'lucide-react'

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444']
const emptyQuiz = { moduleId: '', title: '', description: '', xpReward: '100', timeLimit: '10', color: '#22c55e' }
const emptyQ = { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }

export default function AdminQuizzesPage() {
  const [modules, setModules] = useState<any[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null)
  const [quizForm, setQuizForm] = useState(emptyQuiz)
  const [showQModal, setShowQModal] = useState<number | null>(null)
  const [editingQ, setEditingQ] = useState<any | null>(null)
  const [qForm, setQForm] = useState(emptyQ)
  const [deleteQuizId, setDeleteQuizId] = useState<number | null>(null)
  const [deleteQId, setDeleteQId] = useState<{ id: number; quizId: number } | null>(null)

  useEffect(() => {
    fetch('/api/admin/modules').then(r => r.json()).then(setModules)
    fetch('/api/admin/quizzes').then(r => r.json()).then(setQuizzes)
  }, [])

  const openAddQuiz = () => { setEditingQuiz(null); setQuizForm(emptyQuiz); setShowQuizModal(true) }
  const openEditQuiz = (q: any) => {
    setEditingQuiz(q)
    setQuizForm({ moduleId: String(q.module_id), title: q.title, description: q.description ?? '', xpReward: String(q.xp_reward), timeLimit: String(q.time_limit), color: q.color })
    setShowQuizModal(true)
  }

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = { ...quizForm, moduleId: Number(quizForm.moduleId), xpReward: Number(quizForm.xpReward), timeLimit: Number(quizForm.timeLimit) }
    if (editingQuiz) {
      const res = await fetch('/api/admin/quizzes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingQuiz.id, ...body }) })
      const updated = await res.json()
      setQuizzes(prev => prev.map(q => q.id === editingQuiz.id ? { ...q, ...updated } : q))
    } else {
      const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const created = await res.json()
      setQuizzes(prev => [...prev, created])
    }
    setShowQuizModal(false)
  }

  const handleDeleteQuiz = async (id: number) => {
    await fetch(`/api/admin/quizzes?id=${id}`, { method: 'DELETE' })
    setQuizzes(prev => prev.filter(q => q.id !== id))
    setDeleteQuizId(null)
  }

  const openAddQ = (quizId: number) => { setEditingQ(null); setQForm(emptyQ); setShowQModal(quizId) }
  const openEditQ = (q: any, quizId: number) => {
    setEditingQ(q)
    setQForm({ question: q.question, options: [...q.options], correctIndex: q.correct_index, explanation: q.explanation ?? '' })
    setShowQModal(quizId)
  }

  const handleSaveQ = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showQModal) return
    const body = { quizId: showQModal, question: qForm.question, options: qForm.options, correctIndex: qForm.correctIndex, explanation: qForm.explanation }
    if (editingQ) {
      const res = await fetch('/api/admin/questions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingQ.id, ...body }) })
      const updated = await res.json()
      setQuizzes(prev => prev.map(q => q.id === showQModal ? { ...q, questions: q.questions.map((qq: any) => qq.id === editingQ.id ? updated : qq) } : q))
    } else {
      const res = await fetch('/api/admin/questions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const created = await res.json()
      setQuizzes(prev => prev.map(q => q.id === showQModal ? { ...q, questions: [...(q.questions ?? []), created] } : q))
    }
    setShowQModal(null)
  }

  const handleDeleteQ = async (id: number, quizId: number) => {
    await fetch(`/api/admin/questions?id=${id}`, { method: 'DELETE' })
    setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, questions: q.questions.filter((qq: any) => qq.id !== id) } : q))
    setDeleteQId(null)
  }

  const setOption = (i: number, v: string) => setQForm(f => { const opts = [...f.options]; opts[i] = v; return { ...f, options: opts } })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quizzes</h1>
          <p className="text-sm text-gray-400 mt-1">{quizzes.length} quizzes · {quizzes.reduce((s, q) => s + (q.questions?.length ?? 0), 0)} questions total</p>
        </div>
        <button onClick={openAddQuiz} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No quizzes yet</p>
          <p className="text-sm">Create your first quiz and add questions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz: any) => (
            <div key={quiz.id} className="card overflow-hidden">
              <div className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: quiz.color + '20' }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: quiz.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</p>
                  <p className="text-xs text-gray-400">
                    {modules.find(m => m.id === quiz.module_id)?.title ?? 'No module'} · {quiz.questions?.length ?? 0} questions · +{quiz.xp_reward} XP · {quiz.time_limit} min
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEditQuiz(quiz)} className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/40 text-gray-500 hover:text-brand-600 rounded-lg flex items-center justify-center transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteQuizId(quiz.id)} className="w-7 h-7 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-500 rounded-lg flex items-center justify-center transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setExpanded(expanded === quiz.id ? null : quiz.id)} className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 transition-all">
                    {expanded === quiz.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expanded === quiz.id && (
                <div className="border-t border-gray-100 dark:border-gray-800 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Questions ({quiz.questions?.length ?? 0})</p>
                    <button onClick={() => openAddQ(quiz.id)} className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Question
                    </button>
                  </div>
                  {(!quiz.questions || quiz.questions.length === 0) ? (
                    <p className="text-sm text-gray-400 text-center py-4">No questions yet.</p>
                  ) : (
                    quiz.questions.map((q: any, i: number) => (
                      <div key={q.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              <span className="text-gray-400 mr-2">Q{i + 1}.</span>{q.question}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {q.options.map((opt: string, oi: number) => (
                                <div key={oi} className={`text-xs px-2.5 py-1.5 rounded-lg ${oi === q.correct_index ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 font-medium' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                  {String.fromCharCode(65 + oi)}. {opt}
                                </div>
                              ))}
                            </div>
                            {q.explanation && <p className="text-xs text-gray-400 mt-2 italic">{q.explanation}</p>}
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button onClick={() => openEditQ(q, quiz.id)} className="w-6 h-6 bg-white dark:bg-gray-700 hover:bg-brand-50 text-gray-400 hover:text-brand-600 rounded-lg flex items-center justify-center transition-all">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => setDeleteQId({ id: q.id, quizId: quiz.id })} className="w-6 h-6 bg-white dark:bg-gray-700 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{editingQuiz ? 'Edit Quiz' : 'New Quiz'}</h3>
              <button onClick={() => setShowQuizModal(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveQuiz} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Module</label>
                <select className="input" value={quizForm.moduleId} onChange={e => setQuizForm(f => ({ ...f, moduleId: e.target.value }))} required>
                  <option value="">Select module...</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quiz Title</label>
                <input className="input" placeholder="e.g. Budgeting Basics Quiz" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea className="input resize-none" rows={2} value={quizForm.description} onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">XP Reward</label>
                  <input className="input" type="number" value={quizForm.xpReward} onChange={e => setQuizForm(f => ({ ...f, xpReward: e.target.value }))} min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Time Limit (min)</label>
                  <input className="input" type="number" value={quizForm.timeLimit} onChange={e => setQuizForm(f => ({ ...f, timeLimit: e.target.value }))} min="1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setQuizForm(f => ({ ...f, color: c }))}
                      className={`w-8 h-8 rounded-full transition-all ${quizForm.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowQuizModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editingQuiz ? 'Save Changes' : 'Create Quiz'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{editingQ ? 'Edit Question' : 'New Question'}</h3>
              <button onClick={() => setShowQModal(null)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveQ} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Question</label>
                <textarea className="input resize-none" rows={2} placeholder="Enter the question..." value={qForm.question} onChange={e => setQForm(f => ({ ...f, question: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Answer Options <span className="text-xs text-gray-400 font-normal">(click letter to mark correct)</span>
                </label>
                <div className="space-y-2">
                  {qForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button type="button" onClick={() => setQForm(f => ({ ...f, correctIndex: i }))}
                        className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all ${qForm.correctIndex === i ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-brand-400'}`}>
                        {String.fromCharCode(65 + i)}
                      </button>
                      <input className="input" placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => setOption(i, e.target.value)} required />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Explanation</label>
                <textarea className="input resize-none" rows={2} placeholder="Explain why the answer is correct..." value={qForm.explanation} onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowQModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">{editingQ ? 'Save Question' : 'Add Question'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Quiz confirm */}
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

      {/* Delete Question confirm */}
      {deleteQId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Delete Question?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This question will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteQId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDeleteQ(deleteQId.id, deleteQId.quizId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
