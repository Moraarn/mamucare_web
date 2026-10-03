'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clientApi } from '@/lib/clientApi'

interface LoginCredentials {
  phone: string
  password: string
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const login = async (credentials: LoginCredentials) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 LOGIN START')
    }
    setIsLoading(true)
    setError(null)

    try {
      const response = await clientApi.post('/auth/login', credentials)

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ LOGIN RESPONSE:', response)
      }

      const user = response.user
      const token = response.accessToken

      if (!user || !token) {
        throw new Error('Invalid login response (missing user/token)')
      }

      // SINGLE SOURCE OF TRUTH (frontend session)
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('accessToken', token)

      if (process.env.NODE_ENV === 'development') {
        console.log('💾 SESSION STORED')
      }

      return {
        success: true,
        user,
        token,
      }
    } catch (err: any) {
      console.error('❌ LOGIN ERROR:', err)
      
      // Check if it's a network error (failed to fetch, CORS, server unavailable)
      const isNetworkError = 
        err.message === 'Failed to fetch' ||
        err.message.includes('NetworkError') ||
        err.message.includes('ECONNREFUSED') ||
        err.message.includes('fetch failed') ||
        err.name === 'TypeError' && err.message === 'Failed to fetch'
      
      const errorMessage = isNetworkError 
        ? 'Failed to connect to server. Please check your internet connection and try again.'
        : err.message || 'Login failed'
      
      setError(errorMessage)

      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsLoading(false)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 LOGIN END')
      }
    }
  }

  const signup = async (data: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await clientApi.post('/auth/register', data)

      const user = response.user
      const token = response.accessToken

      if (!user || !token) {
        throw new Error('Invalid signup response (missing user/token)')
      }

      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('accessToken', token)

      return { success: true, user, token }
    } catch (err: any) {
      console.error('❌ SIGNUP ERROR:', err)
      
      // Check if it's a network error (failed to fetch, CORS, server unavailable)
      const isNetworkError = 
        err.message === 'Failed to fetch' ||
        err.message.includes('NetworkError') ||
        err.message.includes('ECONNREFUSED') ||
        err.message.includes('fetch failed') ||
        err.name === 'TypeError' && err.message === 'Failed to fetch'
      
      const errorMessage = isNetworkError 
        ? 'Failed to connect to server. Please check your internet connection and try again.'
        : err.message || 'Signup failed'
      
      setError(errorMessage)
      
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('accessToken')
    router.replace('/auth')
  }

  return {
    login,
    signup,
    logout,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}