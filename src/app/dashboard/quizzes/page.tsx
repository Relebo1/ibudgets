'use client'
import { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, HelpCircle, Clock, Zap, RotateCcw, Trophy, ChevronRight } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'

export default function QuizzesPage() {
  const { user } = useSession()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState<number[]>([]) // tracks all picked answers
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch(`/api/quizzes?userId=${user.id}`).then(r => r.json()).then(setQuizzes)
  }, [user])

  if (!user) return null

  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz); setCurrentQ(0); setSelected(null)
    setAnswered(false); setAnswers([]); setFinished(false)
  }

  const handleAnswer = (idx: number) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
  }

  const handleNext = async () => {
    if (!activeQuiz || selected === null) return
    const updatedAnswers = [...answers, selected]
    const isLast = currentQ + 1 >= activeQuiz.questions.length
    if (isLast) {
      const correct = updatedAnswers.filter((a, i) => a === activeQuiz.questions[i].correct_index).length
      const finalScore = Math.round(correct / activeQuiz.questions.length * 100)
      await fetch('/api/quizzes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, quizId: activeQuiz.id, score: finalScore, completed: true }),
      })
      setQuizzes(prev => prev.map(q => q.id === activeQuiz.id ? { ...q, completed: 1, score: finalScore } : q))
      setAnswers(updatedAnswers)
      setFinished(true)
    } else {
      setAnswers(updatedAnswers)
      setCurrentQ(c => c + 1); setSelected(null); setAnswered(false)
    }
  }

  // ── Quiz in progress ──────────────────────────────────────────────────────
  if (activeQuiz && !finished) {
    const q = activeQuiz.questions[currentQ]
    const progress = (currentQ / activeQuiz.questions.length) * 100
    const isCorrect = selected === q.correct_index
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-5 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: activeQuiz.color + '20' }}>
                <div className="w-4 h-4 rounded-full" style={{ background: activeQuiz.color }} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">{activeQuiz.title}</h2>
                <p className="text-xs text-gray-400">Question {currentQ + 1} of {activeQuiz.questions.length}</p>
              </div>
            </div>
            <button onClick={() => setActiveQuiz(null)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
              <X className="w-3.5 h-3.5" /> Exit
            </button>
          </div>

          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{q.question}</h3>

          <div className="space-y-3 mb-6">
            {q.options.map((opt: string, i: number) => {
              let style = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-brand-300 hover:bg-brand-50 cursor-pointer'
              let Icon = null
              if (answered) {
                if (i === q.correct_index) { style = 'border-green-500 bg-green-50 dark:bg-green-900/30 cursor-default'; Icon = CheckCircle }
                else if (i === selected) { style = 'border-red-400 bg-red-50 dark:bg-red-950/30 cursor-default'; Icon = XCircle }
                else style = 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-40 cursor-default'
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 text-sm font-medium flex items-center justify-between ${style}`}>
                  <span><span className="mr-3 text-gray-400 font-bold">{String.fromCharCode(65 + i)}.</span>{opt}</span>
                  {Icon && <Icon className={`w-5 h-5 flex-shrink-0 ${i === q.correct_index ? 'text-green-600' : 'text-red-500'}`} />}
                </button>
              )
            })}
          </div>

          {answered && (
            <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${isCorrect ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'}`}>
              {isCorrect
                ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                  {isCorrect ? 'Correct!' : `Incorrect — correct answer: ${String.fromCharCode(65 + q.correct_index)}. ${q.options[q.correct_index]}`}
                </p>
                {q.explanation && <p className="text-sm text-gray-600 dark:text-gray-400">{q.explanation}</p>}
              </div>
            </div>
          )}

          {answered && (
            <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
              {currentQ + 1 >= activeQuiz.questions.length ? 'See Results' : <>Next Question <ChevronRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (finished && activeQuiz) {
    const correct = answers.filter((a, i) => a === activeQuiz.questions[i].correct_index).length
    const finalScore = Math.round(correct / activeQuiz.questions.length * 100)
    const passed = finalScore >= 70
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Score summary */}
        <div className="card p-6 sm:p-8 text-center">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-50 dark:bg-green-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
            <Trophy className={`w-8 h-8 ${passed ? 'text-green-600' : 'text-orange-500'}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Quiz Complete!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-5">{activeQuiz.title}</p>
          <div className="w-28 h-28 mx-auto mb-4 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={passed ? '#22c55e' : '#f97316'}
                strokeWidth="3"
                strokeDasharray={`${(finalScore / 100) * 99.9} ${99.9 - (finalScore / 100) * 99.9}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{finalScore}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{correct} of {activeQuiz.questions.length} correct</p>
          <p className={`text-sm font-semibold mb-5 ${passed ? 'text-green-600' : 'text-orange-500'}`}>
            {passed ? '🎉 Well done! You passed.' : '📚 Keep studying and try again.'}
          </p>
          <p className="text-brand-600 dark:text-brand-400 font-semibold mb-5 flex items-center justify-center gap-1.5">
            <Zap className="w-4 h-4" /> +{activeQuiz.xp_reward} XP earned!
          </p>
          <div className="flex gap-3">
            <button onClick={() => startQuiz(activeQuiz)} className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <button onClick={() => setActiveQuiz(null)} className="btn-primary flex-1">Done</button>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Question Breakdown</h3>
          <div className="space-y-3">
            {activeQuiz.questions.map((q: any, i: number) => {
              const picked = answers[i]
              const wasCorrect = picked === q.correct_index
              return (
                <div key={q.id} className={`rounded-xl border-2 p-4 ${wasCorrect ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${wasCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {wasCorrect
                        ? <CheckCircle className="w-4 h-4 text-white" />
                        : <XCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        <span className="text-gray-400 mr-1">Q{i + 1}.</span>{q.question}
                      </p>
                      {wasCorrect ? (
                        <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                          ✓ Correct — {String.fromCharCode(65 + picked)}. {q.options[picked]}
                        </p>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-xs text-red-600 dark:text-red-400">
                            ✗ Your answer: {String.fromCharCode(65 + picked)}. {q.options[picked]}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                            ✓ Correct answer: {String.fromCharCode(65 + q.correct_index)}. {q.options[q.correct_index]}
                          </p>
                        </div>
                      )}
                      {q.explanation && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 italic">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz list ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{quizzes.filter(q => q.completed).length}/{quizzes.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-purple-600">{quizzes.filter(q => q.completed).reduce((s: number, q: any) => s + q.xp_reward, 0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">XP from Quizzes</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {quizzes.filter(q => q.score !== null).length > 0
              ? Math.round(quizzes.filter(q => q.score !== null).reduce((s: number, q: any) => s + q.score, 0) / quizzes.filter(q => q.score !== null).length)
              : 0}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Score</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Available Quizzes</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((q: any) => (
          <div key={q.id} className="card card-hover p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: q.color + '20' }}>
                <div className="w-5 h-5 rounded-full" style={{ background: q.color }} />
              </div>
              {q.completed == 1 && (
                <span className={`badge flex items-center gap-1 ${q.score >= 70 ? 'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                  <CheckCircle className="w-3 h-3" /> {q.score}%
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{q.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex-1">{q.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
              <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> {q.questions?.length ?? 0} questions</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.time_limit} min</span>
              <span className="flex items-center gap-1 text-purple-600 font-medium"><Zap className="w-3 h-3" /> +{q.xp_reward}</span>
            </div>
            <button onClick={() => startQuiz(q)}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 ${q.completed == 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
              {q.completed == 1 ? <><RotateCcw className="w-4 h-4" /> Retake Quiz</> : <>Start Quiz <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
