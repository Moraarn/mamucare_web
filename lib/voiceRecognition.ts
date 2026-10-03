import { parseVoiceAnswer, type VoiceAnswerResult } from './parseVoiceAnswer'

export type VoiceLanguage = 'en' | 'sw'
export type VoiceError = 'permission' | 'no-speech' | 'unsupported' | 'audio' | 'network' | 'language' | 'recognition'
export type VoiceState =
  | { status: 'idle' | 'starting' | 'listening' }
  | { status: 'recognized' | 'unknown'; result: VoiceAnswerResult }
  | { status: 'error'; error: VoiceError }

export interface BrowserSpeechRecognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((event: { results: ArrayLike<{ isFinal: boolean; [index: number]: { transcript: string } }> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onnomatch: (() => void) | null
  start(): void
  abort(): void
}

export type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition

// Local typing avoids changing the speech APIs used by the Talk feature.
export function getSpeechRecognition(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined
  const browser = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition
}

export function recognitionError(code: string): VoiceError {
  switch (code) {
    case 'not-allowed': case 'service-not-allowed': case 'NotAllowedError': case 'SecurityError': return 'permission'
    case 'no-speech': return 'no-speech'
    case 'audio-capture': case 'NotFoundError': return 'audio'
    case 'network': return 'network'
    case 'language-not-supported': return 'language'
    default: return 'recognition'
  }
}

/** One recognition session. Cancellation detaches handlers before aborting. */
export function startVoiceRecognition(
  Recognition: SpeechRecognitionConstructor | undefined,
  language: VoiceLanguage,
  onState: (state: VoiceState) => void,
  onAnswer: (answer: boolean) => void,
): () => void {
  if (!Recognition) {
    onState({ status: 'error', error: 'unsupported' })
    return () => {}
  }
  let recognition: BrowserSpeechRecognition | undefined
  let active = true
  let completed = false
  const cancel = () => {
    active = false
    if (!recognition) return
    recognition.onstart = recognition.onend = recognition.onresult = recognition.onerror = recognition.onnomatch = null
    try { recognition.abort() } catch { /* Already ended. */ }
  }
  const fail = (error: VoiceError) => {
    if (!active || completed) return
    completed = true
    onState({ status: 'error', error })
    cancel()
  }
  try {
    recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = language === 'sw' ? 'sw-KE' : 'en-KE'
    recognition.onstart = () => {
      if (active && !completed) onState({ status: 'listening' })
    }
    recognition.onerror = event => fail(recognitionError(event.error))
    recognition.onnomatch = () => {
      if (!active || completed) return
      completed = true
      onState({ status: 'unknown', result: parseVoiceAnswer('') })
      cancel()
    }
    recognition.onend = () => fail('no-speech')
    recognition.onresult = event => {
      if (!active || completed) return
      const final = Array.from(event.results).filter(result => result.isFinal)
      if (!final.length) return
      const result = parseVoiceAnswer(final.map(item => item[0]?.transcript ?? '').join(' ').trim())
      completed = true
      onState({ status: result.intent === 'unknown' ? 'unknown' : 'recognized', result })
      cancel()
      if (result.intent !== 'unknown') onAnswer(result.intent === 'yes')
    }
    onState({ status: 'starting' })
    // Starting from a user gesture lets the browser request microphone permission.
    recognition.start()
  } catch (error: unknown) {
    fail(recognitionError(error instanceof Error ? error.name : 'recognition'))
  }
  return cancel
}
