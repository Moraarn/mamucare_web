'use client'

import { useState } from 'react'
import { normalizePhone } from '@/lib/phone'
import { useRouter } from 'next/navigation'
import ProgressDots from './ProgressDots'
import PersonalDetailsStep from './PersonalDetailsStep'
import HealthStatusStep from './HealthStatusStep'
import CareTeamStep from './CareTeamStep'
import FormNavigation from './FormNavigation'
import { RegisterData, SignupStepperProps } from '../../lib/types'

export default function SignupStepper({
  onSwitchToLogin,
  onSuccess,
}: SignupStepperProps) {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<RegisterData>({
    fullName: '',
    phone: '',
    location: '',
    password: '',
    status: 'unknown',
    trimester: undefined,
    chwName: '',
    chwPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })

  const updateFormData = (updates: Partial<RegisterData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  async function submitRegistration(payload: unknown): Promise<{
    success: boolean;
    message?: string;
    user?: unknown;
    requiresVerification?: boolean;
    nextStep?: string;
  }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          success: false,
          message: data?.message ?? 'Registration failed',
        };
      }

      return {
        success: true,
        message: data?.message,
        user: data?.user ?? null,
        requiresVerification: data?.requiresVerification,
        nextStep: data?.nextStep,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  const handleSubmit = async () => {
    if (isSubmitted || isLoading) return

    setIsLoading(true)
    setIsSubmitted(true)
    setError(null)

    const phone = normalizePhone(formData.phone)
    const chwPhone = formData.chwPhone ? normalizePhone(formData.chwPhone) : ''
    const emergencyContactPhone = formData.emergencyContactPhone ? normalizePhone(formData.emergencyContactPhone) : ''
    if (!phone || chwPhone === null || emergencyContactPhone === null) {
      setError('Please check the phone numbers you entered.')
      setIsLoading(false)
      setIsSubmitted(false)
      return
    }
    const result = await submitRegistration({ ...formData, phone, chwPhone, emergencyContactPhone })

    if (!result.success) {
      setError(result.message ?? 'Registration failed')
      setIsLoading(false)
      setIsSubmitted(false)
      return
    }

    if (result.requiresVerification || result.nextStep) {
      // Preserve existing verification flow if present.
      setIsLoading(false)
      setIsSubmitted(false)
      return
    }

    onSuccess()
    router.replace('/home')
    router.refresh()
  }

  const nextStep = () => {
    if (isLoading || isSubmitted || !canProceed()) return

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Validate against country-specific phone metadata.
        const isPhoneValid = !!normalizePhone(formData.phone)
        return !!(
          formData.fullName.trim() &&
          formData.phone &&
          isPhoneValid &&
          formData.location &&
          formData.password.length >= 6
        )

      case 2:
        return !!(
          formData.status !== 'unknown' &&
          (formData.status !== 'pregnant' || formData.trimester)
        )

      case 3:
        return !!normalizePhone(formData.phone) && (!formData.chwPhone || !!normalizePhone(formData.chwPhone)) && (!formData.emergencyContactPhone || !!normalizePhone(formData.emergencyContactPhone))

      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Your details
            </h2>
            <PersonalDetailsStep
              formData={formData}
              onUpdate={updateFormData}
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-3">
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Health status
            </h2>
            <HealthStatusStep
              formData={formData}
              onUpdate={updateFormData}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-3">
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Care team
            </h2>
            <CareTeamStep
              formData={formData}
              onUpdate={updateFormData}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form
      aria-label="Create your account"
      aria-busy={isLoading}
      onSubmit={event => {
        event.preventDefault()
        nextStep()
      }}
    >
      <ProgressDots currentStep={currentStep} totalSteps={3} />

      {renderStep()}

      {error && (
        <div role="alert" className="text-red-500 text-sm mt-4">
          {error}
        </div>
      )}

      <FormNavigation
        currentStep={currentStep}
        isLoading={isLoading}
        canProceed={canProceed()}
        onPrevious={prevStep}
      />

      <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={isLoading}
            className="text-sm hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Already have an account? Sign in
          </button>
      </div>
    </form>
  )
}
