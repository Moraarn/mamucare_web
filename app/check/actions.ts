// app/check/actions.ts
'use server'

import { api } from '@/server/api'
import { cookies } from 'next/headers'

export interface Question {
  id: number
  tag: string
  text: string
  hint: string
  text_sw: string
  hint_sw: string
  userStatus: string
  trimester?: string
}

export interface RiskResult {
  riskLevel: 'low' | 'medium' | 'high'
  conditionChecked: string
  symptomsDetected: string[]
}

export interface CheckResult {
  id: string
  userId: string
  answers: boolean[]
  riskLevel: string
  riskFactors: string[]
  recommendations: string[]
  date: string
  questions: Question[]
  riskResults: RiskResult[]
  smsAlertStatus?: {
    chwSent: boolean
    emergencySent: boolean
  }
}

export interface CheckSession {
  id?: string
  _id?: string
  userId: string
  currentQuestionIndex: number
  answers: boolean[]
  isCompleted: boolean
  createdAt: string
  completedAt?: string
}

export async function getQuestions(userStatus: string, trimester?: string): Promise<Question[]> {
  console.log(' [Check Actions] getQuestions called with:', { userStatus, trimester })
  try {
    console.log(' [Check Actions] Calling backend API...')
    
    if (!userStatus) {
      console.error(' [Check Actions] No userStatus provided')
      return []
    }
    
    // Map trimester from words to numbers for backend compatibility
    const trimesterMap: Record<string, string> = {
      'first': '1',
      'second': '2',
      'third': '3',
      'term': '3' // Map term to 3rd trimester
    }
    const mappedTrimester = trimester ? trimesterMap[trimester] || trimester : undefined
    
    const url = mappedTrimester ? `/check/questions/${userStatus}?trimester=${mappedTrimester}` : `/check/questions/${userStatus}`
    console.log(' [Check Actions] Request URL:', url)
    const response = await api.get(url)
    console.log(' [Check Actions] Backend response received:', {
      success: response.success,
      message: response.message,
      dataType: typeof response.body,
      isArray: Array.isArray(response.body),
      dataLength: Array.isArray(response.body) ? response.body.length : 'N/A',
      fullResponse: response
    })
    
    // Handle both direct array response and wrapped response
    let questionsData: unknown = response.body;

    if (response.success === false) {
      console.error(' [Check Actions] Response indicates failure:', response)
      return []
    }

    // Normalize response shape
    if (!Array.isArray(questionsData)) {
      const responseAny = response as any;

      if (Array.isArray(responseAny)) {
        questionsData = responseAny;
      } else if (Array.isArray(responseAny.data)) {
        questionsData = responseAny.data;
      } else if (Array.isArray(responseAny.questions)) {
        questionsData = responseAny.questions;
      } else if (Array.isArray(responseAny.body?.data)) {
        questionsData = responseAny.body.data;
      } else if (Array.isArray(responseAny.body?.questions)) {
        questionsData = responseAny.body.questions;
      }
    }

    // Ensure we return an array
    if (!Array.isArray(questionsData)) {
      console.warn(' [Check Actions] Backend returned non-array, returning empty:', typeof questionsData, questionsData)
      return []
    }
    
    console.log(' [Check Actions] Returning questions:', { count: questionsData.length })
    return questionsData
  } catch (error) {
    console.error(' [Check Actions] Error fetching questions from backend:', {
      error: error instanceof Error ? error.message : String(error),
      fullError: error
    })
    // Return empty array instead of throwing to allow graceful degradation
    return []
  }
}

export async function createCheckSession(userId: string): Promise<CheckSession> {
  console.log(' [Check Actions] Creating session for user:', userId)
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value
    console.log(' [Check Actions] Access token from cookies:', {
      hasToken: !!accessToken,
      tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none'
    })

    const response = await api.post('/check/session', { userId })
    console.log(' [Check Actions] Session creation response:', {
      success: response.success,
      hasBody: !!response.body,
      body: response.body,
      message: response.message
    })
    if (response.success && response.body) {
      console.log(' [Check Actions] Session created successfully:', response.body)
      return response.body as CheckSession
    }
    throw new Error(response.message || 'Failed to create check session')
  } catch (error) {
    console.error(' [Check Actions] Error creating check session:', error)
    throw error
  }
}

export async function updateSessionAnswer(
  sessionId: string, 
  answerIndex: number, 
  answer: boolean
): Promise<CheckSession> {
  try {
    const response = await api.post(`/check/session/${sessionId}/answer`, {
      answerIndex,
      answer
    })
    if (response.success && response.body) {
      return response.body as CheckSession
    }
    throw new Error(response.message || 'Failed to update session answer')
  } catch (error) {
    console.error('Error updating session:', error)
    throw error
  }
}

export async function completeCheckSession(
  sessionId: string,
  userId: string,
  userStatus: string
): Promise<CheckResult> {
  console.log(' [Check Actions] Completing session:', { sessionId, userId, userStatus })
  try {
    const response = await api.post(`/check/session/${sessionId}/complete`, {
      userId,
      userStatus
    })
    console.log(' [Check Actions] Session completion response:', {
      success: response.success,
      hasBody: !!response.body,
      body: response.body,
      message: response.message
    })
    if (response.success && response.body) {
      console.log(' [Check Actions] Session completed successfully:', response.body)
      return (response.body as any).data as CheckResult
    }
    throw new Error(response.message || 'Failed to complete check session')
  } catch (error) {
    console.error(' [Check Actions] Error completing check session:', error)
    throw error
  }
}

export async function getUserCheckHistory(userId: string): Promise<CheckResult[]> {
  try {
    const response = await api.get(`/check/history/${userId}`)
    if (response.success && response.body) {
      return response.body as CheckResult[]
    }
    console.error('Failed to fetch check history:', response.message)
    return []
  } catch (error) {
    console.error('Error fetching check history:', error)
    return []
  }
}

export async function getLastCheckResult(userId: string): Promise<CheckResult | null> {
  try {
    const response = await api.get(`/check/last/${userId}`)
    if (response.success && response.body) {
      return response.body as CheckResult | null
    }
    console.error('Failed to fetch last check result:', response.message)
    return null
  } catch (error) {
    console.error('Error fetching last check result:', error)
    return null
  }
}