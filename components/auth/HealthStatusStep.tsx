'use client'

import { UserStatus, Trimester } from '@/store/useStore'
import { RegisterData } from '../../lib/types'

interface HealthStatusStepProps {
  formData: RegisterData
  onUpdate: (updates: Partial<RegisterData>) => void
}

const statusOptions = [
  {
    value: 'pregnant' as UserStatus,
    emoji: '🤰',
    label: 'Pregnant',
    subtitle: 'Currently expecting',
  },
  {
    value: 'postpartum_early' as UserStatus,
    emoji: '👶',
    label: 'New mama',
    subtitle: 'Gave birth recently (0–6 wks)',
  },
  {
    value: 'postpartum_late' as UserStatus,
    emoji: '🌸',
    label: 'Postpartum',
    subtitle: 'Birth was 6–12 weeks ago',
  },
]

const trimesterOptions = [
  { value: 'first' as Trimester, label: '1–12 wks' },
  { value: 'second' as Trimester, label: '13–26 wks' },
  { value: 'third' as Trimester, label: '27–36 wks' },
  { value: 'term' as Trimester, label: '37+ wks' },
]

export default function HealthStatusStep({
  formData,
  onUpdate,
}: HealthStatusStepProps) {
  return (
    <div className="space-y-3">
      <p style={{ color: 'var(--color-text-secondary)' }}>I am currently…</p>

      <div className="grid grid-cols-2 gap-3">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onUpdate({ status: option.value, trimester: undefined })}
            className={`p-3 rounded-xl border-2 transition-all ${
              formData.status === option.value
                ? 'border-primary'
                : 'border-border hover:border-gray-300'
            }`}
            style={{
              backgroundColor: formData.status === option.value ? 'var(--color-green-light)' : 'var(--color-surface)',
              borderColor: formData.status === option.value ? 'var(--color-primary)' : 'var(--color-border)',
            }}
          >
            <div className="text-xl mb-1">{option.emoji}</div>
            <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{option.label}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{option.subtitle}</div>
          </button>
        ))}
      </div>

      {formData.status === 'pregnant' && (
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
            How far along?
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {trimesterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onUpdate({ trimester: option.value })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  formData.trimester === option.value
                    ? 'text-white'
                    : 'hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: formData.trimester === option.value ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: formData.trimester === option.value ? 'white' : 'var(--color-text-secondary)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
