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
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isAIResponding, setIsAIResponding] = useState(false)
  const [callDuration, setCallDuration] = useState('00:00')
  const [conversationTurn, setConversationTurn] = useState<'user' | 'ai'>('user')
  
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
    isSupported: ttsSupported 
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

  // Handle voice input during call
  useEffect(() => {
    if (isInCall && conversationTurn === 'user' && userTranscript && !isAIResponding) {
      // Check if user has finished speaking (simple heuristic)
      const words = userTranscript.trim().split(' ')
      if (words.length > 3 && userTranscript.endsWith(' ') || 
          words.length > 10) {
        handleUserSpeech(userTranscript.trim())
      }
    }
  }, [userTranscript, isInCall, conversationTurn, isAIResponding])

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

  const handleUserSpeech = async (userSpeech: string) => {
    if (!userSpeech.trim()) return
    
    // Stop listening
    stopUserListening()
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userSpeech,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMessage])
    
    // Reset transcript for next turn
    resetUserTranscript()
    
    // Get AI response
    setConversationTurn('ai')
    setIsAIResponding(true)
    
    try {
      // Use conversation state machine for voice calls
      const conversationResponse: ConversationResponse = await handleCallConversation({
        userId: currentUser?.id || 'anonymous',
        message: userSpeech,
        userContext: getUserContext()
      })

      // Add AI message with conversation context
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: conversationResponse.message,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMessage])

      // Log risk level for monitoring
      if (conversationResponse.riskLevel === 'high' || conversationResponse.isEmergency) {
        console.warn(`High risk conversation detected: ${conversationResponse.riskLevel}`, {
          userId: currentUser?.id,
          state: conversationResponse.state,
          message: userSpeech
        });
      }
      
      // Speak AI response
      if (isSpeakerOn) {
        speakAI(conversationResponse.message)
      }
      
      // Wait for speech to finish, then allow user to speak again
      const speechDuration = Math.max(2000, conversationResponse.message.length * 50) // Estimate speech duration
      setTimeout(() => {
        setIsAIResponding(false)
        setConversationTurn('user')
        if (!isMuted && isInCall) {
          startUserListening()
        }
      }, isSpeakerOn ? speechDuration : 1000)
      
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback response
      const fallbackResponse = t.fallback
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMessage])
      
      if (isSpeakerOn) {
        speakAI(fallbackResponse)
      }
      
      setTimeout(() => {
        setIsAIResponding(false)
        setConversationTurn('user')
        if (!isMuted && isInCall) {
          startUserListening()
        }
      }, isSpeakerOn ? 3000 : 1000)
    }
  }

  const startCall = () => {
    setIsInCall(true)
    setCallStartTime(new Date())
    setIsMuted(false)
    setIsSpeakerOn(true)
    setIsAIResponding(false)
    setConversationTurn('user')
    resetUserTranscript()
    
    // Start with AI greeting
    setTimeout(() => {
      handleAIGreeting()
    }, 1000)
  }

  const handleAIGreeting = async () => {
    setConversationTurn('ai')
    setIsAIResponding(true)
    
    const greeting = t.greeting
    
    // Add greeting to messages
    const greetingMessage: Message = {
      id: Date.now().toString(),
      text: greeting,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, greetingMessage])
    
    // Speak the greeting
    if (isSpeakerOn) {
      speakAI(greeting)
    }
    
    // Wait for speech to finish, then allow user to speak
    setTimeout(() => {
      setIsAIResponding(false)
      setConversationTurn('user')
      if (!isMuted) {
        startUserListening()
      }
    }, isSpeakerOn ? 4000 : 2000)
  }

  const endCall = () => {
    stopUserListening()
    stopAISpeaking()
    setIsInCall(false)
    setCallStartTime(null)
    setIsMuted(false)
    setIsSpeakerOn(true)
    setIsAIResponding(false)
    setConversationTurn('user')
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (newMutedState) {
      stopUserListening()
    } else if (isInCall && conversationTurn === 'user' && !isAIResponding) {
      startUserListening()
    }
  }

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
  }

  if (isInCall) {
    return (
      <CallUI
        onEndCall={endCall}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isSpeakerOn={isSpeakerOn}
        onToggleSpeaker={toggleSpeaker}
        isAIResponding={isAIResponding}
        callDuration={callDuration}
        isUserListening={isUserListening}
        userTranscript={userTranscript}
        speechError={speechError}
        conversationTurn={conversationTurn}
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
