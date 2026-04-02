'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, X, TrendingUp } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'
import { fmt } from '@/lib/currency'

interface Alert {
  id: number
  category: string
  pct: number
  spent: number
  allocated: number
  color: string
}

export default function BudgetAlerts() {
  const { user } = useSession()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [dismissed, setDismissed] = useState<number[]>([])

  useEffect(() => {
    if (!user) return
    fetch(`/api/budgets?userId=${user.id}`)
      .then(r => r.json())
      .then((budgets: any[]) => {
        const triggered: Alert[] = budgets
          .filter(b => b.allocated > 0)
          .map(b => ({ id: b.id, category: b.category, pct: Math.round(b.spent / b.allocated * 100), spent: Number(b.spent), allocated: Number(b.allocated), color: b.color }))
          .filter(b => b.pct >= 80)
        setAlerts(triggered)
      })
  }, [user])

  const visible = alerts.filter(a => !dismissed.includes(a.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {visible.map(a => (
        <div key={a.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${a.pct >= 100 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' : 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'}`}>
          {a.pct >= 100
            ? <TrendingUp className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            : <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />}
          <div className="flex-1">
            <span className={`font-semibold ${a.pct >= 100 ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'}`}>
              {a.pct >= 100 ? 'Over budget! ' : `${a.pct}% used — `}
            </span>
            <span className={a.pct >= 100 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}>
              {a.category}: {fmt(a.spent)} of {fmt(a.allocated)} spent
            </span>
          </div>
          <button onClick={() => setDismissed(d => [...d, a.id])} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
