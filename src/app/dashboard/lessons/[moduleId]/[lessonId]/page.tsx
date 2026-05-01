'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, BookOpen, Youtube, Brain, CheckCircle, XCircle,
  ChevronRight, X, RotateCcw, Trophy, Zap, Clock, HelpCircle,
  AlertCircle,
} from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'

function getYouTubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)
  return m ? m[1] : null
}

export default function LessonDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useSession()
  const moduleId = Number(params.moduleId)
  const lessonId = Number(params.lessonId)

  const [lesson, setLesson] = useState<any | null>(null)
  const [module, setModule] = useState<any | null>(null)
  const [quiz, setQuiz] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)

    Promise.all([
      fetch(`/api/modules?userId=${user.id}`).then(r => r.json()),
      fetch(`/api/admin/lessons?moduleId=${moduleId}`).then(r => r.json()),
      fetch(`/api/quizzes?userId=${user.id}&moduleId=${moduleId}`).then(r => r.json()),
    ]).then(([modules, lessons, quizzes]) => {
      const mod = modules.find((m: any) => m.id === moduleId)
      const les = lessons.find((l: any) => l.id === lessonId)
      const q = quizzes.find((q: any) => q.lesson_id === lessonId)

      setModule(mod)
      setLesson(les)
      setQuiz(q)
      setLoading(false)
    })
  }, [user, moduleId, lessonId])

  if (!user || loading) return null
  if (!lesson || !module) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="card p-12 text-center text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Lesson not found</p>
        </div>
      </div>
    )
  }

  const videoId = lesson.youtube_url ? getYouTubeId(lesson.youtube_url) : null

  // ── Quiz in progress ──────────────────────────────────────────────────────
  if (showQuiz && quiz && !finished) {
    const q = quiz.questions[currentQ]
    const progress = (currentQ / quiz.questions.length) * 100

    const handleAnswer = (idx: number) => {
      if (answered) return
      setPicked(idx)
      setAnswered(true)
    }

    const handleNext = async () => {
      if (picked === null) return
      const updatedAnswers = [...answers, picked]
      const isLast = currentQ + 1 >= quiz.questions.length

      if (isLast) {
        const correct = updatedAnswers.filter((a, i) => a === quiz.questions[i].correct_index).length
        const finalScore = Math.round(correct / quiz.questions.length * 100)

        await fetch('/api/quizzes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, quizId: quiz.id, score: finalScore, completed: true }),
        })

        setAnswers(updatedAnswers)
        setScore(correct)
        setFinished(true)
      } else {
        setAnswers(updatedAnswers)
        setCurrentQ(c => c + 1)
        setPicked(null)
        setAnswered(false)
      }
    }

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
            <button
              onClick={() => setShowQuiz(false)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
            >
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
                if (i === q.correct_index) {
                  style = 'border-green-500 bg-green-50 dark:bg-green-900/30 cursor-default'
                  Icon = CheckCircle
                } else if (i === picked) {
                  style = 'border-red-400 bg-red-50 dark:bg-red-950/30 cursor-default'
                  Icon = XCircle
                } else {
                  style = 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-40 cursor-default'
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 text-sm font-medium flex items-center justify-between ${style}`}
                >
                  <span>
                    <span className="mr-3 text-gray-400 font-bold">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </span>
                  {Icon && (
                    <Icon className={`w-5 h-5 flex-shrink-0 ${i === q.correct_index ? 'text-green-600' : 'text-red-500'}`} />
                  )}
                </button>
              )
            })}
          </div>

          {answered && (
            <div
              className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${
                picked === q.correct_index
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
              }`}
            >
              {picked === q.correct_index ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                  {picked === q.correct_index
                    ? 'Correct!'
                    : `Incorrect — correct answer: ${String.fromCharCode(65 + q.correct_index)}. ${q.options[q.correct_index]}`}
                </p>
                {q.explanation && <p className="text-sm text-gray-600 dark:text-gray-400">{q.explanation}</p>}
              </div>
            </div>
          )}

          {answered && (
            <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">
              {currentQ + 1 >= quiz.questions.length ? 'See Results' : <>Next Question <ChevronRight className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Quiz results ──────────────────────────────────────────────────────────
  if (finished && quiz) {
    const finalScore = Math.round(score / quiz.questions.length * 100)
    const passed = finalScore >= 70

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="card p-6 sm:p-8 text-center">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-50 dark:bg-green-900/30' : 'bg-orange-50 dark:bg-orange-900/30'}`}>
            <Trophy className={`w-8 h-8 ${passed ? 'text-green-600' : 'text-orange-500'}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Quiz Complete!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-5">{quiz.title}</p>

          <div className="w-28 h-28 mx-auto mb-4 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={passed ? '#22c55e' : '#f97316'}
                strokeWidth="3"
                strokeDasharray={`${(finalScore / 100) * 99.9} ${99.9 - (finalScore / 100) * 99.9}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{finalScore}%</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {score} of {quiz.questions.length} correct
          </p>
          <p className={`text-sm font-semibold mb-4 ${passed ? 'text-green-600' : 'text-orange-500'}`}>
            {passed ? '🎉 Well done! You passed.' : '📚 Keep studying and try again.'}
          </p>
          <p className="text-brand-600 dark:text-brand-400 font-semibold mb-5 flex items-center justify-center gap-1.5">
            <Zap className="w-4 h-4" /> +{quiz.xp_reward} XP earned!
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowQuiz(false)
                setCurrentQ(0)
                setPicked(null)
                setAnswered(false)
                setAnswers([])
                setScore(0)
                setFinished(false)
              }}
              className="btn-secondary flex-1 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <button onClick={() => setShowQuiz(false)} className="btn-primary flex-1">
              Back to Lesson
            </button>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Question Breakdown</h3>
          <div className="space-y-3">
            {quiz.questions.map((q: any, i: number) => {
              const userPick = answers[i]
              const wasCorrect = userPick === q.correct_index

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border-2 p-4 ${
                    wasCorrect
                      ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                      : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${wasCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {wasCorrect ? <CheckCircle className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        <span className="text-gray-400 mr-1">Q{i + 1}.</span>
                        {q.question}
                      </p>
                      {wasCorrect ? (
                        <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                          ✓ Correct — {String.fromCharCode(65 + userPick)}. {q.options[userPick]}
                        </p>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-xs text-red-600 dark:text-red-400">
                            ✗ Your answer: {String.fromCharCode(65 + userPick)}. {q.options[userPick]}
                          </p>
                          <p className="text-xs text-green-700 dark:text-green-400 font-medium">
                            ✓ Correct answer: {String.fromCharCode(65 + q.correct_index)}. {q.options[q.correct_index]}
                          </p>
                        </div>
                      )}
                      {q.explanation && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 italic">{q.explanation}</p>}
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

  // ── Lesson view ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Lesson header */}
      <div className="card p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: module.color + '20' }}>
            <div className="w-6 h-6 rounded-full" style={{ background: module.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{lesson.title}</h1>
              {lesson.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{module.title}</p>
            {lesson.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{lesson.description}</p>}
          </div>
        </div>
      </div>

      {/* Lesson content */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Lesson Content
        </h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{lesson.content}</div>
        </div>
      </div>

      {/* Video */}
      {videoId && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <Youtube className="w-5 h-5 text-red-500" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">Video Lesson</span>
            {lesson.video_duration && <span className="ml-auto text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.video_duration}</span>}
          </div>
          <div className="aspect-video">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Quiz section */}
      {quiz ? (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</h2>
            {quiz.completed && <span className="ml-auto badge bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {quiz.score}%</span>}
          </div>

          {quiz.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{quiz.description}</p>}

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> {quiz.questions?.length ?? 0} questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {quiz.time_limit} min
            </span>
            <span className="flex items-center gap-1 text-purple-600 font-medium">
              <Zap className="w-3 h-3" /> +{quiz.xp_reward} XP
            </span>
          </div>

          <button
            onClick={() => {
              setShowQuiz(true)
              setCurrentQ(0)
              setPicked(null)
              setAnswered(false)
              setAnswers([])
              setScore(0)
              setFinished(false)
            }}
            className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              quiz.completed
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'bg-brand-500 hover:bg-brand-600 text-white'
            }`}
          >
            {quiz.completed ? (
              <>
                <RotateCcw className="w-4 h-4" /> Retake Quiz
              </>
            ) : (
              <>
                Start Quiz <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="card p-6 text-center text-gray-400">
          <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No quiz available for this lesson yet</p>
        </div>
      )}
    </div>
  )
}
