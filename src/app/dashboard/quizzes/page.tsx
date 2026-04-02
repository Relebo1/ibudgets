'use client'
import { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, HelpCircle, Clock, Zap, RotateCcw, Trophy, ChevronRight } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'

export default function QuizzesPage() {
  const { user } = useSession()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch(`/api/quizzes?userId=${user.id}`).then(r => r.json()).then(setQuizzes)
  }, [user])

  if (!user) return null

  const quiz = activeQuiz !== null ? quizzes.find(q => q.id === activeQuiz) : null

  const startQuiz = (id: number) => {
    setActiveQuiz(id); setCurrentQ(0); setSelected(null)
    setAnswered(false); setScore(0); setFinished(false)
  }

  const handleAnswer = (idx: number) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    if (quiz && idx === quiz.questions[currentQ].correct_index) setScore(s => s + 1)
  }

  const handleNext = async () => {
    if (!quiz) return
    const isLast = currentQ + 1 >= quiz.questions.length
    if (isLast) {
      const correct = score + (selected === quiz.questions[currentQ].correct_index ? 1 : 0)
      const finalScore = Math.round(correct / quiz.questions.length * 100)
      await fetch('/api/quizzes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, quizId: activeQuiz, score: finalScore, completed: true }),
      })
      setQuizzes(prev => prev.map(q => q.id === activeQuiz ? { ...q, completed: 1, score: finalScore } : q))
      setFinished(true)
    } else {
      setCurrentQ(c => c + 1); setSelected(null); setAnswered(false)
    }
  }

  if (quiz && !finished) {
    const q = quiz.questions[currentQ]
    const progress = (currentQ / quiz.questions.length) * 100
    const isCorrect = selected === q.correct_index
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-5 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: quiz.color + '20' }}>
                <div className="w-4 h-4 rounded-full" style={{ background: quiz.color }} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</h2>
                <p className="text-xs text-gray-400">Question {currentQ + 1} of {quiz.questions.length}</p>
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
              let style = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-brand-300 hover:bg-brand-50'
              let Icon = null
              if (answered) {
                if (i === q.correct_index) { style = 'border-brand-500 bg-brand-50 dark:bg-brand-900/30'; Icon = CheckCircle }
                else if (i === selected) { style = 'border-red-400 bg-red-50 dark:bg-red-950/30'; Icon = XCircle }
                else style = 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50'
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 text-sm font-medium flex items-center justify-between ${style}`}>
                  <span><span className="mr-3 text-gray-400">{String.fromCharCode(65 + i)}.</span>{opt}</span>
                  {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${i === q.correct_index ? 'text-brand-600' : 'text-red-500'}`} />}
                </button>
              )
            })}
          </div>
          {answered && (
            <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${isCorrect ? 'bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800' : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'}`}>
              {isCorrect ? <CheckCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-medium dark:text-gray-100 mb-0.5">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{q.explanation}</p>
              </div>
            </div>
          )}
          {answered && (
            <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
              {currentQ + 1 >= quiz.questions.length ? 'Finish Quiz' : <>Next Question <ChevronRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (finished && quiz) {
    const finalScore = Math.round(score / quiz.questions.length * 100)
    return (
      <div className="max-w-md mx-auto">
        <div className="card p-5 sm:p-8 text-center">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${finalScore >= 70 ? 'bg-brand-50 dark:bg-brand-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
            <Trophy className={`w-8 h-8 ${finalScore >= 70 ? 'text-brand-600' : 'text-orange-500'}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Quiz Complete!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{quiz.title}</p>
          <div className="w-32 h-32 mx-auto mb-6 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={finalScore >= 70 ? '#22c55e' : '#f97316'}
                strokeWidth="3" strokeDasharray={`${finalScore} ${100 - finalScore}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{finalScore}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{score}/{quiz.questions.length} correct answers</p>
          <p className="text-brand-600 dark:text-brand-400 font-semibold mb-6 flex items-center justify-center gap-1.5">
            <Zap className="w-4 h-4" /> +{quiz.xp_reward} XP earned!
          </p>
          <div className="flex gap-3">
            <button onClick={() => startQuiz(quiz.id)} className="btn-secondary flex-1 flex items-center justify-center gap-1.5"><RotateCcw className="w-4 h-4" /> Retry</button>
            <button onClick={() => setActiveQuiz(null)} className="btn-primary flex-1">Done</button>
          </div>
        </div>
      </div>
    )
  }

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
              {q.completed == 1 && <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {q.score}%</span>}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{q.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex-1">{q.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
              <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3" /> {q.questions?.length ?? 0} questions</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.time_limit} min</span>
              <span className="flex items-center gap-1 text-purple-600 font-medium"><Zap className="w-3 h-3" /> +{q.xp_reward}</span>
            </div>
            <button onClick={() => startQuiz(q.id)}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 ${q.completed == 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
              {q.completed == 1 ? <><RotateCcw className="w-4 h-4" /> Retake Quiz</> : <>Start Quiz <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
