'use client'

import Button from '@/components/ui/Button'

interface FormNavigationProps {
  currentStep: number
  isLoading: boolean
  canProceed: boolean
  onPrevious: () => void
}

export default function FormNavigation({
  currentStep,
  isLoading,
  canProceed,
  onPrevious,
}: FormNavigationProps) {
  return (
    <div className="flex gap-3 mt-4">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
        >
          ← Back
        </Button>
      )}

      <Button
        type="submit"
        disabled={!canProceed || isLoading}
        className="flex-1"
      >
        {isLoading
          ? 'Creating account...'
          : currentStep === 3
            ? 'Create my account'
            : 'Continue →'}
      </Button>
    </div>
  )
}
