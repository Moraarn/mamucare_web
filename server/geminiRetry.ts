import 'server-only'

// Only retry transient service failures, never invalid credentials or requests.
export async function withGeminiRetry<T>(
  request: () => Promise<T>,
  wait: (milliseconds: number) => Promise<void> = milliseconds =>
    new Promise(resolve => setTimeout(resolve, milliseconds)),
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request()
    } catch (error) {
      const status = typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status) : undefined
      if (attempt >= 2 || ![500, 502, 503, 504].includes(status ?? 0)) throw error
      const delay = 1000 * 2 ** attempt + Math.floor(Math.random() * 250)
      console.warn('Retrying temporarily unavailable Gemini request:', { status, attempt: attempt + 1 })
      await wait(delay)
    }
  }
}
