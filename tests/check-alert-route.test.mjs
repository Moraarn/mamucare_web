import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function fixture(reply, authenticated = true) {
  const code = ts.transpileModule(readFileSync(new URL('../app/api/check/session/[sessionId]/complete/route.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  let requests = 0
  vm.runInNewContext(code, { module, exports: module.exports,
    require: name => name === 'next/headers' ? { cookies: () => ({ get: () => authenticated ? { value: 'session-token' } : undefined }) }
      : name === 'next/server' ? { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } }
      : { AUTH_COOKIE_NAME: 'access_token', getBackendApiUrl: () => 'https://backend.test' },
    fetch: async () => { requests++; if (reply instanceof Error) throw reply; return new Response(JSON.stringify(reply.body), { status: reply.status }) },
  })
  return { send: () => module.exports.POST({ json: async () => ({ userId: 'mother', userStatus: 'postpartum' }) }, { params: { sessionId: 'session' } }), get requests() { return requests } }
}
test('completion proxy strips raw provider diagnostics from failure responses', async () => {
  const f = fixture({ status: 500, body: { message: 'secret-auth-token', providerError: { authToken: 'secret-auth-token' } } })
  const response = await f.send()
  assert.equal(response.status, 500)
  assert.equal(response.body.message, 'Failed to complete session')
  assert.equal(JSON.stringify(response).includes('secret-auth-token'), false)
})
test('completion proxy returns only the saved result on success', async () => {
  const result = { smsAlertStatus: { chw: { status: 'sent', messageSid: 'SMtest' }, emergency: { status: 'failed' } } }
  const response = await fixture({ status: 200, body: { data: result, diagnostics: 'secret-auth-token' } }).send()
  assert.deepEqual(JSON.parse(JSON.stringify(response.body)), { success: true, result })
})
test('unauthenticated completion never calls backend', async () => {
  const f = fixture({ status: 200, body: {} }, false)
  assert.equal((await f.send()).status, 401)
  assert.equal(f.requests, 0)
})
test('network exceptions never expose their contents', async () => {
  const response = await fixture(new Error('secret-auth-token')).send()
  assert.equal(JSON.stringify(response).includes('secret-auth-token'), false)
})
