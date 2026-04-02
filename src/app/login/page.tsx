'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, BarChart2, GraduationCap, Target, Mail, Lock, Loader2 } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'

const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=user:email`

const features = [
  { icon: BarChart2, title: 'Smart Budgeting', desc: 'Track every dollar with intelligent categorization' },
  { icon: GraduationCap, title: 'Learn & Earn XP', desc: 'Complete modules and quizzes to level up' },
  { icon: Target, title: 'Savings Goals', desc: 'Set goals and watch your progress grow' },
]

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useSession()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Login failed'); setLoading(false); return }
      setUser(data.user)
      router.push(data.user.is_admin ? '/admin' : '/dashboard')
    } catch {
      setError('Could not connect to server')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-400 flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i+1)*120}px`, height: `${(i+1)*120}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">iBudget</span>
          </div>
          <p className="text-white/70 text-sm">Student Financial Literacy</p>
        </div>
        <div className="relative z-10 space-y-6">
          {features.map(item => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">{item.title}</p>
                <p className="text-white/70 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-white/50 text-xs">© 2024 iBudget. Built for students.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold dark:text-white">iBudget</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to your financial dashboard</p>

          {/* GitHub OAuth */}
          <a href={GITHUB_AUTH_URL}
            className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm transition-all mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </a>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-gray-50 dark:bg-gray-950 text-xs text-gray-400">or sign in with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pl-10" type="email" placeholder="you@university.edu"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="input pl-10" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
            </div>
            {error && <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            New student?{' '}
            <Link href="/register" className="text-brand-600 font-medium hover:text-brand-700">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
