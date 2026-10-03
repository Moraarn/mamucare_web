'use client'

import { useState, useEffect, useRef } from 'react'

export interface UseTextToSpeechReturn {
  isSpeaking: boolean
  isSupported: boolean
  error: string | null
  speak: (text: string) => void
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
      
      // Set up event listeners
      const handleStart = () => setIsSpeaking(true)
      const handleEnd = () => setIsSpeaking(false)
      const handleError = (event: SpeechSynthesisErrorEvent) => {
        console.error('Text-to-speech error:', event.error)
        setError(event.error)
        setIsSpeaking(false)
      }
      
      synthesisRef.current.addEventListener('voiceschanged', () => {
        // Voices are loaded
      })
    } else {
      setIsSupported(false)
      setError('Text-to-speech is not supported in this browser')
    }
  }, [])

  const speak = (text: string) => {
    if (!synthesisRef.current || !text.trim()) return
    
    // Cancel any ongoing speech
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
    }
    
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('Text-to-speech error:', event.error)
      setError(event.error)
      setIsSpeaking(false)
    }
    
    speechRef.current = utterance
    synthesisRef.current.speak(utterance)
  }

  const stop = () => {
    if (synthesisRef.current) {
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
