'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/ui/AppShell'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import CallUI from '@/components/talk/CallUI'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { fetchCurrentUser } from '@/lib/auth'
import { getApiConfig, getAIResponse, handleCallConversation, type Message, type UserContext, type ConversationResponse } from '../../app/talk/actions'

const translations = {
  en: {
    title: 'Talk to MamuCare AI',
    listening: 'Listening…',
    error: "Sorry, I'm having trouble connecting. Please try again or contact your health worker if you need immediate help.",
    fallback: "I'm having trouble connecting right now. Please try again or contact your health worker if you need immediate help.",
    greeting: "Hello! I'm your MamuCare health assistant. How are you feeling today? You can tell me about any symptoms or concerns you have."
  },
  sw: {
    title: 'Zungumza na MamuCare AI',
    listening: 'Inasikiliza…',
    error: "Samahani, nina shida ya kuunganisha. Tena jaribu au wasiliana na mhudumu wa afya ikiwa unahitaji msaada wa haraka.",
    fallback: "Nina shida ya kuunganika sasa hivi. Tena jaribu au wasiliana na mhudumu wa afya ikiwa unahitaki msaada wa haraka.",
    greeting: "Habari! Mimi ni msaidizi wako wa afya wa MamuCare. Unajisikaje leo? Unaweza kuambia kuhusu dalili zozote au wasiwasi ulio nazo."
  }
}

interface TalkClientProps {
  initialMessages: Message[]
  userContext: {
    status: string
    trimester: string
    weeksCount: number
    lastRiskLevel?: string
    lastSymptoms: string[]
  }
  user: any | null
}

