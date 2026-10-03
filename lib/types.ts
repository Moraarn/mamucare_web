import { UserStatus, Trimester } from '@/store/useStore'

export interface RegisterData {
  fullName: string
  phone: string
  location: string
  password: string
  status: UserStatus
  trimester?: Trimester
  chwName?: string
  chwPhone?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export interface SignupStepperProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}
