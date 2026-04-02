'use client'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from '@/lib/SessionProvider'
import { Loader2 } from 'lucide-react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useSession()

  useEffect(() => {
    const userParam = searchParams.get('user')
    const error = searchParams.get('error')

    if (error) {
      router.replace(`/login?error=${error}`)
      return
    }

    if (userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        setUser(user)
        router.replace('/dashboard')
      } catch {
        router.replace('/login?error=parse_error')
      }
    } else {
      router.replace('/login')
    }
  }, [searchParams, setUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Signing you in with GitHub...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
