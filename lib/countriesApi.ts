export interface Country {
  code: string
  dial: string
  name: string
}

// Small fallback in case the public API is unavailable or blocked
const FALLBACK_COUNTRIES: Country[] = [
  { code: 'KE', dial: '+254', name: 'Kenya' },
  { code: 'UG', dial: '+256', name: 'Uganda' },
  { code: 'TZ', dial: '+255', name: 'Tanzania' },
  { code: 'US', dial: '+1', name: 'United States' },
  { code: 'GB', dial: '+44', name: 'United Kingdom' },
]

let countriesCache: Country[] | null = null

export async function fetchCountries(): Promise<Country[]> {
  if (countriesCache) return countriesCache

  // Request only the fields we need to keep payload small and reduce chance of errors
  const url = 'https://restcountries.com/v3.1/all?fields=cca2,idd,name'

  try {
    const res = await fetch(url)
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`restcountries returned ${res.status}: ${text}`)
    }

    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('Unexpected response shape from restcountries')

    countriesCache = data
      .map((c: any) => {
        const code = c.cca2
        let dial = ''
        if (c.idd?.root) {
          const suffix = Array.isArray(c.idd.suffixes) && c.idd.suffixes.length > 0 ? c.idd.suffixes[0] : ''
          dial = `${c.idd.root}${suffix}`
        }
        const name = c.name?.common || c.name?.official || ''
        return { code, dial, name }
      })
      .filter((c: Country) => c.code && c.name && c.dial)
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name))

    if (!countriesCache || countriesCache.length === 0) throw new Error('No usable countries from API')

    return countriesCache
  } catch (err) {
    console.error('Failed to fetch countries, falling back to local list:', err)
    countriesCache = FALLBACK_COUNTRIES
    return countriesCache
  }
}
