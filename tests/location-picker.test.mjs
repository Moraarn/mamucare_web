import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const code = ts.transpileModule(readFileSync(new URL('../components/auth/LocationPickerModal.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
function harness() {
  let cursor = 0
  const state = [], refs = []
  const React = {
    useState(initial) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = value }] },
    useRef(initial) { const i = cursor++; return refs[i] ||= { current: initial } },
    useEffect() {},
  }
  const jsx = (type, props) => ({ type, props })
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)(id => id === 'react' ? React : id === 'react/jsx-runtime' ? { jsx, jsxs: jsx } : {}, mod, mod.exports)
  const render = () => { cursor = 0; return mod.exports.default({ isOpen: true, onClose() {}, onLocationSelect() {} }) }
  const find = (node, predicate) => {
    if (!node || typeof node !== 'object') return
    if (predicate(node)) return node
    for (const child of [node.props?.children].flat(Infinity)) { const match = find(child, predicate); if (match) return match }
  }
  return { render, find, refs }
}
test('Search resolves typed address, moves pin and preserves selection when input changes', () => {
  const h = harness(); let tree = h.render(), callback, calls = 0, center, pin
  const input = () => h.find(tree, n => n.type === 'input')
  const search = () => h.find(tree, n => n.props?.children === 'Search' || n.props?.children === 'Searching...')
  // Refs in component hook order: search version, busy, container, map, marker, geocoder.
  const refs = h.refs.filter(Boolean)
  refs[3].current = { setCenter(p) { center = p }, setZoom() {} }
  refs[4].current = { setPosition(p) { pin = p } }
  refs[5].current = { geocode(request, cb) { assert.equal(request.address, 'Nairobi'); calls++; callback = cb } }
  input().props.onChange({ target: { value: 'Nairobi' } }); tree = h.render()
  search().props.onClick(); search().props.onClick()
  assert.equal(calls, 1)
  const position = { lat: () => -1.28, lng: () => 36.82 }
  callback([{ formatted_address: 'Nairobi, Kenya', geometry: { location: position } }], 'OK')
  tree = h.render()
  assert.equal(input().props.value, 'Nairobi, Kenya')
  assert.equal(center, position); assert.equal(pin, position)
  input().props.onChange({ target: { value: 'Other place' } }); tree = h.render()
  assert.ok(h.find(tree, n => n.type === 'p' && n.props.children === 'Nairobi, Kenya'))
})
test('empty search is ignored and missing results show a friendly error', () => {
  const h = harness(); let tree = h.render(), callback, calls = 0
  h.refs.filter(Boolean)[5].current = { geocode(req, cb) { calls++; callback = cb } }
  const button = () => h.find(tree, n => n.props?.children === 'Search')
  button().props.onClick(); assert.equal(calls, 0)
  h.find(tree, n => n.type === 'input').props.onChange({ target: { value: 'Missing' } }); tree = h.render()
  let prevented = false
  h.find(tree, n => n.type === 'input').props.onKeyDown({ key: 'Enter', preventDefault() { prevented = true } })
  assert.equal(prevented, true)
  assert.equal(calls, 1)
  callback([], 'ZERO_RESULTS'); tree = h.render()
  assert.match(h.find(tree, n => n.props?.role === 'alert').props.children, /No location found/)
})
