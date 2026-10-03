import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server')
function load(file, mocks = {}) {
  const code = ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const module = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : require(name), module, module.exports)
  return module.exports
}
const disclaimer = load('components/ui/MedicalDisclaimer.tsx')
const Shell = load('components/ui/AppShell.tsx', {
  './TopNav': { __esModule: true, default: () => React.createElement('nav', null, 'MamuCare') },
  './MedicalDisclaimer': disclaimer,
}).default
const fullText = 'MamuCare does not diagnose medical conditions and does not replace a qualified health worker. If you have urgent symptoms, seek professional medical care immediately.'
test('shared shell includes one global disclaimer after page content', () => {
  const html = renderToStaticMarkup(React.createElement(Shell, null, React.createElement('button', null, 'Next question')))
  assert.equal(html.split(fullText).length - 1, 1)
  assert.ok(html.indexOf('Next question') < html.indexOf(fullText))
  assert.match(html, /<footer/)
})
test('Talk chat and call shells show the short notice and one full disclaimer', () => {
  for (const viewport of [false, true]) {
    const html = renderToStaticMarkup(React.createElement(Shell, { aiGuidance: true, viewport }, 'Talk content'))
    assert.equal(html.split(fullText).length - 1, 1)
    assert.match(html, /AI guidance only.*not a diagnosis or substitute for a health worker/)
    assert.ok(html.indexOf('AI guidance only') < html.indexOf('Talk content'))
  }
})
