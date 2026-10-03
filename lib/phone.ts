import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/max'

/** Strict validation at the submission boundary; never submit display formatting. */
export function normalizePhone(value: string, country: CountryCode = 'KE'): string | null {
  if (!value.trim() || !/^\+?[\d\s().-]+$/.test(value.trim()) || value.replace(/\D/g, '').length > 15) return null
  const phone = parsePhoneNumberFromString(value, { defaultCountry: country, extract: false })
  return phone?.isValid() && !phone.ext ? phone.number : null
}
