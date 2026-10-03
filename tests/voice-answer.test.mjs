import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Compile the actual TypeScript modules without adding a test framework dependency.
function load(relativePath, mocks = {}) {
  const filename = resolve(root, relativePath)
  const output = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const module = { exports: {} }
  const localRequire = name => {
    if (name in mocks) return mocks[name]
    if (name.startsWith('.')) return load(resolve(dirname(filename), `${name}.ts`), mocks)
    return require(name)
  }
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports)
  return module.exports
}

const { parseVoiceAnswer } = load('lib/parseVoiceAnswer.ts')
const { startVoiceRecognition, getSpeechRecognition } = load('lib/voiceRecognition.ts')

for (const [intent, inputs] of Object.entries({
  yes: ['yes', 'yeah', 'yep', 'I am', "I'm", 'Yes, I am bleeding a lot', 'Ndiyo', 'Ndio', 'naam', 'Ndiyo, ninavuja damu'],
  no: ['no', 'nope', 'I am not', 'No, I am not', 'Hapana', 'la', 'Hapana, sivuji damu'],
  unknown: ['', 'I am bleeding', 'maybe', 'sijui', 'labda ndiyo', 'yes and no', 'Yes, I am not', 'not yes', 'I am not sure', 'No, maybe', 'Ndiyo au hapana', 'yesterday', 'nobody', 'No, actually yes', 'No, but I am bleeding', 'Ndiyo, sivuji damu', 'Ndiyo, sijavuja damu'],
})) {
  for (const transcript of inputs) test(`parses ${JSON.stringify(transcript)} as ${intent}`, () => {
    assert.deepEqual(parseVoiceAnswer(transcript), { transcript, intent })
  })
}

class FakeRecognition {
  static latest
  constructor() { FakeRecognition.latest = this }
  start() { this.onstart?.() }
  abort() { this.aborted = true }
  result(transcript) { this.onresult?.({ results: [{ isFinal: true, 0: { transcript } }] }) }
}

function session(language = 'en', Recognition = FakeRecognition) {
  const states = [], answers = []
  const cancel = startVoiceRecognition(Recognition, language, state => states.push(state), answer => answers.push(answer))
  return { states, answers, cancel, recognition: FakeRecognition.latest }
}

test('English and Swahili sessions select only the existing boolean answer, once', () => {
  for (const [language, transcript, expected] of [['en', 'Yes, I am bleeding a lot', true], ['en', 'No, I am not', false], ['sw', 'Ndiyo', true], ['sw', 'Ndio', true], ['sw', 'Hapana', false]]) {
    const s = session(language)
    assert.equal(s.recognition.lang, language === 'sw' ? 'sw-KE' : 'en-KE')
    assert.equal(s.recognition.continuous, false)
    assert.equal(s.recognition.interimResults, false)
    assert.equal(s.states.at(-1).status, 'listening')
    s.recognition.result(transcript)
    s.recognition.result(transcript)
    assert.deepEqual(s.answers, [expected])
    assert.equal(s.states.at(-1).status, 'recognized')
    assert.equal(s.recognition.aborted, true)
  }
})

test('unknown and interim speech never select an answer', () => {
  const s = session()
  s.recognition.onresult({ results: [{ isFinal: false, 0: { transcript: 'yes' } }] })
  assert.deepEqual(s.answers, [])
  s.recognition.result('I feel dizzy')
  assert.equal(s.states.at(-1).status, 'unknown')
  assert.deepEqual(s.answers, [])
})

test('errors and empty sessions give feedback without selecting an answer', () => {
  for (const [code, expected] of [['not-allowed', 'permission'], ['service-not-allowed', 'permission'], ['no-speech', 'no-speech'], ['audio-capture', 'audio'], ['network', 'network'], ['language-not-supported', 'language'], ['aborted', 'recognition']]) {
    const s = session()
    s.recognition.onerror({ error: code })
    assert.deepEqual(s.states.at(-1), { status: 'error', error: expected })
    assert.deepEqual(s.answers, [])
  }
  const empty = session()
  empty.recognition.onend()
  assert.equal(empty.states.at(-1).error, 'no-speech')
})

