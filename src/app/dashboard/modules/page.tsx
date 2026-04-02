'use client'
import { useEffect, useState } from 'react'
import { Clock, BookOpen, Zap, CheckCircle, ChevronRight } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'

const diffColors: Record<string, string> = {
  Beginner: 'bg-green-50 text-green-700',
  Intermediate: 'bg-orange-50 text-orange-700',
  Advanced: 'bg-red-50 text-red-700',
}

export default function ModulesPage() {
  const { user } = useSession()
  const [modules, setModules] = useState<any[]>([])
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    if (!user) return
    fetch(`/api/modules?userId=${user.id}`).then(r => r.json()).then(setModules)
  }, [user])

  if (!user) return null

  const filtered = filter === 'All' ? modules : modules.filter(m => m.difficulty === filter)
  const completed = modules.filter(m => m.completed).length
  const totalXP = modules.filter(m => m.completed).reduce((s: number, m: any) => s + m.xp_reward, 0)

  const startModule = async (id: number) => {
    const m = modules.find(m => m.id === id)
    if (!m || m.completed) return
    const newProgress = m.progress === 0 ? 10 : Math.min(m.progress + 20, 100)
    const isCompleted = newProgress === 100
    await fetch('/api/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, moduleId: id, progress: newProgress, completed: isCompleted, completedLessons: Math.round(m.lessons * newProgress / 100) }),
    })
    setModules(prev => prev.map(m => m.id === id ? { ...m, progress: newProgress, completed: isCompleted } : m))
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{completed}/{modules.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalXP.toLocaleString()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">XP Earned</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-orange-600">{modules.length ? Math.round(completed / modules.length * 100) : 0}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Curriculum</p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Learning Modules</h2>
        <div className="flex gap-2">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map(d => (
            <button key={d} onClick={() => setFilter(d)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${filter === d ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-300'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m: any) => (
          <div key={m.id} className="card card-hover p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: m.color + '20' }}>
                <div className="w-5 h-5 rounded-full" style={{ background: m.color }} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`badge ${diffColors[m.difficulty]}`}>{m.difficulty}</span>
                {m.completed == 1 && <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Done</span>}
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{m.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex-1">{m.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.duration}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {m.lessons} lessons</span>
              <span className="flex items-center gap-1 text-purple-600 font-medium"><Zap className="w-3 h-3" /> +{m.xp_reward}</span>
            </div>
            {m.progress > 0 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{m.completed_lessons}/{m.lessons} lessons</span>
                  <span style={{ color: m.color }}>{m.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: m.color }} />
                </div>
              </div>
            )}
            <button onClick={() => startModule(m.id)}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 ${m.completed == 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-default' : m.progress > 0 ? 'bg-brand-500 hover:bg-brand-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
              disabled={m.completed == 1}>
              {m.completed == 1 ? <><CheckCircle className="w-4 h-4" /> Completed</> : m.progress > 0 ? <>Continue <ChevronRight className="w-4 h-4" /></> : <>Start Module <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
