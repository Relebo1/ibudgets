'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Brain, Users, ArrowRight } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState({ modules: 0, quizzes: 0 })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/modules').then(r => r.json()),
      fetch('/api/admin/quizzes').then(r => r.json()),
    ]).then(([modules, quizzes]) => {
      setStats({ modules: modules.length, quizzes: quizzes.length })
    })
  }, [])

  const cards = [
    { label: 'Total Modules', value: stats.modules, Icon: BookOpen, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/30', href: '/admin/modules' },
    { label: 'Total Quizzes', value: stats.quizzes, Icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30', href: '/admin/quizzes' },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Manage learning content for iBudget students</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(c => (
          <Link key={c.label} href={c.href} className="card card-hover p-6 flex items-center gap-4">
            <div className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <c.Icon className={`w-6 h-6 ${c.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{c.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{c.label}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/modules" className="btn-primary text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Add Module
          </Link>
          <Link href="/admin/quizzes" className="btn-secondary text-sm flex items-center gap-2">
            <Brain className="w-4 h-4" /> Add Quiz
          </Link>
        </div>
      </div>
    </div>
  )
}
