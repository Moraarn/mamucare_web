import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const id = 'a'.repeat(64)

function fixture() {
  const calls = []
  const cookies = new Map([['signup_challenge', id]])
  let networkFailure = false
  let reply = { status: 200, body: { success: true, requiresVerification: true, challengeId: id, maskedDestination: '+254 ????? 678', resendAfter: 45 } }
  const next = { NextResponse: { json(body, options = {}) {
    const setCookies = []
    return { body, status: options.status || 200, headers: options.headers, setCookies,
      cookies: { set: (...args) => setCookies.push(args) } }
  } } }
  const auth = {
    AUTH_COOKIE_NAME: 'access_token', REFRESH_COOKIE_NAME: 'refresh_token',
    accessCookieOptions: { httpOnly: true }, refreshCookieOptions: { httpOnly: true },
    getBackendApiUrl: () => 'https://backend.example.test',
  }
  function load(path, extra = {}) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
    const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const module = { exports: {} }
    const context = { module, exports: module.exports, process: { env: { NODE_ENV: 'production' } }, AbortSignal, URL,
      require: name => name === 'next/server' ? next : name === 'next/headers' ? { cookies: () => ({ get: key => cookies.has(key) ? { value: cookies.get(key) } : undefined }) } : name === './auth' ? auth : extra[name],
      fetch: async (url, options) => { if (networkFailure) throw new Error('private network failure details'); calls.push({ url, options }); return new Response(JSON.stringify(reply.body), { status: reply.status }) },
    }
    vm.runInNewContext(compiled, context)
    return module.exports
  }
  const helper = load('lib/signup-verification.ts')
  const register = load('app/api/auth/register/route.ts', { '@/lib/signup-verification': helper })
  return { calls, cookies, helper, register, failNetwork: () => { networkFailure = true }, setReply: (body, status = 200) => { reply = { body, status } } }
}
function req(action, body = {}) {
  return new Request(`https://app.example.test/api/auth/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://app.example.test' }, body: JSON.stringify(body) })
}

test('signup sets only an HttpOnly pending challenge cookie and hides backend secrets', async () => {
  const f = fixture(); const res = await f.register.POST(req('register', { phone: '+254712345678' }))
  assert.equal(res.status, 200); assert.equal(res.body.requiresVerification, true)
  assert.equal(res.body.challengeId, undefined); assert.equal(res.body.accessToken, undefined)
  assert.equal(res.setCookies.length, 1); assert.equal(res.setCookies[0][0], 'signup_challenge')
  assert.equal(res.setCookies[0][2].httpOnly, true); assert.equal(res.setCookies[0][2].secure, true)
})
test('registration fails closed if an old backend returns immediate auth tokens', async () => {
  const f = fixture(); f.setReply({ success: true, accessToken: 'secret', refreshToken: 'secret' })
  const res = await f.register.POST(req('register'))
  assert.equal(res.status, 502); assert.equal(res.setCookies.length, 0)
})
test('only successful server verification issues auth cookies and clears pending cookie', async () => {
  const f = fixture(); f.setReply({ success: true, accessToken: 'access', refreshToken: 'refresh', user: { isVerified: true } })
  const res = await f.helper.verificationProxy(req('verify-otp', { code: '123456', challengeId: 'untrusted' }), 'verify-otp')
  assert.equal(res.status, 200)
  assert.deepEqual(JSON.parse(f.calls[0].options.body), { challengeId: id, code: '123456' })
  assert.equal(res.setCookies[0][0], 'access_token'); assert.equal(res.setCookies[1][0], 'refresh_token')
  assert.equal(res.setCookies[2][0], 'signup_challenge'); assert.equal(res.setCookies[2][2].maxAge, 0)
  assert.equal(res.body.accessToken, undefined); assert.equal(res.body.refreshToken, undefined)
})
test('invalid/expired verification never sets auth cookies', async () => {
  const f = fixture(); f.setReply({ message: 'Your code has expired.' }, 400)
  const res = await f.helper.verificationProxy(req('verify-otp', { code: '123456' }), 'verify-otp')
  assert.equal(res.status, 400); assert.equal(res.setCookies.length, 0)
  assert.equal(res.body.message, 'Your code has expired.')
})
test('missing challenge and malformed code do not contact the backend', async () => {
  const f = fixture(); f.cookies.clear()
  assert.equal((await f.helper.verificationProxy(req('verify-otp', { code: '123456' }), 'verify-otp')).status, 400)
  f.cookies.set('signup_challenge', id)
  assert.equal((await f.helper.verificationProxy(req('verify-otp', { code: '123' }), 'verify-otp')).status, 400)
  assert.equal(f.calls.length, 0)
})
test('status and resend expose only masked details, with cooldown feedback', async () => {
  const f = fixture(); const res = await f.helper.verificationProxy(req('otp-status'), 'otp-status')
  assert.equal(res.body.resendAfter, 45); assert.equal(res.body.challengeId, undefined)
  f.setReply({ message: 'Please wait before requesting another code.', retryAfter: 42 }, 429)
  const limited = await f.helper.verificationProxy(req('resend-otp'), 'resend-otp')
  assert.equal(limited.status, 429); assert.equal(limited.body.retryAfter, 42); assert.equal(limited.headers['Retry-After'], '42')
  assert.equal(limited.setCookies.length, 0)
})
test('failed delivery keeps verification pending with friendly feedback', async () => {
  const f = fixture(); f.setReply({ requiresVerification: true, challengeId: id, deliveryFailed: true, resendAfter: 45 })
  const res = await f.register.POST(req('register'))
  assert.equal(res.body.deliveryFailed, true); assert.match(res.body.message, /could not send/)
  assert.equal(res.setCookies[0][0], 'signup_challenge')
})
test('rejects cross-origin verification requests', async () => {
  const f = fixture(); const request = new Request('https://app.example.test/api/auth/verify-otp', {
    method: 'POST', headers: { Origin: 'https://other.example.test' }, body: JSON.stringify({ code: '123456' }),
  })
  assert.equal((await f.helper.verificationProxy(request, 'verify-otp')).status, 403)
  assert.equal(f.calls.length, 0)
})

test('network failures show a generic error and never authenticate', async () => {
  const f = fixture(); f.failNetwork()
  const res = await f.helper.verificationProxy(req('verify-otp', { code: '123456' }), 'verify-otp')
  assert.equal(res.status, 503); assert.equal(res.setCookies.length, 0)
  assert.match(res.body.message, /temporarily unavailable/)
  assert.doesNotMatch(res.body.message, /private network/)
})
