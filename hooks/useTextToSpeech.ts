'use client'

import { useState, useEffect, useRef } from 'react'

export interface UseTextToSpeechReturn {
  isSpeaking: boolean
  isSupported: boolean
  error: string | null
  speak: (text: string, onComplete?: () => void) => void
  stop: () => void
  pause: () => void
  resume: () => void
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true)
      synthesisRef.current = window.speechSynthesis
      
      return () => {
        if (speechRef.current) {
          speechRef.current.onend = null
          speechRef.current.onerror = null
          speechRef.current.onstart = null
        }
        window.speechSynthesis.cancel()
      }
    } else {
      setIsSupported(false)
      setError('Text-to-speech is not supported in this browser')
    }
  }, [])

  const speak = (text: string, onComplete?: () => void) => {
    if (!synthesisRef.current || !text.trim()) { onComplete?.(); return }
    
    // Cancel any ongoing speech
    if (speechRef.current) {
      speechRef.current.onstart = speechRef.current.onend = speechRef.current.onerror = null
    }
    synthesisRef.current.cancel()
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Configure voice settings
    const voices = synthesisRef.current.getVoices()
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.includes('en')) || voices[0]
    
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.rate = 0.9  // Slightly slower for clarity
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true)
      setError(null)
    }
    
    utterance.onend = () => {
      setIsSpeaking(false)
      onComplete?.()
    }
    
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('Text-to-speech error:', event.error)
      setError(event.error)
      setIsSpeaking(false)
      onComplete?.()
    }
    
    speechRef.current = utterance
    try { synthesisRef.current.speak(utterance) } catch {
      setError('Unable to play audio. Please read the response.')
      setIsSpeaking(false)
      onComplete?.()
    }
  }

  const stop = () => {
    if (synthesisRef.current) {
      if (speechRef.current) {
        speechRef.current.onstart = speechRef.current.onend = speechRef.current.onerror = null
      }
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const pause = () => {
    if (synthesisRef.current) {
      synthesisRef.current.pause()
    }
  }

  const resume = () => {
    if (synthesisRef.current) {
      synthesisRef.current.resume()
    }
  }

  return {
    isSpeaking,
    isSupported,
    error,
    speak,
    stop,
    pause,
    resume
  }
}
