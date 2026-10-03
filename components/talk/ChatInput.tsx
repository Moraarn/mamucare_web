'use client'

import { useState, useRef } from 'react'
import { Send, Phone } from 'lucide-react'
import MicButton from '@/components/talk/MicButton'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onVoiceInput: () => void
  onStartCall: () => void
  isRecording: boolean
  transcript: string
}

export default function ChatInput({ onSendMessage, onVoiceInput, onStartCall, isRecording, transcript }: ChatInputProps) {
  const [inputText, setInputText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage(inputText)
      setInputText('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }

  const handleSendClick = () => {
    onSendMessage(inputText)
    setInputText('')
  }

  return (
    <div 
      className="shrink-0 border-t p-3 sm:p-4"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-background)'
      }}
    >
      {/* Transcript display when recording */}
      {isRecording && transcript && (
        <div 
          className="mb-3 p-3 rounded-lg text-sm italic"
          style={{
            backgroundColor: 'var(--color-green-light)',
            color: 'var(--color-text-secondary)'
          }}
        >
          "{transcript}"
        </div>
      )}
      
      <div className="flex items-center gap-2 sm:gap-3">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={isRecording ? "Listening..." : "Type how you feel…"}
          aria-label="Your message"
          className="min-w-0 flex-1 px-3 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent text-sm"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            '--tw-ring-color': 'var(--color-primary)'
          } as React.CSSProperties}
          disabled={isRecording}
        />
        
        <MicButton
          isRecording={isRecording}
          onClick={onVoiceInput}
        />
        
        <button
          aria-label="Send message"
          onClick={handleSendClick}
          disabled={!inputText.trim() || isRecording}
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}
        >
          <Send size={16} />
        </button>

        {/* Call Button */}
        <button
          aria-label="Start voice call"
          onClick={onStartCall}
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:opacity-90 shadow-lg"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
          }}
        >
          <Phone size={16} />
        </button>
      </div>
    </div>
  )
}
