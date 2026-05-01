'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Brain, ArrowRight, Plus, X, Youtube } from 'lucide-react'

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444']
const CATEGORIES = ['Budgeting', 'Saving', 'Investing', 'Debt Management', 'Financial Planning', 'Banking', 'Credit', 'Taxes']
const DURATIONS = ['15 min', '30 min', '45 min', '1 hour', '1.5 hours', '2 hours']
const emptyModule = { title: '', description: '', youtube_url: '', category: 'Budgeting', duration: '30 min', difficulty: 'Beginner', xpReward: '100', lessons: '5', color: '#22c55e' }

export default function AdminPage() {
  const [stats, setStats] = useState({ modules: 0, quizzes: 0 })
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyModule)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/modules').then(r => r.json()),
      fetch('/api/admin/quizzes').then(r => r.json()),
    ]).then(([modules, quizzes]) => {
      setStats({ modules: modules.length, quizzes: quizzes.length })
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { alert('Title is required'); return }
    if (!form.category) { alert('Category is required'); return }
    if (Number(form.xpReward) < 10) { alert('XP Reward must be at least 10'); return }
    if (Number(form.lessons) < 1) { alert('Lessons must be at least 1'); return }
    
    await fetch('/api/admin/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, xpReward: Number(form.xpReward), lessons: Number(form.lessons) }),
    })
    setStats(s => ({ ...s, modules: s.modules + 1 }))
    setForm(emptyModule)
    setShowModal(false)
  }

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
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Module
          </button>
          <Link href="/admin/quizzes" className="btn-secondary text-sm flex items-center gap-2">
            <Brain className="w-4 h-4" /> Add Quiz
          </Link>
          <Link href="/admin/modules" className="btn-secondary text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Manage Modules
          </Link>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">New Module</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input className="input" placeholder="e.g. Budgeting Basics" value={form.title} onChange={e => set('title', e.target.value)} maxLength={150} required />
                <p className="text-xs text-gray-400 mt-1">{form.title.length}/150</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea className="input resize-none" rows={2} placeholder="Brief overview of what students will learn" value={form.description} onChange={e => set('description', e.target.value)} maxLength={500} />
                <p className="text-xs text-gray-400 mt-1">{form.description.length}/500</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-red-500" /> YouTube URL (Optional)
                </label>
                <input className="input" placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">Paste full URL or video ID</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select className="input" value={form.category} onChange={e => set('category', e.target.value)} required>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration</label>
                  <select className="input" value={form.duration} onChange={e => set('duration', e.target.value)}>
                    {DURATIONS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                    {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">XP Reward <span className="text-red-500">*</span></label>
                  <input className="input" type="number" value={form.xpReward} onChange={e => set('xpReward', e.target.value)} min="10" max="1000" />
                  <p className="text-xs text-gray-400 mt-1">10-1000</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Lessons <span className="text-red-500">*</span></label>
                  <input className="input" type="number" value={form.lessons} onChange={e => set('lessons', e.target.value)} min="1" max="20" />
                  <p className="text-xs text-gray-400 mt-1">1-20</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => set('color', c)}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Create Module</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
