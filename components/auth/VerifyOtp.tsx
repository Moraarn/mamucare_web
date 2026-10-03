'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, LockKeyhole } from 'lucide-react'
import Button from '@/components/ui/Button'

type Status = { expiresAt?: string; maskedDestination?: string; resendAfter?: number; deliveryFailed?: boolean; message?: string; retryAfter?: number }

export default function VerifyOtp() {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const [destination, setDestination] = useState('your phone')
  const [resendAt, setResendAt] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<'verify' | 'resend' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const inFlight = useRef(false)

  function cooldown(seconds: number) {
    setResendAt(Date.now() + seconds * 1000)
    setRemaining(seconds)
  }

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch('/api/auth/otp-status', { cache: 'no-store', signal: controller.signal })
        const data: Status = await response.json()
        if (!response.ok) { setError(data.message || 'Please restart signup to verify your phone.'); return }
        setDestination(data.maskedDestination || 'your phone')
        const seconds = data.resendAfter || 0
        setResendAt(Date.now() + seconds * 1000)
        setRemaining(seconds)
        if (data.deliveryFailed) setError(data.message || 'Your code could not be sent. Please request a new code.')
        else if (data.expiresAt && Date.parse(data.expiresAt) <= Date.now()) setError('Your code has expired. Please request a new code.')
        else setNotice('We sent a 6-digit code to your phone. The code expires in 5 minutes.')
      } catch {
        if (!controller.signal.aborted) setError('Unable to connect. Refresh this page to try again.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000))), 1000)
    return () => window.clearInterval(timer)
  }, [resendAt])

  async function request(action: 'verify' | 'resend') {
    if (inFlight.current || loading || (action === 'verify' && code.length !== 6) || (action === 'resend' && remaining > 0)) return
    inFlight.current = true
    setBusy(action); setError(null); setNotice(null)
    try {
      const response = await fetch(`/api/auth/${action === 'verify' ? 'verify-otp' : 'resend-otp'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'verify' ? { code } : {}),
      })
      const data: Status & { success?: boolean } = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Unable to complete verification. Please try again.')
        if (action === 'resend' && data.retryAfter) cooldown(data.retryAfter)
        return
      }
      if (action === 'verify') { router.replace('/home'); router.refresh(); return }
      setCode('')
      cooldown(data.resendAfter || 45)
      if (data.deliveryFailed) setError(data.message || 'We could not send your code. Please try again after the countdown.')
      else setNotice('A new code has been sent. Please use the most recent code.')
      input.current?.focus()
    } catch {
      setError('Unable to connect. Check your connection and try again.')
    } finally { setBusy(null); inFlight.current = false }
  }

  return (
    <main className="min-h-screen-dvh flex items-center justify-center p-4 sm:p-6 bg-surface">
      <section className="content-panel w-full max-w-md space-y-6" aria-labelledby="verify-title" aria-busy={loading || !!busy}>
        <Link href="/auth" className="auth-brand text-primary"><span className="app-brand-mark"><Heart size={22} aria-hidden="true" /></span>MamuCare</Link>
        <div className="space-y-2">
          <h1 id="verify-title" className="text-3xl">Verify your phone number</h1>
          <p className="text-sm leading-relaxed text-text-secondary">Enter the 6-digit code sent to <span className="font-medium text-text-primary">{destination}</span>.</p>
        </div>
        <form className="space-y-4" onSubmit={event => { event.preventDefault(); void request('verify') }}>
          <label htmlFor="signup-otp" className="block text-sm font-medium">Verification code</label>
          <input ref={input} id="signup-otp" type="text" inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{6}" maxLength={6} required value={code} disabled={loading || !!busy}
            aria-describedby="otp-help otp-feedback" aria-invalid={!!error}
            onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            onPaste={event => {
              event.preventDefault()
              setCode(event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6))
            }}
            className="w-full rounded-xl border px-4 py-4 text-center text-2xl tracking-[0.4em] focus:ring-2 focus:ring-secondary" />
          <p id="otp-help" className="text-xs text-text-secondary">You can type or paste your code. Never share it with anyone.</p>
          <div id="otp-feedback" aria-live="polite" aria-atomic="true">
            {error && <p role="alert" className="rounded-lg bg-red-light p-3 text-sm text-danger">{error}</p>}
            {notice && <p role="status" className="text-sm text-text-secondary">{notice}</p>}
          </div>
          <Button type="submit" fullWidth disabled={loading || !!busy || code.length !== 6}>{busy === 'verify' ? 'Verifying...' : 'Verify phone number'}</Button>
        </form>
        <div className="space-y-2 text-center text-sm">
          <p className="text-text-secondary">Didn&apos;t receive the code?</p>
          <button type="button" onClick={() => void request('resend')} disabled={loading || !!busy || remaining > 0}
            className="font-medium text-primary disabled:text-text-secondary disabled:cursor-not-allowed">
            {busy === 'resend' ? 'Sending...' : remaining > 0 ? `Resend code in ${remaining}s` : 'Resend code'}
          </button>
          <p><Link href="/auth" className="text-text-secondary underline">Return to sign in or restart signup</Link></p>
        </div>
        <p className="flex items-center justify-center gap-2 text-xs text-text-secondary"><LockKeyhole size={13} aria-hidden="true" />Your account stays pending until your phone is verified.</p>
      </section>
    </main>
  )
}
