'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, Zap } from 'lucide-react'

export default function QuizPage() {
  const params = useParams()
  const moduleId = params.moduleId as string
  const lessonId = params.lessonId as string
  const quizId = params.quizId as string
  const [quiz, setQuiz] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/admin/quizzes/${quizId}`)
        const data = await res.json()
        setQuiz(data)
        setAnswers(new Array(data.questions?.length || 0).fill(null))
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [quizId])

  if (loading) return <div className="text-center py-12">Loading quiz...</div>
  if (!quiz || !quiz.questions) return <div className="text-center py-12">Quiz not found</div>

  const question = quiz.questions[currentQuestion]
  const isAnswered = answers[currentQuestion] !== null
  const isCorrect = answers[currentQuestion] === question.correct_index
  const allAnswered = answers.every(a => a !== null)

  const handleAnswer = (index: number) => {
    if (!submitted) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = index
      setAnswers(newAnswers)
    }
  }

  const handleSubmit = async () => {
    if (!allAnswered) { alert('Please answer all questions'); return }
    setSubmitted(true)
  }

  const correctCount = answers.filter((ans, idx) => ans === quiz.questions[idx].correct_index).length
  const score = Math.round((correctCount / quiz.questions.length) * 100)

  if (submitted) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Link href={`/learn/modules/${moduleId}/lessons/${lessonId}`} className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Lesson
        </Link>

        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: score >= 70 ? '#22c55e20' : '#ef444420' }}>
            {score >= 70 ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {score >= 70 ? 'Great Job!' : 'Keep Practicing'}
          </h1>
          <p className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">{score}%</p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You got {correctCount} out of {quiz.questions.length} questions correct
          </p>
          {score >= 70 && (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-6">
              <Zap className="w-5 h-5" /> +{quiz.xp_reward} XP earned!
            </div>
          )}
        </div>

        <div className="space-y-4">
          {quiz.questions.map((q: any, idx: number) => (
            <div key={idx} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: answers[idx] === q.correct_index ? '#22c55e20' : '#ef444420' }}>
                  {answers[idx] === q.correct_index ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{idx + 1}. {q.question}</p>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div key={optIdx} className={`p-2 rounded text-sm ${
                        optIdx === q.correct_index ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' :
                        optIdx === answers[idx] && answers[idx] !== q.correct_index ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
                        'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}. {opt}
                        {optIdx === q.correct_index && ' ✓'}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link href={`/learn/modules/${moduleId}`} className="btn-primary w-full text-center">
          Back to Module
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link href={`/learn/modules/${moduleId}/lessons/${lessonId}`} className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Lesson
      </Link>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{quiz.title}</h1>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-brand-600 h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{question.question}</h2>
        <div className="space-y-3">
          {question.options.map((option: string, idx: number) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={submitted}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                answers[currentQuestion] === idx
                  ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700'
              } ${submitted ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestion] === idx ? 'border-brand-600 bg-brand-600' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {answers[currentQuestion] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{String.fromCharCode(65 + idx)}. {option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentQuestion < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="btn-secondary flex-1"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  )
}
