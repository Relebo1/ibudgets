'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, BookMarked, Brain, Plus } from 'lucide-react'
import { PageHeader, StatCard, Card, Button, LoadingState, EmptyState } from '@/components/admin/ui'

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

  if (loading) return <LoadingState />

  return (
    <div className="space-y-8">
      <PageHeader
        title="Learning Management System"
        description="Create and manage courses, lessons, and quizzes"
        action={
          <Link href="/admin/lms/modules">
            <Button icon={Plus}>Create Module</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/lms/modules">
          <StatCard label="Modules" value={stats.modules} icon={BookOpen} color="blue" />
        </Link>
        <Link href="/admin/lms/lessons">
          <StatCard label="Lessons" value={stats.lessons} icon={BookMarked} color="green" />
        </Link>
        <Link href="/admin/lms/quizzes">
          <StatCard label="Quizzes" value={stats.quizzes} icon={Brain} color="purple" />
        </Link>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your learning content</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/lms/modules">
              <Button variant="secondary" size="sm" icon={Plus}>Module</Button>
            </Link>
            <Link href="/admin/lms/lessons">
              <Button variant="secondary" size="sm" icon={Plus}>Lesson</Button>
            </Link>
            <Link href="/admin/lms/quizzes">
              <Button variant="secondary" size="sm" icon={Plus}>Quiz</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
