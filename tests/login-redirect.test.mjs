import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)

function fixture(ok) {
  const replaced = [], errors = [], success = []
  let cursor = 0
  const React = require('react')
  const mocks = {
    react: { ...React, useState: () => {
      const index = cursor++
      return [['+254712345678', 'test-password', null, false][index], value => { if (index === 2) errors.push(value) }]
    } },
    'next/navigation': { useRouter: () => ({ replace: path => replaced.push(path), refresh() {} }) },
    '@/lib/phone': { normalizePhone: phone => phone },
  }
  const output = ts.transpileModule(readFileSync(new URL('../components/auth/LoginForm.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const module = { exports: {} }
  new Function('require', 'module', 'exports', 'fetch', output)(name => {
    if (name in mocks) return mocks[name]
    if (name.startsWith('.') || name.startsWith('@/components')) return { __esModule: true, default: 'input' }
    return require(name)
  }, module, module.exports, async () => ({ ok, json: async () => ({ message: 'Login failed' }) }))
  const form = module.exports.default({ onSwitchToSignup() {}, onSuccess: () => success.push(true) })
  return { submit: () => form.props.onSubmit({ preventDefault() {} }), replaced, errors, success }
}
test('successful login redirects to the Home checkup page', async () => {
  const f = fixture(true)
  await f.submit()
  assert.deepEqual(f.replaced, ['/home'])
  assert.deepEqual(f.success, [true])
  assert.match(readFileSync(new URL('../app/home/page.tsx', import.meta.url), 'utf8'), /<CheckPageClient/)
})
test('failed login stays on the login form', async () => {
  const f = fixture(false)
  await f.submit()
  assert.deepEqual(f.replaced, [])
  assert.deepEqual(f.success, [])
  assert.equal(f.errors.at(-1), 'Login failed')
})
test('development and production output directories cannot collide', () => {
  const config = require('../next.config.js')
  const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } = require('next/constants')
  assert.notEqual(config(PHASE_DEVELOPMENT_SERVER).distDir, config(PHASE_PRODUCTION_BUILD).distDir)
  assert.equal(config(PHASE_PRODUCTION_BUILD).distDir, config(PHASE_PRODUCTION_SERVER).distDir)
})
