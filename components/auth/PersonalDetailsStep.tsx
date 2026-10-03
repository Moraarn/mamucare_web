'use client'

import LocationPicker from './LocationPicker'
import PhoneInput from './PhoneInput'
import PasswordInput from './PasswordInput'
import { RegisterData } from '../../lib/types'

interface PersonalDetailsStepProps {
  formData: RegisterData
  onUpdate: (updates: Partial<RegisterData>) => void
}

export default function PersonalDetailsStep({
  formData,
  onUpdate,
}: PersonalDetailsStepProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
          Full name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => onUpdate({ fullName: e.target.value })}
          placeholder="e.g. Amina Wanjiru"
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[var(--color-text-primary)]"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
          }}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
          Phone number
        </label>
        <PhoneInput
          value={formData.phone}
          onChange={(fullNumber) => onUpdate({ phone: fullNumber })}
        />
      </div>

      <LocationPicker
        locationValue={formData.location}
        onLocationChange={(location) => onUpdate({ location })}
      />

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
          Create a password
        </label>
        <PasswordInput
          value={formData.password}
          onChange={(value) => onUpdate({ password: value })}
          placeholder="Create a password"
          required
          minLength={6}
          helperText="Use at least 6 characters"
        />
      </div>
    </div>
  )
}
