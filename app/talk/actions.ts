'use server'

import { getServerToken } from '@/lib/auth'



export interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: string
}

export interface UserContext {
  status?: string
  trimester?: string
  weeksCount?: number
  lastRiskLevel?: string
  lastSymptoms?: string[]
}

export interface TalkRequest {
  message: string
  history: Message[]
  userContext: UserContext
}

export interface CallRequest {
  userId: string
  message: string
  userContext?: UserContext
}

export interface ConversationResponse {
  message: string
  state: string
  riskLevel?: 'low' | 'medium' | 'high'
  isEmergency?: boolean
  language: 'en' | 'sw'
}

export async function getApiConfig(): Promise<{ url: string; headers: Record<string, string> }> {
  const token = await getServerToken()
  
  return {
    url: 'http://localhost:5000/api/talk',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }
}

export async function getAIResponse(request: TalkRequest): Promise<string> {
  try {
    // Import the server-side OpenAI action
    const { generateAIResponse } = await import('./openaiAction')
    
    // Detect language from the message
    const language = request.message.toLowerCase().includes('sasa') || 
                    request.message.toLowerCase().includes('habari') || 
                    request.message.toLowerCase().includes('leo') ||
                    request.message.toLowerCase().includes('unajisikiaje') ||
                    request.message.toLowerCase().includes('pole') ||
                    request.message.toLowerCase().includes('sawa') ||
                    request.message.toLowerCase().includes('kuna') ||
                    request.message.toLowerCase().includes('jambo') ||
                    request.message.toLowerCase().includes('kuhusu') ||
                    request.message.toLowerCase().includes('naumwa') ||
                    request.message.toLowerCase().includes('nauma') ||
                    request.message.toLowerCase().includes('tumbo') ? 'sw' : 'en'
    
    // Detect if message contains symptoms
    const symptomKeywords = language === 'sw' 
      ? ['maumivu', 'tumbo', 'kichwa', 'damu', 'uchafu', 'kichefuchefu', 'pua', 'homa', 'uvimbe', 'kokoto', 'mtindo', 'naumwa', 'nauma']
      : ['pain', 'hurt', 'ache', 'stomach', 'headache', 'bleeding', 'blood', 'nausea', 'dizzy', 'fever', 'swelling', 'cramps', 'discharge']
    
    const symptomDetected = symptomKeywords.some(keyword => request.message.toLowerCase().includes(keyword))
    
    // Generate natural response using server-side OpenAI
    const response = await generateAIResponse({
      state: symptomDetected ? 'collecting_symptoms' : 'general',
      userMessage: request.message,
      symptomDetected,
      language,
      previousMessages: request.history.slice(-3).map(msg => msg.text)
    })
    
    return response.message
  } catch (error) {
    console.error('Error in getAIResponse server action:', error)
    throw error
  }
}

export async function handleCallConversation(request: CallRequest): Promise<ConversationResponse> {
  try {
    // Import the server-side OpenAI action
    const { generateAIResponse } = await import('./openaiAction')
    
    // Detect language from the message
    const language = request.message.toLowerCase().includes('sasa') || 
                    request.message.toLowerCase().includes('habari') || 
                    request.message.toLowerCase().includes('leo') ||
                    request.message.toLowerCase().includes('unajisikiaje') ||
                    request.message.toLowerCase().includes('pole') ||
                    request.message.toLowerCase().includes('sawa') ||
                    request.message.toLowerCase().includes('kuna') ||
                    request.message.toLowerCase().includes('jambo') ||
                    request.message.toLowerCase().includes('nimefura') ||
                    request.message.toLowerCase().includes('tumbo') ||
                    request.message.toLowerCase().includes('uvimbe') ||
                    request.message.toLowerCase().includes('naumwa') ||
                    request.message.toLowerCase().includes('nauma') ? 'sw' : 'en'
    
    // Detect if message contains symptoms
    const symptomKeywords = language === 'sw' 
      ? ['maumivu', 'tumbo', 'kichwa', 'damu', 'uchafu', 'kichefuchefu', 'pua', 'homa', 'uvimbe', 'kokoto', 'mtindo', 'fura']
      : ['pain', 'hurt', 'ache', 'stomach', 'headache', 'bleeding', 'blood', 'nausea', 'dizzy', 'fever', 'swelling', 'cramps', 'discharge']
    
    const symptomDetected = symptomKeywords.some(keyword => request.message.toLowerCase().includes(keyword))
    
    // Generate natural response using server-side OpenAI
    const response = await generateAIResponse({
      state: symptomDetected ? 'collecting_symptoms' : 'general',
      userMessage: request.message,
      symptomDetected,
      language,
      previousMessages: []
    })
    
    return {
      message: response.message,
      state: symptomDetected ? 'collecting_symptoms' : 'general',
      language: response.language
    }
  } catch (error) {
    console.error('Error in handleCallConversation:', error)
    throw error
  }
}


