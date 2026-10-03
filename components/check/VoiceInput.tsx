import { Mic, Square } from 'lucide-react'
import type { VoiceError, VoiceState } from '@/lib/voiceRecognition'

interface VoiceInputProps {
  state: VoiceState
  supported: boolean
  onVoiceInput: () => void
  onCancel: () => void
  language: 'en' | 'sw'
}

const messages = {
  en: {
    idle: 'Tap to answer by voice',
    starting: 'Starting microphone... allow microphone access if prompted',
    listening: 'Listening... speak your answer',
    hint: 'Speak English or Swahili using the selected question language. Review your answer, then press Next question.',
    unknown: "I couldn't determine your answer. Please try again or select Yes/No.",
    heard: 'Heard', yes: 'Yes selected', no: 'No selected', stop: 'Cancel voice input',
    errors: {
      permission: 'Microphone permission was denied. Allow microphone access in your browser settings or select an answer manually.',
      'no-speech': 'No speech was detected. Please try again or select an answer manually.',
      unsupported: 'Voice input is not supported in this browser. Please select an answer manually.',
      audio: 'Your microphone is unavailable. Check that it is connected or select an answer manually.',
      network: 'Speech recognition could not connect. Please try again or select an answer manually.',
      language: 'Speech recognition does not support the selected language in this browser. Please select an answer manually.',
      recognition: 'Speech recognition failed. Please try again or select an answer manually.',
    } satisfies Record<VoiceError, string>,
  },
  sw: {
    idle: 'Bofya kujibu kwa sauti',
    starting: 'Maikrofoni inaanza... ruhusu matumizi ya maikrofoni ukiombwa',
    listening: 'Inasikiliza... sema jibu lako',
    hint: 'Tumia Kiingereza au Kiswahili kulingana na lugha ya swali. Hakiki jibu lako, kisha bofya Next question.',
    unknown: 'Jibu halijaeleweka. Jaribu tena au chagua Ndiyo/Hapana.',
    heard: 'Imesikia', yes: 'Ndiyo imechaguliwa', no: 'Hapana imechaguliwa', stop: 'Ghairi jibu la sauti',
    errors: {
      permission: 'Ruhusa ya maikrofoni imekataliwa. Ruhusu maikrofoni kwenye kivinjari au chagua jibu mwenyewe.',
      'no-speech': 'Hakuna sauti iliyosikika. Jaribu tena au chagua jibu mwenyewe.',
      unsupported: 'Kivinjari hiki hakitumii majibu ya sauti. Tafadhali chagua jibu mwenyewe.',
      audio: 'Maikrofoni haipatikani. Hakikisha imeunganishwa au chagua jibu mwenyewe.',
      network: 'Utambuzi wa sauti haukuweza kuunganishwa. Jaribu tena au chagua jibu mwenyewe.',
      language: 'Kivinjari hiki hakitambui sauti katika lugha iliyochaguliwa. Chagua jibu mwenyewe.',
      recognition: 'Utambuzi wa sauti umeshindwa. Jaribu tena au chagua jibu mwenyewe.',
    } satisfies Record<VoiceError, string>,
  },
}

export default function VoiceInput({ state, supported, onVoiceInput, onCancel, language }: VoiceInputProps) {
  const t = messages[language]
  const busy = state.status === 'starting' || state.status === 'listening'
  let feedback: string = t.hint
  if (!supported) feedback = t.errors.unsupported
  else if (state.status === 'error') feedback = t.errors[state.error]
  else if (state.status === 'unknown') feedback = `${state.result.transcript ? `${t.heard}: "${state.result.transcript}". ` : ''}${t.unknown}`
  else if (state.status === 'recognized') feedback = `${t.heard}: "${state.result.transcript}" - ${state.result.intent === 'yes' ? t.yes : t.no}. ${t.hint}`

  return (
    <div className="space-y-2">
      <button type="button" onClick={busy ? onCancel : onVoiceInput} disabled={!supported}
        aria-label={busy ? t.stop : t.idle} aria-pressed={busy} aria-describedby="voice-answer-feedback"
        className="w-full p-3 rounded-xl border flex items-center gap-3 text-left disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: busy ? 'var(--color-surface-soft)' : 'var(--color-background)', borderColor: busy ? 'var(--color-primary)' : 'var(--color-border)' }}>
        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${busy ? 'animate-pulse' : ''}`} style={{ backgroundColor: 'var(--color-primary)' }}>
          {busy ? <Square size={16} className="text-[var(--color-on-primary)]" aria-hidden="true" /> : <Mic size={18} className="text-[var(--color-on-primary)]" aria-hidden="true" />}
        </span>
        <span className="text-sm font-medium">{state.status === 'starting' ? t.starting : state.status === 'listening' ? t.listening : t.idle}</span>
      </button>
      <p id="voice-answer-feedback" role="status" aria-live="polite" aria-atomic="true" className="text-sm leading-relaxed px-1" style={{ color: state.status === 'error' ? 'var(--color-danger)' : state.status === 'recognized' ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
        {feedback}
      </p>
    </div>
  )
}
