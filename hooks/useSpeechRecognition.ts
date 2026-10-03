'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}
interface SpeechRecognitionErrorEvent extends Event { error: string }
declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const textRef = useRef('')
  const baseRef = useRef('')
  const activeRef = useRef(false)
  const wantedRef = useRef(false)
  const restartRef = useRef(false)
  const finishRef = useRef<(() => void) | null>(null)
  const pendingStopRef = useRef<Promise<string> | null>(null)

  const startListening = useCallback((continuous = false) => {
    if (!recognitionRef.current || activeRef.current || finishRef.current) return false
    if (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) return false
    wantedRef.current = true
    restartRef.current = continuous
    baseRef.current = textRef.current
    setError(null)
    try {
      activeRef.current = true
      recognitionRef.current.start()
      return true
    } catch {
      activeRef.current = false
      wantedRef.current = false
      setError('Unable to start the microphone. Please try again.')
      return false
    }
  }, [])

  useEffect(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser. Please use text chat.')
      return
    }
    setIsSupported(true)
    const recognition = new Recognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onstart = () => {
      if (!wantedRef.current) { recognition.stop(); return }
      setIsListening(true)
    }
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Rebuild this recognition session so interim revisions never duplicate words.
      const parts = [baseRef.current]
      for (let i = 0; i < event.results.length; i++) parts.push(event.results[i][0].transcript)
      textRef.current = parts.filter(Boolean).join(' ').trim()
      setTranscript(textRef.current)
    }
    recognition.onend = () => {
      activeRef.current = false
      setIsListening(false)
      if (finishRef.current) { finishRef.current(); return }
      // Browser silence limits end sessions, not the user's turn.
      if (wantedRef.current && restartRef.current) startListening(true)
    }
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' && wantedRef.current && restartRef.current) return
      if (event.error === 'aborted' && !wantedRef.current) return
      wantedRef.current = false
      setIsListening(false)
      setError(event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone permission was denied. Allow microphone access or use text chat.'
        : event.error === 'audio-capture'
          ? 'No microphone is available. Check your microphone or use text chat.'
          : 'Speech recognition stopped. Please try again or use text chat.')
    }
    return () => {
      wantedRef.current = false
      recognition.onstart = recognition.onresult = recognition.onerror = recognition.onend = null
      recognition.abort()
      activeRef.current = false
      finishRef.current?.()
      recognitionRef.current = null
    }
  }, [startListening])

  const stopListening = useCallback((): Promise<string> => {
    wantedRef.current = false
    if (pendingStopRef.current) return pendingStopRef.current
    const pending = new Promise<string>(resolve => {
      if (!activeRef.current) { resolve(textRef.current); return }
      // stop() delivers the last result before onend. Keep captured interim text too.
      const timer = setTimeout(() => {
        recognitionRef.current?.abort()
        finishRef.current?.()
      }, 1500)
      finishRef.current = () => {
        clearTimeout(timer)
        finishRef.current = null
        pendingStopRef.current = null
        activeRef.current = false
        setIsListening(false)
        resolve(textRef.current)
      }
      try { recognitionRef.current.stop() } catch { finishRef.current?.() }
    })
    if (activeRef.current) pendingStopRef.current = pending
    return pending
  }, [])
  const resetTranscript = useCallback(() => {
    textRef.current = baseRef.current = ''
    setTranscript('')
    setError(null)
  }, [])
  return { isListening, transcript, isSupported, error, startListening, stopListening, resetTranscript }
}
