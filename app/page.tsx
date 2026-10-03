'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (token) {
      router.push('/home')
    } else {
      router.push('/auth')
    }
  }, [router])

  return (
    <div className="min-h-screen-dvh flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-4">
          <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">CystaNiva</h1>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  )
}