export default function TalkClient({ initialMessages, userContext, user }: TalkClientProps) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(user)
  const [language] = useState<'en' | 'sw'>('en')
  const t = translations[language]

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (currentUser) return

      const user = await fetchCurrentUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setCurrentUser(user)
    }

    checkAuth()
  }, [currentUser, router])

  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  
  // Call state
  const [isInCall, setIsInCall] = useState(false)
  const [callStartTime, setCallStartTime] = useState<Date | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const mutedRef = useRef(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callResponse, setCallResponse] = useState('')
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle')
  const voiceStateRef = useRef(voiceState)
  const callSessionRef = useRef(0)
  const callActiveRef = useRef(false)
  const speakerRef = useRef(true)
  const changeVoiceState = (state: typeof voiceState) => {
    voiceStateRef.current = state
    setVoiceState(state)
  }
  const [callDuration, setCallDuration] = useState('00:00')

  
  // Voice hooks
  const { 
    isListening: isUserListening, 
    transcript: userTranscript, 
    isSupported: speechSupported,
    error: speechError,
    startListening: startUserListening,
    stopListening: stopUserListening,
    resetTranscript: resetUserTranscript
  } = useSpeechRecognition()
  
  const { 
    isSpeaking: isAISpeaking, 
    speak: speakAI, 
    stop: stopAISpeaking,
    isSupported: ttsSupported,
    error: ttsError 
  } = useTextToSpeech()
  
  const callIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Call duration timer
  useEffect(() => {
    if (isInCall && callStartTime) {
      callIntervalRef.current = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - callStartTime.getTime()) / 1000)
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        setCallDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }, 1000)
    } else {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current)
        callIntervalRef.current = null
      }
      setCallDuration('00:00')
    }

    return () => {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current)
      }
    }
  }, [isInCall, callStartTime])

  useEffect(() => {
    if (speechError && callActiveRef.current && voiceStateRef.current === 'listening') {
      void stopUserListening()
      changeVoiceState('idle')
    }
  }, [speechError, stopUserListening])

  useEffect(() => () => {
    callActiveRef.current = false
    callSessionRef.current++
  }, [])

  const getUserContext = () => {
    if (!currentUser) return userContext

    return {
      status: currentUser.status,
      trimester: currentUser.trimester || 'first',
      weeksCount: currentUser.weeksCount || 0,
      lastRiskLevel: userContext.lastRiskLevel,
      lastSymptoms: userContext.lastSymptoms || [],
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    try {
      // Use server action instead of direct fetch
      const responseText = await getAIResponse({
        message: text.trim(),
        history: messages.slice(-10),
        userContext: getUserContext()
      })

      setIsTyping(false)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)

      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t.error,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording and send the transcript
      setIsRecording(false)
      stopUserListening()
      if (userTranscript.trim()) {
        sendMessage(userTranscript)
        resetUserTranscript()
      }
    } else {
      // Start recording
      setIsRecording(true)
      resetUserTranscript()
      startUserListening()
    }
  }

  // Handle speech completion in chat mode
  useEffect(() => {
    if (isRecording && !isInCall && userTranscript && !isUserListening) {
      // Speech recognition stopped naturally, send the message
      setIsRecording(false)
      if (userTranscript.trim()) {
        sendMessage(userTranscript)
        resetUserTranscript()
      }
    }
  }, [isUserListening, userTranscript, isRecording, isInCall])

  const playCallResponse = (text: string, session: number) => {
    if (!callActiveRef.current || session !== callSessionRef.current) return
    setCallResponse(text)
    if (!speakerRef.current || !ttsSupported) { resetUserTranscript(); changeVoiceState('idle'); return }
    changeVoiceState('speaking')
    speakAI(text, () => {
      if (callActiveRef.current && session === callSessionRef.current) { resetUserTranscript(); changeVoiceState('idle') }
    })
  }

  const finishUserTurn = async () => {
    // Synchronous guard blocks repeated clicks before React renders.
    if (!callActiveRef.current || voiceStateRef.current !== 'listening') return
    const session = callSessionRef.current
    changeVoiceState('processing')
    const userSpeech = (await stopUserListening()).trim()
    if (!callActiveRef.current || session !== callSessionRef.current) return
    if (!userSpeech) { changeVoiceState('idle'); return }
    setMessages(prev => [...prev, {
      id: Date.now().toString(), text: userSpeech, isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }])
    try {
      const response: ConversationResponse = await handleCallConversation({
        userId: currentUser?.id || 'anonymous', message: userSpeech, userContext: getUserContext()
      })
      if (!callActiveRef.current || session !== callSessionRef.current) return
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), text: response.message, isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
      playCallResponse(response.message, session)
    } catch (error) {
      if (!callActiveRef.current || session !== callSessionRef.current) return
      console.error('Error getting AI response:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), text: t.fallback, isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
      playCallResponse(t.fallback, session)
    }
  }

  const startUserTurn = () => {
    if (!callActiveRef.current || voiceStateRef.current !== 'idle' || isMuted || isAISpeaking) return
    resetUserTranscript()
    if (startUserListening(true)) changeVoiceState('listening')
  }

  const startCall = async () => {
    if (callActiveRef.current) return
    callActiveRef.current = true
    const session = ++callSessionRef.current
    setIsRecording(false)
    await stopUserListening()
    if (!callActiveRef.current || session !== callSessionRef.current) return
    stopAISpeaking()
    speakerRef.current = true
    setCallResponse('')
    setIsInCall(true)
    setCallStartTime(new Date())
    mutedRef.current = false
    setIsMuted(false)
    setIsSpeakerOn(true)
    changeVoiceState('idle')
    resetUserTranscript()
  }

  const endCall = () => {
    callActiveRef.current = false
    callSessionRef.current++
    void stopUserListening()
    stopAISpeaking()
    setIsInCall(false)
    setCallStartTime(null)
    mutedRef.current = false
    setIsMuted(false)
    setIsSpeakerOn(true)
    changeVoiceState('idle')
  }

  const toggleMute = async () => {
    const muted = !mutedRef.current
    mutedRef.current = muted
    setIsMuted(muted)
    if (muted) void stopUserListening()
    else {
      const session = callSessionRef.current
      await stopUserListening()
      if (callActiveRef.current && session === callSessionRef.current && !mutedRef.current && voiceStateRef.current === 'listening') startUserListening(true)
    }
  }

  const toggleSpeaker = () => {
    speakerRef.current = !speakerRef.current
    setIsSpeakerOn(speakerRef.current)
    if (!speakerRef.current) {
      stopAISpeaking()
      if (voiceStateRef.current === 'speaking') { resetUserTranscript(); changeVoiceState('idle') }
    }
  }

  if (isInCall) {
    return (
      <CallUI
        onEndCall={endCall}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isSpeakerOn={isSpeakerOn}
        onToggleSpeaker={toggleSpeaker}
        voiceState={voiceState}
        onStartSpeaking={startUserTurn}
        onDoneSpeaking={finishUserTurn}
        speechSupported={speechSupported}
        callDuration={callDuration}
        isUserListening={isUserListening}
        userTranscript={userTranscript}
        aiResponse={callResponse}
        speechError={speechError || ttsError}

      />
    )
  }

  return (
    <AppShell
      viewport
    >
      <div className="chat-panel">
        {/* Voice Status Bar */}
        {isRecording && (
          <div 
            className="px-4 py-2 border-b"
            style={{
              backgroundColor: 'var(--color-green-light)',
              borderColor: 'var(--color-green-dark)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full animate-waveform"
                    style={{ 
                      height: `${8 + Math.random() * 16}px`,
                      animationDelay: `${i * 0.1}s`,
                      backgroundColor: 'var(--color-primary)'
                    }}
                  />
                ))}
              </div>
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                {t.listening}
              </span>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <MessageList 
          messages={messages}
          isTyping={isTyping}
        />

        {/* Input Area */}
        <ChatInput
          onSendMessage={sendMessage}
          onVoiceInput={handleVoiceInput}
          onStartCall={startCall}
          isRecording={isRecording}
          transcript={userTranscript}
        />
      </div>
    </AppShell>
  )
}
