'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, BookMarked, Brain, Plus } from 'lucide-react'

export default function LMSPage() {
  const [stats, setStats] = useState({ modules: 0, lessons: 0, quizzes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/modules').then(r => r.json()),
      fetch('/api/admin/lessons').then(r => r.json()),
      fetch('/api/admin/quizzes').then(r => r.json()),
    ]).then(([modules, lessons, quizzes]) => {
      setStats({
        modules: modules.length,
        lessons: lessons.length,
        quizzes: quizzes.length,
      })
      setLoading(false)
    })
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
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
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
    </div>
  )
}
