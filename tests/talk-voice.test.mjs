import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)

// Run the actual component and voice hooks with deterministic browser APIs.
function setup() {
  const originalWindow = global.window
  const originalUtterance = global.SpeechSynthesisUtterance
  let cursor = 0, effects = [], slots = [], cleanups = [], view
  const react = {
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = initial
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value }]
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial } },
    useCallback(fn, deps) {
      const index = cursor++
      if (!slots[index] || deps.some((v, i) => v !== slots[index].deps[i])) slots[index] = { fn, deps }
      return slots[index].fn
    },
    useEffect(fn, deps) {
      const index = cursor++
      if (!slots[index] || deps.some((v, i) => v !== slots[index][i])) {
        slots[index] = deps
        effects.push(() => { cleanups[index]?.(); cleanups[index] = fn() })
      }
    },
  }
  let recognition, utterance, requests = [], resolveRequest
  class Recognition {
    constructor() { recognition = this; this.active = false; this.starts = 0 }
    start() { assert.equal(window.speechSynthesis.speaking, false); this.active = true; this.starts++; this.onstart?.() }
    stop() { this.active = false; queueMicrotask(() => { if (this.finalOnStop) this.result(this.finalOnStop, true); this.onend?.() }) }
    abort() { this.active = false; this.aborted = true }
    result(text, final = false) { this.onresult?.({ resultIndex: 0, results: [{ isFinal: final, 0: { transcript: text } }] }) }
    silence() { this.active = false; this.onend?.() }
  }
  global.window = { SpeechRecognition: Recognition, speechSynthesis: {
    speaking: false, pending: false, getVoices: () => [],
    cancel() { this.speaking = false },
    speak(value) { assert.equal(recognition.active, false); utterance = value; this.speaking = true; value.onstart?.() },
    pause() {}, resume() {},
  } }
  global.SpeechSynthesisUtterance = class { constructor(text) { this.text = text } }
  function load(path, mocks = {}) {
    const output = ts.transpileModule(readFileSync(new URL('../' + path, import.meta.url), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText
    const module = { exports: {} }
    new Function('require', 'module', 'exports', output)(name => name === 'react' ? react : name in mocks ? mocks[name] : require(name), module, module.exports)
    return module.exports
  }
  const speech = load('hooks/useSpeechRecognition.ts')
  const tts = load('hooks/useTextToSpeech.ts')
  const component = load('components/talk/TalkClient.tsx', {
    'next/navigation': { useRouter: () => ({ push() {} }) },
    '@/components/ui/AppShell': 'shell', './MessageList': 'messages',
    './ChatInput': 'input', '@/components/talk/CallUI': 'call',
    '@/hooks/useSpeechRecognition': speech, '@/hooks/useTextToSpeech': tts,
    '@/lib/auth': { fetchCurrentUser: async () => ({ id: 'mother' }) },
    '../../app/talk/actions': { handleCallConversation: request => {
      requests.push(request)
      return new Promise(resolve => { resolveRequest = resolve })
    } },
  }).default
  function render() {
    cursor = 0
    view = component({ initialMessages: [], user: { id: 'mother', status: 'pregnant' }, userContext: { lastSymptoms: [] } })
    const pending = effects; effects = []; pending.forEach(fn => fn())
    return view
  }
  function input(node = view) {
    if (!node || typeof node !== 'object') return
    if (node?.type === 'input') return node.props
    const children = node?.props?.children
    for (const child of Array.isArray(children) ? children : [children]) { const found = child == null ? undefined : input(child); if (found) return found }
  }
  render(); render()
  return {
    render, input, get recognition() { return recognition }, get requests() { return requests },
    respond(text) { resolveRequest({ message: text, state: 'follow_up', language: 'en' }) },
    finishAudio() { window.speechSynthesis.speaking = false; utterance.onend?.() },
    cleanup() {
      cleanups.forEach(fn => fn?.())
      if (originalWindow === undefined) delete global.window
      else global.window = originalWindow
      if (originalUtterance === undefined) delete global.SpeechSynthesisUtterance
      else global.SpeechSynthesisUtterance = originalUtterance
    },
  }
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve() }

test('explicit turns preserve speech across pauses, submit once, and wait for actual TTS completion', async () => {
  const app = setup()
  try {
    await app.input().onStartCall()
    let call = app.render().props
    assert.equal(call.voiceState, 'idle')
    assert.equal(app.recognition.starts, 0)
    call.onStartSpeaking()
    call = app.render().props
    assert.equal(call.voiceState, 'listening')
    app.recognition.result('I have had a headache since this morning.')
    app.recognition.silence() // Browser ends a session after a long pause; the user turn stays open.
    assert.equal(app.recognition.active, true)
    app.recognition.result('It is still hurting.')
    call = app.render().props
    assert.equal(app.requests.length, 0)
    assert.equal(call.userTranscript, 'I have had a headache since this morning. It is still hurting.')
    const done = call.onDoneSpeaking()
    call.onDoneSpeaking()
    assert.equal(app.recognition.active, false)
    assert.equal(app.render().props.voiceState, 'processing')
    await flush()
    assert.equal(app.requests.length, 1)
    assert.equal(app.requests[0].message, 'I have had a headache since this morning. It is still hurting.')
    app.respond('How severe is your headache?')
    await done
    call = app.render().props
    assert.equal(call.voiceState, 'speaking')
    assert.equal(call.aiResponse, 'How severe is your headache?')
    const starts = app.recognition.starts
    call.onStartSpeaking()
    assert.equal(app.recognition.starts, starts)
    app.finishAudio()
    call = app.render().props
    assert.equal(call.voiceState, 'idle')
    assert.equal(call.userTranscript, '')
    assert.equal(app.recognition.active, false)
    call.onStartSpeaking()
    assert.equal(app.render().props.userTranscript, '')
    app.recognition.result('It is moderate.')
    const second = app.render().props.onDoneSpeaking()
    await flush()
    assert.equal(app.requests.length, 2)
    app.respond('Thank you for explaining.')
    await second
    app.finishAudio()
    app.render().props.onEndCall()
    app.render()
    assert.equal(app.input().onStartCall instanceof Function, true)
    // MessageList receives both complete turns after returning to chat.
    const children = app.render().props.children.props.children
    const messages = children.find(node => node?.type === 'messages').props.messages
    assert.deepEqual(messages.map(message => message.text), [
      'I have had a headache since this morning. It is still hurting.', 'How severe is your headache?',
      'It is moderate.', 'Thank you for explaining.',
    ])
  } finally { app.cleanup() }
})

test('mute preserves captured text; ending a pending call prevents late speech', async () => {
  const app = setup()
  try {
    await app.input().onStartCall()
    app.render().props.onStartSpeaking()
    app.recognition.result('My head hurts')
    app.render().props.onToggleMute()
    await flush()
    assert.equal(app.recognition.active, false)
    const call = app.render().props
    assert.equal(call.userTranscript, 'My head hurts')
    const done = call.onDoneSpeaking()
    await flush()
    app.render().props.onEndCall()
    app.respond('Please tell me more.')
    await done
    assert.equal(window.speechSynthesis.speaking, false)
    assert.equal(app.recognition.active, false)
  } finally { app.cleanup(); assert.equal(app.recognition.aborted, true) }
})

test('permission failures show an error and return to idle', async () => {
  const app = setup()
  try {
    await app.input().onStartCall()
    app.render().props.onStartSpeaking()
    app.recognition.onerror({ error: 'not-allowed' })
    app.render()
    assert.equal(app.render().props.voiceState, 'idle')
    assert.match(app.render().props.speechError, /permission was denied/)
    assert.equal(app.requests.length, 0)
  } finally { app.cleanup() }
})


test('Done speaking waits for the final recognition result; leaving during listening releases the microphone', async () => {
  const app = setup()
  try {
    await app.input().onStartCall()
    app.render().props.onStartSpeaking()
    app.recognition.result('I have a head')
    app.recognition.finalOnStop = 'I have a headache since this morning.'
    const done = app.render().props.onDoneSpeaking()
    await flush()
    assert.equal(app.requests[0].message, 'I have a headache since this morning.')
    app.respond('How are you feeling now?')
    await done
    app.finishAudio()
    app.render().props.onStartSpeaking()
    assert.equal(app.recognition.active, true)
  } finally {
    app.cleanup()
    assert.equal(app.recognition.active, false)
    assert.equal(app.recognition.aborted, true)
    assert.equal(app.recognition.onresult, null)
  }
})


test('empty speech ends listening safely without sending an AI request', async () => {
  const app = setup()
  try {
    await app.input().onStartCall()
    app.render().props.onStartSpeaking()
    await app.render().props.onDoneSpeaking()
    assert.equal(app.requests.length, 0)
    assert.equal(app.recognition.active, false)
    assert.equal(app.render().props.voiceState, 'idle')
  } finally { app.cleanup() }
})
