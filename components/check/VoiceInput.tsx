import { Mic } from 'lucide-react'

interface VoiceInputProps {
  isRecording: boolean
  transcript: string
  onVoiceInput: () => void
  language?: 'en' | 'sw'
}

const translations = {
  en: {
    listening: 'Listening… speak your answer now',
    recorded: 'Voice answer recorded — tap to change',
    tapToAnswer: 'Tap to answer by voice — speak in any language'
  },
  sw: {
    listening: 'Inasikiliza… sema jibu lako sasa',
    recorded: 'Jibu la sauti limekamilika — bofya kubadilisha',
    tapToAnswer: 'Bofya kujibu kwa sauti — sema katika lugha yoyote'
  }
}

export default function VoiceInput({ 
  isRecording, 
  transcript, 
  onVoiceInput,
  language = 'en'
}: VoiceInputProps) {
  const t = translations[language]

  return (
    <button
      onClick={onVoiceInput}
      className="w-full p-3 rounded-xl border transition-colors flex items-center gap-3"
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-background)'
      }}
    >
      <div 
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isRecording ? 'animate-pulse-ring' : ''
        }`}
        style={{
          backgroundColor: isRecording 
            ? 'var(--color-danger)' 
            : 'var(--color-primary)'
        }}
      >
        <Mic size={16} className="text-white" />
      </div>
      <span 
        className="text-sm text-left"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {isRecording 
          ? t.listening
          : transcript 
            ? t.recorded
            : t.tapToAnswer
        }
      </span>
    </button>
  )
}