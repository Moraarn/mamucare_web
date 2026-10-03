import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserStatus = 'pregnant' | 'postpartum_early' | 'postpartum_late' | 'unknown'
export type Trimester = 'first' | 'second' | 'third' | 'term'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface User {
  id: string
  phone: string
  fullName: string
  status: UserStatus
  trimester?: Trimester
  weeksCount?: number
  chwName?: string
  chwPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  location?: string
}

interface LastCheckup {
  riskLevel: RiskLevel
  conditionChecked: string
  symptomsDetected: string[]
  date: string
}

interface CheckupHistoryEntry {
  riskLevel: RiskLevel
  date: string
}

interface AppState {
  user: User | null
  lastCheckup: LastCheckup | null
  checkupHistory: CheckupHistoryEntry[]
  language: 'en' | 'sw'
  
  setUser: (user: User | null) => void
  setLastCheckup: (checkup: LastCheckup | null) => void
  addToHistory: (entry: CheckupHistoryEntry) => void
  logout: () => void
  setLanguage: (language: 'en' | 'sw') => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      lastCheckup: null,
      checkupHistory: [],
      language: 'en',

      setUser: (user) => {
        console.log('📝 [Store] Setting user:', { userId: user?.id, phone: user?.phone })
        set({ user })
      },

      setLastCheckup: (checkup) => set({ lastCheckup: checkup }),

      addToHistory: (entry) => set((state) => ({
        checkupHistory: [entry, ...state.checkupHistory].slice(0, 10) // Keep last 10 entries
      })),

      setLanguage: (language) => {
        console.log('🌐 [Store] Setting language:', language)
        set({ language })
      },

      logout: () => {
        console.log('🚪 [Store] Logging out user')
        set({ user: null, lastCheckup: null, checkupHistory: [] })
      },
    }),
    {
      name: 'CystaNiva-store',
      storage: typeof window !== 'undefined' 
        ? {
            getItem: (name) => {
              const item = localStorage.getItem(name)
              console.log('📖 [Store] Getting item:', name, !!item)
              return item ? JSON.parse(item) : null
            },
            setItem: (name, value) => {
              console.log('💾 [Store] Setting item:', name, { hasUser: !!(value as any)?.user })
              localStorage.setItem(name, JSON.stringify(value))
            },
            removeItem: (name) => {
              console.log('🗑️ [Store] Removing item:', name)
              localStorage.removeItem(name)
            },
          }
        : undefined, // Server-side storage
      partialize: (state: AppState): Partial<AppState> => ({
        user: state.user,
        lastCheckup: state.lastCheckup,
        checkupHistory: state.checkupHistory,
        language: state.language,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 [Store] Store rehydrated:', { hasUser: !!state?.user, language: state?.language })
        return state
      },
    }
  )
)
