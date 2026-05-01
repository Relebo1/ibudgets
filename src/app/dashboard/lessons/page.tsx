'use client'
import { useEffect, useState } from 'react'
import { BookOpen, Clock, Zap, CheckCircle, ChevronRight, Lock, Play } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'
import Link from 'next/link'

export default function LessonsPage() {
  const { user } = useSession()
  const [modules, setModules] = useState<any[]>([])
  const [lessons, setLessons] = useState<Record<number, any[]>>({})
  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch(`/api/modules?userId=${user.id}`)
      .then(r => r.json())
      .then(async (mods) => {
        setModules(mods)
        const lessonsMap: Record<number, any[]> = {}
        for (const mod of mods) {
          const res = await fetch(`/api/admin/lessons?moduleId=${mod.id}`)
          lessonsMap[mod.id] = await res.json()
        }
        setLessons(lessonsMap)
        setLoading(false)
      })
  }, [user])

  if (!user || loading) return null

  const totalLessons = Object.values(lessons).reduce((sum, l) => sum + l.length, 0)
  const completedLessons = Object.values(lessons).reduce((sum, l) => sum + l.filter(x => x.completed).length, 0)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{completedLessons}/{totalLessons}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lessons Completed</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-purple-600">{modules.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Modules</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-2xl font-bold text-orange-600">{totalLessons ? Math.round(completedLessons / totalLessons * 100) : 0}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Progress</p>
        </div>
      </div>

      {/* Modules and lessons */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Learning Path</h2>
        <div className="space-y-3">
          {modules.map((module) => {
            const moduleLessons = lessons[module.id] || []
            const completedCount = moduleLessons.filter(l => l.completed).length
            const isExpanded = expandedModule === module.id

            return (
              <div key={module.id} className="card overflow-hidden">
                {/* Module header */}
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                  className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: module.color + '20' }}>
                    <div className="w-5 h-5 rounded-full" style={{ background: module.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{module.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{completedCount}/{moduleLessons.length} lessons completed</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{Math.round(completedCount / moduleLessons.length * 100)}%</p>
                      <p className="text-xs text-gray-400">progress</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Progress bar */}
                <div className="px-5 pb-3">
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${completedCount / moduleLessons.length * 100}%`, background: module.color }}
                    />
                  </div>
                </div>

                {/* Lessons list */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                    {moduleLessons.length === 0 ? (
                      <div className="p-5 text-center text-gray-400 text-sm">No lessons available</div>
                    ) : (
                      moduleLessons.map((lesson, idx) => (
                        <Link
                          key={lesson.id}
                          href={`/dashboard/lessons/${module.id}/${lesson.id}`}
                          className="p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600 dark:text-gray-400">
                            {idx + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                              {lesson.youtube_url && <span className="flex items-center gap-1">📹 Video</span>}
                              {lesson.quiz_count > 0 && <span className="flex items-center gap-1">❓ {lesson.quiz_count} quiz</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {lesson.completed ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">
                                <CheckCircle className="w-3 h-3" /> Done
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2.5 py-1 rounded-lg group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
                                <Play className="w-3 h-3" /> Start
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {modules.length === 0 && (
        <div className="card p-12 text-center text-gray-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">No modules available</p>
          <p className="text-sm">Check back soon for new learning content</p>
        </div>
      )}
    </div>
  )
}
