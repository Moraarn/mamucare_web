import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const code = ts.transpileModule(readFileSync(new URL('../server/geminiRetry.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const mod = { exports: {} }
new Function('require', 'module', 'exports', code)(() => ({}), mod, mod.exports)
const { withGeminiRetry } = mod.exports

test('temporary overload retries with backoff and returns recovered response', async () => {
  let calls = 0
  const delays = []
  const result = await withGeminiRetry(async () => {
    if (++calls < 3) throw { status: 503 }
    return 'AI response'
  }, async delay => { delays.push(delay) })
  assert.equal(result, 'AI response')
  assert.equal(calls, 3)
  assert.ok(delays[0] >= 1000 && delays[0] < 1250)
  assert.ok(delays[1] >= 2000 && delays[1] < 2250)
})
test('persistent overload stops after three total attempts', async () => {
  let calls = 0
  await assert.rejects(withGeminiRetry(async () => {
    calls++
    throw Object.assign(new Error('overloaded'), { status: 503 })
  }, async () => {}), /overloaded/)
  assert.equal(calls, 3)
})
test('authentication, invalid requests and quota errors are not retried', async () => {
  for (const status of [400, 401, 403, 404, 429]) {
    let calls = 0
    await assert.rejects(withGeminiRetry(async () => {
      calls++
      throw Object.assign(new Error('provider error'), { status })
    }, async () => { assert.fail('should not wait') }))
    assert.equal(calls, 1)
  }
})
