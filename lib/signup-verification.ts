import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, accessCookieOptions, refreshCookieOptions, getBackendApiUrl } from './auth'

export const SIGNUP_COOKIE = 'signup_challenge'
const challengeCookie = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/api/auth', maxAge: 24 * 60 * 60 }

type VerificationResult = {
  success?: boolean
  requiresVerification?: boolean
  challengeId?: string
  maskedDestination?: string
  expiresAt?: string
  resendAfter?: number
  deliveryFailed?: boolean
  message?: unknown
  retryAfter?: number
  accessToken?: string
  refreshToken?: string
  user?: unknown
}

export function validOrigin(req: Request) {
  const origin = req.headers.get('origin')
  return !origin || origin === new URL(req.url).origin
}

export async function backendSignup(action: string, body: unknown) {
  const response = await fetch(`${getBackendApiUrl()}/api/v1/auth/${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(20_000),
  })
  const data: VerificationResult | null = await response.json().catch(() => null)
  return { response, data }
}

export function signupError(status = 503, data?: VerificationResult | null) {
  const message = typeof data?.message === 'string' && status < 500
    ? data.message : 'Signup is temporarily unavailable. Please try again shortly.'
  return NextResponse.json({ success: false, message, retryAfter: data?.retryAfter }, {
    status, headers: { 'Cache-Control': 'no-store', ...(data?.retryAfter ? { 'Retry-After': String(data.retryAfter) } : {}) },
  })
}

export function authenticatedResponse(data: VerificationResult) {
  if (!data.success || !data.accessToken || !data.refreshToken || !data.user) return signupError(502)
  const res = NextResponse.json({ success: true, user: data.user }, { headers: { 'Cache-Control': 'no-store' } })
  res.cookies.set(AUTH_COOKIE_NAME, data.accessToken, accessCookieOptions)
  res.cookies.set(REFRESH_COOKIE_NAME, data.refreshToken, refreshCookieOptions)
  res.cookies.set(SIGNUP_COOKIE, '', { ...challengeCookie, maxAge: 0 })
  return res
}

export function pendingResponse(data: VerificationResult, setCookie = false) {
  if (!data.requiresVerification || !data.challengeId || !/^[a-f0-9]{64}$/.test(data.challengeId)) return signupError(502)
  const res = NextResponse.json({
    success: true, requiresVerification: true, maskedDestination: data.maskedDestination,
    expiresAt: data.expiresAt, resendAfter: data.resendAfter, deliveryFailed: data.deliveryFailed,
    message: data.deliveryFailed ? 'We could not send your code. Please request a new code after the countdown.' : undefined,
  }, { headers: { 'Cache-Control': 'no-store' } })
  if (setCookie) res.cookies.set(SIGNUP_COOKIE, data.challengeId, challengeCookie)
  return res
}

export async function signupChallenge() {
  return cookies().get(SIGNUP_COOKIE)?.value
}

export async function verificationProxy(req: Request, action: 'verify-otp' | 'resend-otp' | 'otp-status') {
  if (!validOrigin(req)) return signupError(403, { message: 'Please return to the signup page and try again.' })
  const challengeId = await signupChallenge()
  if (!challengeId) return signupError(400, { message: 'Your verification session has ended. Please restart signup.' })
  try {
    let code: string | undefined
    if (action === 'verify-otp') {
      const body = await req.json().catch(() => null)
      if (typeof body?.code !== 'string' || !/^\d{6}$/.test(body.code)) return signupError(400, { message: 'Enter the 6-digit code.' })
      code = body.code
    }
    const { response, data } = await backendSignup(action, { challengeId, ...(code ? { code } : {}) })
    if (!response.ok) return signupError(response.status, data)
    if (!data) return signupError(502)
    if (action !== 'verify-otp') return pendingResponse(data)
    if (!data.success || !data.accessToken || !data.refreshToken) return signupError(502)
    const res = NextResponse.json({ success: true, user: data.user }, { headers: { 'Cache-Control': 'no-store' } })
    res.cookies.set(AUTH_COOKIE_NAME, data.accessToken, accessCookieOptions)
    res.cookies.set(REFRESH_COOKIE_NAME, data.refreshToken, refreshCookieOptions)
    res.cookies.set(SIGNUP_COOKIE, '', { ...challengeCookie, maxAge: 0 })
    return res
  } catch {
    return signupError()
  }
}
