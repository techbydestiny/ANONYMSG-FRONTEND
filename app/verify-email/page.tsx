// frontend/app/verify-email/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-email/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email })
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')
          setTimeout(() => router.push('/login'), 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Verifying...</h2>
            <p className="text-gray-400">Please wait while we verify your email.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <Link href="/login">
              <button className="px-6 py-2 bg-blue-600 rounded-lg text-white">
                Go to Login
              </button>
            </Link>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <Link href="/login">
              <button className="px-6 py-2 bg-blue-600 rounded-lg text-white">
                Back to Login
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}