'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Play, Brain, CheckCircle, FileText, Layers } from 'lucide-react'

export default function LessonDetailPage() {
  const params = useParams()
  const moduleId = params.moduleId as string
  const lessonId = params.lessonId as string
  const [lesson, setLesson] = useState<any>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonRes, quizRes] = await Promise.all([
          fetch(`/api/admin/lessons/${lessonId}`),
          fetch(`/api/admin/quizzes?lessonId=${lessonId}`),
        ])
        const lessonData = await lessonRes.json()
        const quizzesData = await quizRes.json()
        setLesson(lessonData)
        if (quizzesData.length > 0) setQuiz(quizzesData[0])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'Video': return <Play className="w-5 h-5" />
      case 'Written': return <FileText className="w-5 h-5" />
      case 'Mixed': return <Layers className="w-5 h-5" />
      default: return null
    }
  }

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'Video': return 'text-red-600 dark:text-red-400'
      case 'Written': return 'text-blue-600 dark:text-blue-400'
      case 'Mixed': return 'text-purple-600 dark:text-purple-400'
      default: return ''
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href={`/learn/modules/${moduleId}`} className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Module
      </Link>

      <div className="card p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getLessonTypeColor(lesson.lesson_type)}`}>
            {getLessonTypeIcon(lesson.lesson_type)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{lesson.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                {lesson.lesson_type}
              </span>
              {lesson.duration_minutes > 0 && (
                <span className="text-sm text-gray-600 dark:text-gray-400">⏱️ {lesson.duration_minutes} min</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {(lesson.lesson_type === 'Video' || lesson.lesson_type === 'Mixed') && lesson.youtube_url && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-red-600" /> Video
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

      {(lesson.lesson_type === 'Written' || lesson.lesson_type === 'Mixed') && lesson.content && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Content
          </h2>
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {lesson.content}
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
            <Link href={`/learn/modules/${moduleId}/lessons/${lessonId}/quiz/${quiz.id}`} className="btn-primary flex items-center gap-2">
              <Brain className="w-4 h-4" /> Take Quiz
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
