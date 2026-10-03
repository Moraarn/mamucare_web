'use client'

interface ProgressDotsProps {
  currentStep: number
  totalSteps: number
}

const stepLabels = ['Your details', 'Health status', 'Care team']

export default function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <nav aria-label="Registration progress" className="mb-4">
      <ol className="flex gap-3">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1
          return (
            <li key={step} aria-current={step === currentStep ? 'step' : undefined} className="min-w-0 flex-1">
              <div className="mb-2 h-1 rounded-full" style={{ backgroundColor: step <= currentStep ? 'var(--color-primary)' : 'var(--color-border)' }} />
              <span className="text-[11px] sm:text-xs" style={{ color: step === currentStep ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: step === currentStep ? 600 : 400 }}>
                {step}. {stepLabels[index]}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
