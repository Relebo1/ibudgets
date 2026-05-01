'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, BookMarked, Brain, Plus, Clock } from 'lucide-react'

export default function LMSAdminPage() {
  const [stats, setStats] = useState({ modules: 0, lessons: 0, quizzes: 0 })
  const [recentModules, setRecentModules] = useState<any[]>([])
  const [recentLessons, setRecentLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesRes, lessonsRes, quizzesRes] = await Promise.all([
          fetch('/api/admin/modules'),
          fetch('/api/admin/lessons'),
          fetch('/api/admin/quizzes'),
        ])

        const modules = await modulesRes.json()
        const lessons = await lessonsRes.json()
        const quizzes = await quizzesRes.json()

        setStats({
          modules: modules.length,
          lessons: lessons.length,
          quizzes: quizzes.length,
        })

        setRecentModules(modules.slice(-3).reverse())
        setRecentLessons(lessons.slice(-3).reverse())
      } catch (error) {
        console.error('Failed to fetch LMS data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    { label: 'Modules', value: stats.modules, Icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', href: '/admin/lms/modules' },
    { label: 'Lessons', value: stats.lessons, Icon: BookMarked, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', href: '/admin/lms/lessons' },
    { label: 'Quizzes', value: stats.quizzes, Icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30', href: '/admin/lms/quizzes' },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Learning Management System</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage courses, lessons, and quizzes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(card => (
          <Link key={card.label} href={card.href} className="card card-hover p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats[card.label.toLowerCase() as keyof typeof stats]}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/lms/modules" className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Module
          </Link>
          <Link href="/admin/lms/lessons" className="btn-secondary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Lesson
          </Link>
          <Link href="/admin/lms/quizzes" className="btn-secondary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Quiz
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Modules</h2>
            <Link href="/admin/lms/modules" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View all</Link>
          </div>
          {recentModules.length === 0 ? (
            <p className="text-sm text-gray-400">No modules yet</p>
          ) : (
            <div className="space-y-3">
              {recentModules.map(module => (
                <Link key={module.id} href={`/admin/lms/modules/${module.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: module.color + '20' }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: module.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{module.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{module.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Lessons</h2>
            <Link href="/admin/lms/lessons" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View all</Link>
          </div>
          {recentLessons.length === 0 ? (
            <p className="text-sm text-gray-400">No lessons yet</p>
          ) : (
            <div className="space-y-3">
              {recentLessons.map(lesson => (
                <Link key={lesson.id} href={`/admin/lms/lessons/${lesson.id}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <BookMarked className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{lesson.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {lesson.duration_minutes > 0 && (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration_minutes} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
