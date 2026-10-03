'use client'

import { useState, useEffect } from 'react'
import { Phone, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import AppShell from '@/components/ui/AppShell'

interface CallUIProps {
  onEndCall: () => void
  isMuted: boolean
  onToggleMute: () => void
  isSpeakerOn: boolean
  onToggleSpeaker: () => void
  voiceState: 'idle' | 'listening' | 'processing' | 'speaking'
  onStartSpeaking: () => void
  onDoneSpeaking: () => void
  speechSupported: boolean
  callDuration: string
  isUserListening: boolean
  userTranscript: string
  aiResponse: string
  speechError: string | null

}

export default function CallUI({
  onEndCall,
  isMuted,
  onToggleMute,
  isSpeakerOn,
  onToggleSpeaker,
  voiceState,
  onStartSpeaking,
  onDoneSpeaking,
  speechSupported,
  callDuration,
  isUserListening,
  userTranscript,
  aiResponse,
  speechError,

}: CallUIProps) {
  const isAIResponding = voiceState === 'speaking'
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(20).fill(0))

  useEffect(() => {
    if (isAIResponding || isUserListening) {
      const interval = setInterval(() => {
        setWaveformBars((prev: number[]) => 
          prev.map(() => Math.random() * 100)
        )
      }, 100)
      return () => clearInterval(interval)
    } else {
      setWaveformBars(Array(20).fill(0))
    }
  }, [isAIResponding, isUserListening])

  return (
    <AppShell
      contentWidth="reading"
    >
      <div className="flex flex-col h-full px-4 py-6 space-y-6">
        {/* AI Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Avatar Circle */}
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <span className="text-white text-2xl font-bold">AI</span>
            </div>

            {/* Pulsing Ring when AI is speaking */}
            {isAIResponding && (
              <div 
                className="absolute inset-0 rounded-full border-2 animate-ping"
                style={{ borderColor: 'var(--color-primary)' }}
              />
            )}
          </div>

          {/* Status Text */}
          <div className="text-center" role="status" aria-live="polite">
            <h3 
              className="font-semibold text-lg"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {voiceState === 'processing' ? 'Thinking...' :
               voiceState === 'speaking' ? 'AI is responding' :
               voiceState === 'listening' ? 'Listening... Speak now' : 'Tap to speak'}
            </h3>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {voiceState === 'processing' ? 'Please wait for your response' :
               voiceState === 'speaking' ? 'AI is responding' : 
               isUserListening ? 'AI is listening to you' : 
               isMuted ? 'Tap unmute to speak' : 
               'Your turn to speak'}
            </p>
            {speechError && (
              <p 
                className="text-xs mt-2"
                style={{ color: 'var(--color-danger)' }}
              >
                Speech error: {speechError}
              </p>
            )}
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-1 h-12">
            {voiceState === 'processing' ? (
              <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
            ) : (isAIResponding || isUserListening) ? waveformBars.map((height: number, index: number) => (
              <div
                key={index}
                className="w-1 rounded-full transition-all duration-100"
                style={{ 
                  height: `${height}%`,
                  opacity: height > 0 ? 1 : 0.3,
                  backgroundColor: isAIResponding ? 'var(--color-primary)' : 'var(--color-success)'
                }}
              />
            )) : Array(20).fill(0).map((_, index) => (
              <div
                key={index}
                className="w-1 rounded-full"
                style={{ 
                  height: '20%', 
                  opacity: 0.3,
                  backgroundColor: 'var(--color-border)'
                }}
              />
            ))}
          </div>
          {userTranscript && (
            <div 
              className="mt-2 p-2 rounded-lg text-center"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <p 
                className="text-sm italic"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                "{userTranscript}"
              </p>
            </div>
          )}
          {(voiceState === 'idle' || voiceState === 'listening') && (
            <button
              type="button"
              onClick={voiceState === 'listening' ? onDoneSpeaking : onStartSpeaking}
              disabled={voiceState === 'idle' && (isMuted || !speechSupported)}
              className="mt-5 w-full rounded-full px-6 py-4 text-lg font-semibold shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              {voiceState === 'idle' ? 'Tap to speak' : 'Done speaking'}
            </button>
          )}

        </div>

        {aiResponse && (
          <div className="border rounded-xl p-4" aria-live="polite"
            style={{ backgroundColor: 'var(--color-green-light)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>MamuCare AI</p>
            <p style={{ color: 'var(--color-text-primary)' }}>{aiResponse}</p>
          </div>
        )}

        {/* Call Info Card */}
        <div 
          className="border rounded-xl p-4 text-center"
          style={{
            backgroundColor: 'var(--color-background)',
            borderColor: 'var(--color-border)'
          }}
        >
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Health Assistant Voice Call
          </p>
          <p 
            className="text-xs mt-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Tap to speak, then press Done speaking to get a response.
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Call Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            {/* Mute Button */}
            <button
              aria-label={isMuted ? "Unmute" : "Mute"}
              aria-pressed={isMuted}
              onClick={onToggleMute}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:opacity-90"
              style={{
                backgroundColor: isMuted ? 'var(--color-danger)' : 'var(--color-surface)',
                color: isMuted ? 'white' : 'var(--color-text-primary)'
              }}
            >
              {isMuted ? (
                <MicOff size={20} />
              ) : (
                <Mic size={20} />
              )}
            </button>

            {/* End Call Button */}
            <button
              aria-label="End Call"
              onClick={onEndCall}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:opacity-90 shadow-lg"
              style={{
                backgroundColor: 'var(--color-danger)',
                color: 'white'
              }}
            >
              <Phone size={24} className="transform rotate-135" />
            </button>

            {/* Speaker Button */}
            <button
              aria-label={isSpeakerOn ? "Speaker On" : "Speaker Off"}
              aria-pressed={isSpeakerOn}
              onClick={onToggleSpeaker}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: isSpeakerOn ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
              }}
            >
              {isSpeakerOn ? (
                <Volume2 size={20} />
              ) : (
                <VolumeX size={20} />
              )}
            </button>
          </div>

          {/* Control Labels */}
          <div 
            className="flex items-center justify-center gap-8 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            <span>End Call</span>
            <span>{isSpeakerOn ? 'Speaker On' : 'Speaker Off'}</span>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
