'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, BookMarked, Clock, CheckCircle } from 'lucide-react'

export default function ModuleDetailPage() {
  const params = useParams()
  const moduleId = params.moduleId as string
  const [module, setModule] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moduleRes, lessonsRes] = await Promise.all([
          fetch(`/api/admin/modules/${moduleId}`),
          fetch(`/api/admin/lessons?moduleId=${moduleId}`),
        ])
        const moduleData = await moduleRes.json()
        const lessonsData = await lessonsRes.json()
        setModule(moduleData)
        setLessons(lessonsData)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [moduleId])

  if (loading) return <div className="text-center py-12">Loading...</div>
  if (!module) return <div className="text-center py-12">Module not found</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/learn/modules" className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Modules
      </Link>

      <div className="card p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: module.color + '20' }}>
            <BookMarked className="w-8 h-8" style={{ color: module.color }} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{module.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{module.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">{module.category}</span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300">{module.difficulty}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Lessons ({lessons.length})</h2>
        <div className="space-y-2">
          {lessons.map((lesson, idx) => (
            <Link key={lesson.id} href={`/learn/modules/${moduleId}/lessons/${lesson.id}`} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-brand-600 dark:text-brand-400 font-semibold">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{lesson.title}</p>
                {lesson.duration_minutes > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {lesson.duration_minutes} min
                  </p>
                )}
              </div>
              <CheckCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
