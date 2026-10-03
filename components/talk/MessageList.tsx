'use client'

import { useEffect, useRef } from 'react'
import ChatBubble from '@/components/talk/ChatBubble'
import TypingIndicator from '@/components/talk/TypingIndicator'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

interface MessageListProps {
  messages: Message[]
  isTyping: boolean
}

export default function MessageList({ messages, isTyping }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4">
      {messages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message.text}
          isUser={message.isUser}
          timestamp={message.timestamp}
          showAvatar={!message.isUser}
        />
      ))}
      
      {isTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  )
}
