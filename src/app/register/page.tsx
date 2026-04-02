'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DollarSign, User, Mail, Lock, GraduationCap, BookOpen, Loader2, CheckCircle } from 'lucide-react'
import { useSession } from '@/lib/SessionProvider'

const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=user:email`

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    school: '', major: '', year: 'Freshman',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
      setError('')
      setStep(2)
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          school: form.school, major: form.major, year: form.year,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Registration failed'); setLoading(false); return }
      setUser(data.user)
      router.push('/dashboard')
    } catch {
      setError('Could not connect to server')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
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
        <div className="relative z-10 space-y-4">
          {[
            { n: 1, label: 'Account Details', desc: 'Name, email and password' },
            { n: 2, label: 'Academic Info', desc: 'School, major and year' },
          ].map(s => (
            <div key={s.n} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${step === s.n ? 'bg-white/20' : 'opacity-50'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${step > s.n ? 'bg-white text-brand-600' : 'bg-white/20 text-white'}`}>
                {step > s.n ? <CheckCircle className="w-5 h-5" /> : s.n}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{s.label}</p>
                <p className="text-white/70 text-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-white/50 text-xs">© 2024 iBudget. Built for students.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold dark:text-white">iBudget</span>
          </div>

          <div className="flex gap-2 mb-6 lg:hidden">
            {[1, 2].map(n => (
              <div key={n} className={`h-1.5 flex-1 rounded-full transition-all ${step >= n ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {step === 1 ? 'Create account' : 'Academic info'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {step === 1 ? 'Start your financial literacy journey' : 'Help us personalise your experience'}
          </p>

          {/* GitHub OAuth — only on step 1 */}
          {step === 1 && (
            <>
              <a href={GITHUB_AUTH_URL}
                className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm transition-all mb-5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Sign up with GitHub
              </a>
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-gray-50 dark:bg-gray-950 text-xs text-gray-400">or register with email</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input pl-10" placeholder="Alex Johnson" value={form.name}
                      onChange={e => set('name', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input pl-10" type="email" placeholder="you@university.edu" value={form.email}
                      onChange={e => set('email', e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input pl-10" type="password" placeholder="Min. 8 characters" value={form.password}
                      onChange={e => set('password', e.target.value)} required minLength={8} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input pl-10" type="password" placeholder="Repeat password" value={form.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">School / University</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input pl-10" placeholder="e.g. National University of Lesotho" value={form.school}
                      onChange={e => set('school', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Major / Field of Study</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input pl-10" placeholder="e.g. Computer Science" value={form.major}
                      onChange={e => set('major', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year of Study</label>
                  <select className="input" value={form.year} onChange={e => set('year', e.target.value)}>
                    {['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'].map(y => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              )}
              <button type="submit" disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
                  : step === 1 ? 'Continue →' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
