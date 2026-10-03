// app/profile/actions.ts
'use server'

import { api } from '@/server/api'
import { CheckResult } from '../check/actions'

export interface UserProfile {
  userId: string
  totalChecks: number
  riskStats: {
    high: number
    medium: number
    low: number
  }
  lastCheckResult: CheckResult | null
  checkHistory: CheckResult[]
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const response = await api.get('/profile')
    if (response.success && response.body) {
      const profile = response.body as any
      
      // Convert MongoDB _id to id for checkHistory
      if (profile.checkHistory) {
        profile.checkHistory = profile.checkHistory.map((item: any) => ({
          ...item,
          id: item._id || item.id,
          date: item.date ? new Date(item.date).toISOString() : new Date().toISOString()
        }))
      }
      
      // Convert _id to id for lastCheckResult
      if (profile.lastCheckResult && profile.lastCheckResult._id) {
        profile.lastCheckResult.id = profile.lastCheckResult._id
        profile.lastCheckResult.date = profile.lastCheckResult.date 
          ? new Date(profile.lastCheckResult.date).toISOString() 
          : new Date().toISOString()
      }
      
      return profile as UserProfile
    }
    throw new Error(response.message || 'Failed to fetch user profile')
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

export async function getUserCheckHistory(): Promise<CheckResult[]> {
  try {
    const response = await api.get('/profile/check-history')
    if (response.success && response.body) {
      const history = response.body as any[]
      // Convert MongoDB _id to id and format dates
      return history.map((item: any) => ({
        ...item,
        id: item._id || item.id,
        date: item.date ? new Date(item.date).toISOString() : new Date().toISOString()
      })) as CheckResult[]
    }
    console.error('Failed to fetch check history:', response.message)
    return []
  } catch (error) {
    console.error('Error fetching check history:', error)
    return []
  }
}

export async function getLastCheckResult(): Promise<CheckResult | null> {
  try {
    const response = await api.get('/profile/last-check')
    if (response.success && response.body) {
      const result = response.body as any
      // Convert MongoDB _id to id and format date
      return {
        ...result,
        id: result._id || result.id,
        date: result.date ? new Date(result.date).toISOString() : new Date().toISOString()
      } as CheckResult
    }
    console.error('Failed to fetch last check result:', response.message)
    return null
  } catch (error) {
    console.error('Error fetching last check result:', error)
    return null
  }
}