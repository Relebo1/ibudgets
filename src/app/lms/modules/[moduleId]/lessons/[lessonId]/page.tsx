'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Play, Brain, CheckCircle, XCircle, Trophy, RotateCcw, Lightbulb, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function LessonDetailPage() {
  const params = useParams()
  const moduleId = params.moduleId as string
  const lessonId = params.lessonId as string
  const [lesson, setLesson] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/lessons/${lessonId}`),
      fetch(`/api/admin/quizzes?lessonId=${lessonId}`),
    ]).then(async ([lessonRes, quizRes]) => {
      const lessonData = await lessonRes.json()
      const quizzesData = await quizRes.json()
      setLesson(lessonData)
      if (quizzesData.length > 0) {
        const quizData = quizzesData[0]
        setQuiz(quizData)
        setAnswers(new Array(quizData.question_count || 0).fill(null))
      }
      setLoading(false)
    })
  }, [lessonId])

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!lesson) return <div className="text-center py-12">Lesson not found</div>

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    if (url.includes('youtube.com/embed/')) return url
    return ''
  }

  // Quiz in progress
  if (quizStarted && quiz && !completed) {
    const question = quiz.questions[currentQuestion]
    const progress = ((currentQuestion) / quiz.questions.length) * 100
    const allAnswered = answers.every(a => a !== null)

    const handleSubmit = () => {
      if (selected === null) return
      const isCorrect = selected === question.correct_index
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selected
      setAnswers(newAnswers)
      if (isCorrect) setScore(s => s + 1)
      setShowExplanation(true)
    }

    const handleNext = () => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(c => c + 1)
        setSelected(null)
        setShowExplanation(false)
      } else {
        setCompleted(true)
      }
    }

    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
              {currentQuestion + 1} / {quiz.questions.length}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {score} correct so far
            </span>
          </div>
          <button onClick={() => { setQuizStarted(false); setCurrentQuestion(0); setSelected(null); setShowExplanation(false); setScore(0); setAnswers(new Array(quiz.questions.length).fill(null)); setCompleted(false); }} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            Quit
          </button>
        </div>

        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div className="bg-brand-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="card p-6">
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium uppercase tracking-wide mb-3">Question {currentQuestion + 1}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">{question.question}</p>

          <div className="space-y-2.5 mb-6">
            {question.options.map((option: string, index: number) => {
              const isSelected = selected === index
              const isCorrect = index === question.correct_index
              const isWrong = showExplanation && isSelected && !isCorrect
              const isRight = showExplanation && isCorrect

              let style = 'flex items-center gap-3 p-4 rounded-xl border-2 transition-all '
              if (!showExplanation) {
                style += isSelected
                  ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 cursor-pointer'
                  : 'border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 cursor-pointer'
              } else {
                if (isRight) style += 'border-green-500 bg-green-50 dark:bg-green-900/20 cursor-default'
                else if (isWrong) style += 'border-red-500 bg-red-50 dark:bg-red-900/20 cursor-default'
                else style += 'border-gray-200 dark:border-gray-700 opacity-50 cursor-default'
              }

              return (
                <div key={index} className={style} onClick={() => !showExplanation && setSelected(index)}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors
                    ${!showExplanation && isSelected ? 'bg-brand-600 text-white' : ''}
                    ${isRight ? 'bg-green-500 text-white' : ''}
                    ${isWrong ? 'bg-red-500 text-white' : ''}
                    ${!isSelected && !isRight ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''}
                  `}>
                    {showExplanation && isRight ? <CheckCircle className="h-4 w-4" /> :
                     showExplanation && isWrong ? <XCircle className="h-4 w-4" /> :
                     String.fromCharCode(65 + index)}
                  </div>
                  <span className={`text-sm flex-1 ${isRight ? 'text-green-700 dark:text-green-300 font-medium' : isWrong ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-gray-100'}`}>
                    {option}
                  </span>
                </div>
              )
            })}
          </div>

          {showExplanation && question.explanation && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex gap-3 mb-6">
              <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Explanation</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{question.explanation}</p>
              </div>
            </div>
          )}

          {!showExplanation ? (
            <button onClick={handleSubmit} disabled={selected === null} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Answer
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary w-full">
              {currentQuestion < quiz.questions.length - 1 ? (
                <><span>Next Question</span><ChevronRight className="h-4 w-4 ml-1" /></>
              ) : (
                <><Trophy className="h-4 w-4 mr-2" /><span>See Results</span></>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Quiz results
  if (completed && quiz) {
    const correctCount = answers.filter((ans, idx) => ans === quiz.questions[idx].correct_index).length
    const percentage = Math.round((correctCount / quiz.questions.length) * 100)
    const passed = percentage >= 70

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Link href={`/lms/modules/${moduleId}/lessons/${lessonId}`} className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Lesson
        </Link>

        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: passed ? '#22c55e20' : '#ef444420' }}>
            {passed ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {passed ? 'Great Job!' : 'Keep Practicing'}
          </h1>
          <p className="text-4xl font-bold text-brand-600 dark:text-brand-400 mb-2">{percentage}%</p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You got {correctCount} out of {quiz.questions.length} questions correct
          </p>
          {passed && (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-6">
              <Trophy className="w-5 h-5" /> +{quiz.xp_reward} XP earned!
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

        <button onClick={() => { setQuizStarted(false); setCurrentQuestion(0); setSelected(null); setShowExplanation(false); setScore(0); setAnswers(new Array(quiz.questions.length).fill(null)); setCompleted(false); }} className="btn-primary w-full">
          <RotateCcw className="h-4 w-4 mr-2" /> Retake Quiz
        </button>
      </div>
    )
  }

  // Lesson view
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href={`/lms/modules/${moduleId}`} className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Module
      </Link>

      <div className="card p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{lesson.title}</h1>
        {lesson.duration_minutes > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Duration: {lesson.duration_minutes} minutes</p>
        )}
      </div>

      {lesson.youtube_url && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5" /> Video
          </h2>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={getYoutubeEmbedUrl(lesson.youtube_url)}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {lesson.content && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Content</h2>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>
        </div>
      )}

      {quiz && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{quiz.question_count} questions • {quiz.xp_reward} XP</p>
              </div>
            </div>
            <button onClick={() => setQuizStarted(true)} className="btn-primary flex items-center gap-2">
              <Brain className="w-4 h-4" /> Take Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
