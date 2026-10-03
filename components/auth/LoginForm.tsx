'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import PhoneInput from './PhoneInput'
import { normalizePhone } from '@/lib/phone'
import PasswordInput from './PasswordInput'

interface LoginFormProps {
  onSwitchToSignup: () => void
  onSuccess: () => void
}

export default function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePhoneChange = (fullNumber: string) => {
    setPhone(fullNumber)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate phone before submission
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) {
      setError('Please enter a valid phone number')
      return
    }

    setIsLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: normalizedPhone, password }),
    })

    const data = await res.json().catch(() => null)

    setIsLoading(false)

    if (!res.ok) {
      setError(data?.message ?? 'Login failed')
      return
    }

    onSuccess()
    router.replace('/home')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Phone number
        </label>
        <PhoneInput
          value={phone}
          onChange={handlePhoneChange}
          placeholder="712 345 678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Password
        </label>
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="text-sm p-3 rounded-lg" style={{ color: 'var(--color-danger)', backgroundColor: 'var(--color-red-light)' }}>
          {error}
        </div>
      )}

      <div className="text-right">
        <button type="button" disabled aria-describedby="password-recovery-help" className="text-sm font-medium text-[var(--color-text-secondary)] cursor-not-allowed">
          Forgot password?
        </button>
        <p id="password-recovery-help" className="mt-1 text-xs text-[var(--color-text-secondary)]">Password reset is not available yet.</p>
      </div>

      <Button
        type="submit"
        fullWidth
        disabled={isLoading || !phone.trim() || !password.trim()}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="pt-2 text-center text-sm text-[var(--color-text-secondary)]">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitchToSignup} disabled={isLoading} className="font-semibold text-[var(--color-primary)] hover:underline">Create an account</button>
      </p>
    </form>
  )
}
