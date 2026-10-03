'use client'

import { useId, useState } from 'react'
import { getCountryCallingCode, parsePhoneNumberFromString, validatePhoneNumberLength, type CountryCode } from 'libphonenumber-js/max'
import { normalizePhone } from '@/lib/phone'
import CountrySelect from './CountrySelect'

interface PhoneInputProps {
  value: string
  onChange: (fullNumber: string) => void
  placeholder?: string
  label?: string
}

export default function PhoneInput({ value, onChange, placeholder, label = 'Phone number' }: PhoneInputProps) {
  const id = useId()
  const initial = parsePhoneNumberFromString(value, 'KE')
  const [country, setCountry] = useState<CountryCode>(initial?.country || 'KE')
  const [display, setDisplay] = useState(initial ? initial.formatInternational().replace(/^\+\d+\s*/, '') : value)
  const [touched, setTouched] = useState(false)
  const [inputError, setInputError] = useState<string | null>(null)
  const invalid = !!inputError || (touched && !!value && !normalizePhone(value))

  const update = (raw: string, selected: CountryCode) => {
    if (!/^\+?[\d\s().-]*$/.test(raw)) return
    if (raw.replace(/\D/g, '').length > 15 || validatePhoneNumberLength(raw, selected) === 'TOO_LONG') {
      setInputError('This number is too long for the selected country.')
      onChange('')
      return
    }
    setInputError(null)
    const parsed = parsePhoneNumberFromString(raw, selected)
    const nextCountry = raw.startsWith('+') && parsed?.country ? parsed.country : selected
    setCountry(nextCountry)
    setDisplay(raw.startsWith('+') && parsed ? parsed.formatInternational().replace(/^\+\d+\s*/, '') : raw)
    onChange(raw.trim() ? normalizePhone(raw, nextCountry) || (raw.startsWith('+') ? raw : `+${getCountryCallingCode(nextCountry)}${raw}`) : '')
  }

  return (
    <div>
      <div className="flex min-w-0 rounded-xl border bg-[var(--color-surface)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
        <CountrySelect country={country} label={label} onChange={selected => { setCountry(selected); update(display, selected) }} />
        <input id={id} aria-label={label} type="tel" inputMode="tel" autoComplete="tel-national" maxLength={25}
          value={display} placeholder={placeholder || '712 345 678'} aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined}
          className="w-full min-w-0 rounded-r-xl bg-transparent px-3 py-3 outline-none"
          onChange={e => update(e.target.value, country)}
          onBlur={() => {
            setTouched(true)
            const parsed = parsePhoneNumberFromString(value)
            if (parsed?.isValid()) setDisplay(parsed.formatInternational().replace(/^\+\d+\s*/, ''))
          }} />
      </div>
      {invalid && <p id={`${id}-error`} className="mt-2 text-sm text-[var(--color-danger)]">{inputError || 'Enter a valid phone number for the selected country.'}</p>}
    </div>
  )
}
