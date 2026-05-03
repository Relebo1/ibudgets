'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Zap, Home, Brain } from 'lucide-react'

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/modules')
      .then(r => r.json())
      .then(data => {
        setModules(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setModules([])
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="text-center py-12">Loading modules...</div>

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Learning Modules</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Expand your financial knowledge</p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors">
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(m => (
          <Link key={m.id} href={`/lms/modules/${m.id}`} className="card card-hover p-6 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: m.color + '20' }}>
                <BookOpen className="w-6 h-6" style={{ color: m.color }} />
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ background: m.color + '20', color: m.color }}>
                {m.difficulty}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{m.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{m.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {m.lesson_count} lessons
              </span>
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" /> {m.quiz_count} quizzes
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" /> {m.xp_reward} XP
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
