'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getSpeechRecognition, startVoiceRecognition, type VoiceLanguage, type VoiceState } from '@/lib/voiceRecognition'

export function useVoiceAnswer(language: VoiceLanguage, questionIndex: number, onAnswer: (answer: boolean) => void) {
  const [state, setState] = useState<VoiceState>({ status: 'idle' })
  const [supported, setSupported] = useState(false)
  const cancelRef = useRef<(() => void) | null>(null)
  const busyRef = useRef(false)
  const answerRef = useRef(onAnswer)
  answerRef.current = onAnswer

  const reset = useCallback(() => {
    cancelRef.current?.()
    cancelRef.current = null
    busyRef.current = false
    setState({ status: 'idle' })
  }, [])

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognition()))
    reset()
    return () => {
      cancelRef.current?.()
      cancelRef.current = null
    }
  }, [language, questionIndex, reset])

  const start = useCallback(() => {
    // The ref also prevents double starts before React updates the button.
    if (busyRef.current) return
    cancelRef.current?.()
    busyRef.current = true
    cancelRef.current = startVoiceRecognition(getSpeechRecognition(), language, next => {
      busyRef.current = next.status === 'starting' || next.status === 'listening'
      setState(next)
    }, answer => answerRef.current(answer))
  }, [language])

  return { state, supported, start, reset }
}
