import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const module = { exports: {} }
const code = ts.transpileModule(readFileSync(new URL('../lib/alertStatus.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
new Function('module', 'exports', code)(module, module.exports)
const { summarizeAlerts } = module.exports
for (const [chw, emergency, title] of [
  ['sent', 'sent', 'Alerts sent to your care team'],
  ['sent', 'failed', 'Some alerts could not be sent'],
  ['failed', 'sent', 'Some alerts could not be sent'],
  ['failed', 'failed', 'Alerts could not be sent'],
  ['not_configured', 'not_configured', 'Alerts could not be sent'],
  ['sending', 'sent', 'Sending alerts...'],
  ['not_configured', 'sent', 'Some alerts could not be sent'],
]) test(`${chw}/${emergency} displays truthful alert summary`, () => {
  assert.equal(summarizeAlerts({ chw: { status: chw }, emergency: { status: emergency } }).title, title)
})
test('missing configuration is distinct from failure, and unknown delivery never claims success', () => {
  assert.equal(summarizeAlerts().chwLabel, 'Not configured')
  assert.equal(summarizeAlerts(undefined, '0712345678').chwLabel, 'Failed')
  assert.equal(summarizeAlerts(undefined, '0712345678').title, 'Alerts could not be sent')
})