test('unsupported browser and synchronous permission exceptions are safe', () => {
  assert.equal(getSpeechRecognition(), undefined)
  const states = []
  startVoiceRecognition(undefined, 'en', state => states.push(state), () => assert.fail('unexpected answer'))()
  assert.deepEqual(states, [{ status: 'error', error: 'unsupported' }])
  class Denied extends FakeRecognition {
    start() { throw new DOMException('Denied', 'NotAllowedError') }
  }
  const denied = session('en', Denied)
  assert.equal(denied.states.at(-1).error, 'permission')
})

test('cancellation blocks queued results after manual choice, language change, navigation or unmount', () => {
  const s = session()
  const queuedResult = s.recognition.onresult
  const previousStates = s.states.length
  s.cancel()
  queuedResult({ results: [{ isFinal: true, 0: { transcript: 'yes' } }] })
  assert.equal(s.states.length, previousStates)
  assert.deepEqual(s.answers, [])
  assert.equal(s.recognition.onresult, null)
  assert.equal(s.recognition.aborted, true)
})

test('questionnaire voice selection can be manually overridden and only Next advances', async () => {
  const React = require('react')
  const values = [
    { id: 'test-user', status: 'postpartum' },
    [{ id: 'q1', text: 'Question one' }, { id: 'q2', text: 'Question two' }],
    null, false, 'en', 0, [], null, false, null,
  ]
  let cursor = 0, voiceAnswer, resets = 0
  const mocks = {
    react: { ...React, useEffect: () => {}, useState: () => {
      const index = cursor++
      return [values[index], value => { values[index] = typeof value === 'function' ? value(values[index]) : value }]
    } },
    'next/navigation': { useRouter: () => ({ replace() {} }) },
    '@/contexts/ThemeContext': { useTheme: () => ({ toggleTheme() {} }) },
    '@/lib/auth': { fetchCurrentUser() {} },
    '@/hooks/useVoiceAnswer': { useVoiceAnswer: (_language, _index, onAnswer) => {
      voiceAnswer = onAnswer
      return { state: { status: 'idle' }, supported: true, start() {}, reset() { resets++ } }
    } },
  }
  for (const name of ['@/components/ui/AppShell', './QuestionProgress', './QuestionCard', './AnswerButtons', './VoiceInput', './ResultScreen', '@/components/ui/Button']) {
    mocks[name] = { __esModule: true, default: name.split('/').at(-1) }
  }
  const { default: CheckPageClient } = load('components/check/CheckPageClient.tsx', mocks)
  const render = () => { cursor = 0; return CheckPageClient() }
  function find(tree, type) {
    if (!tree || typeof tree !== 'object') return undefined
    if (tree.type === type) return tree
    for (const child of React.Children.toArray(tree.props?.children)) {
      const found = find(child, type)
      if (found) return found
    }
  }
  let tree = render()
  assert.equal(find(tree, 'Button').props.disabled, true)
  await find(tree, 'Button').props.onClick()
  assert.equal(values[5], 0)
  startVoiceRecognition(FakeRecognition, 'en', () => {}, voiceAnswer)
  FakeRecognition.latest.result('yes')
  tree = render()
  assert.equal(find(tree, 'AnswerButtons').props.selectedAnswer, true)
  assert.equal(find(tree, 'Button').props.disabled, false)
  assert.equal(values[5], 0)
  assert.deepEqual(values[6], [])
  find(tree, 'AnswerButtons').props.onAnswerSelect(false)
  tree = render()
  assert.equal(find(tree, 'AnswerButtons').props.selectedAnswer, false)
  assert.equal(resets, 1)
  assert.equal(values[5], 0)
  await find(tree, 'Button').props.onClick()
  assert.equal(values[5], 1)
  assert.deepEqual(values[6], [false])
  assert.equal(values[7], null)
})
