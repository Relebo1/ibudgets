'use client'
import { useState } from 'react'
import {
  BookOpen, Brain, CreditCard, Banknote, Pencil,
  Flame, Zap, Trophy, CheckCircle, Target, Shield, Star,
} from 'lucide-react'
import { fmt } from '@/lib/currency'
import { useSession } from '@/lib/SessionProvider'

export default function ProfilePage() {
  const { user, setUser } = useSession()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    school: user?.school ?? '',
    major: user?.major ?? '',
    year: user?.year ?? 'Freshman',
  })

  if (!user) return null

  const totalXP = user.xp
  const xpToNext = 500 - (totalXP % 500)

  const achievements = [
    { Icon: Target,   label: 'First Budget', earned: true },
    { Icon: Banknote, label: 'Saver',        earned: user.total_saved > 0 },
    { Icon: Brain,    label: 'Quiz Master',  earned: user.xp >= 100 },
    { Icon: Flame,    label: '7-Day Streak', earned: user.streak >= 7 },
    { Icon: BookOpen, label: 'Scholar',      earned: user.xp >= 350 },
    { Icon: Trophy,   label: 'Level 10',     earned: user.level >= 10 },
  ]

  const activityItems = [
    { Icon: CheckCircle, text: 'Completed Budgeting Basics module', time: '2 days ago', bg: 'bg-brand-50 dark:bg-brand-900/30', color: 'text-brand-600 dark:text-brand-400' },
    { Icon: Brain,       text: 'Scored 90% on Budgeting Basics Quiz', time: '2 days ago', bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-600' },
    { Icon: Banknote,    text: 'Added deposit to Emergency Fund', time: '3 days ago', bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600' },
    { Icon: CreditCard,  text: 'Logged expense: Campus Cafeteria', time: '4 days ago', bg: 'bg-orange-50 dark:bg-orange-900/30', color: 'text-orange-600' },
  ]

  const stats = [
    { label: 'Total XP',    value: user.xp.toLocaleString(), Icon: Zap,      color: 'text-purple-600' },
    { label: 'Streak',      value: `${user.streak}d`,        Icon: Flame,    color: 'text-orange-600' },
    { label: 'Total Spent', value: fmt(user.total_spent),    Icon: CreditCard, color: 'text-red-500' },
    { label: 'Total Saved', value: fmt(user.total_saved),    Icon: Banknote, color: 'text-blue-600' },
  ]

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const updated = await res.json()
        setUser({ ...user, ...updated })
        setEditing(false)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Level {user.level}
                  </span>
                  <span className="badge bg-orange-50 text-orange-700 dark:bg-orange-900/40 flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {user.streak} day streak
                  </span>
                  <span className="badge bg-purple-50 text-purple-700 dark:bg-purple-900/40 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {totalXP.toLocaleString()} XP
                  </span>
                </div>
              </div>
              <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Level {user.level}</span>
                <span>{xpToNext} XP to Level {user.level + 1}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                  style={{ width: `${((totalXP % 500) / 500) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {editing && (
          <form className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={handleSave}>
            {[
              { key: 'name',   label: 'Full Name', type: 'text' },
              { key: 'email',  label: 'Email',     type: 'email' },
              { key: 'school', label: 'School',    type: 'text' },
              { key: 'major',  label: 'Major',     type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                <input className="input" type={f.type} value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year</label>
              <select className="input" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}>
                {['Freshman','Sophomore','Junior','Senior','Graduate'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="flex justify-center mb-2">
              <s.Icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Achievements</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {achievements.map(a => (
            <div key={a.label} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${a.earned ? 'bg-brand-50 dark:bg-brand-900/30' : 'bg-gray-50 dark:bg-gray-800 opacity-40'}`}>
              <a.Icon className={`w-6 h-6 ${a.earned ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
              <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300">{a.label}</span>
              {a.earned && <CheckCircle className="w-3.5 h-3.5 text-brand-500" />}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activityItems.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-9 h-9 ${a.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <a.Icon className={`w-4 h-4 ${a.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">{a.text}</p>
                <p className="text-xs text-gray-400">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
