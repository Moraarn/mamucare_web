'use client'

import { useState } from 'react'
import TalkClient from '../../components/talk/TalkClient'

export const dynamic = 'force-dynamic'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

export default function TalkPage() {
  const [language] = useState<'en' | 'sw'>('en')

  const initialMessages: Message[] = [
    {
      id: '1',
      text: language === 'sw'
        ? "Habari! Mimi ni msaidizi wako wa afya wa CystaNiva. Niambie unajisikaje leo — unaweza kuongea au kuandika katika lugha yoyote."
        : "Hello! I am the CystaNiva health assistant. Tell me how you are feeling today — you can speak or type in any language.",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]

  const userContext = {
    status: 'unknown',
    trimester: 'first',
    weeksCount: 0,
    lastRiskLevel: 'low',
    lastSymptoms: [],
  }

  return (
    <TalkClient
      initialMessages={initialMessages}
      userContext={userContext}
      user={null}
    />
  )
}
