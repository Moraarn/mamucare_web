const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined')
}

const joinUrl = (base: string, path: string) => {
  const cleanBase = base.replace(/\/$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `${cleanBase}${cleanPath}`
}

const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = joinUrl(API_URL, endpoint)

  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 REQUEST START: ${endpoint}`)
    console.log(`🌍 REQUEST URL: ${url}`)

    if (options.body) {
      try {
        console.log('📤 PAYLOAD:', JSON.parse(String(options.body)))
      } catch {
        console.log('📤 RAW PAYLOAD:', options.body)
      }
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(`📥 RESPONSE STATUS: ${response.status}`)
    }

    const text = await response.text()
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 RAW RESPONSE:', text)
    }

    let json: any = {}

    try {
      json = text ? JSON.parse(text) : {}
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ PARSED RESPONSE:', json)
      }
    } catch (parseError) {
      console.error('❌ JSON PARSE ERROR:', parseError)
      throw new Error('Server returned invalid JSON')
    }

    if (!response.ok) {
      // Extract the error message from the backend response
      // NestJS returns errors in different formats depending on the exception type
      const errorMessage = json?.message || json?.error || json?.message?.[0] || `HTTP ${response.status}`
      throw new Error(errorMessage)
    }

    return json
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ REQUEST FAILED: ${endpoint}`, error)
    }
    
    // Re-throw the error as-is if it's already an Error with a message
    if (error instanceof Error) {
      throw error
    }
    
    // Otherwise wrap it in a generic error
    throw new Error('An unexpected error occurred')
  }
}

export const clientApi = {
  get: (endpoint: string) => request(endpoint, { method: 'GET' }),

  post: (endpoint: string, data?: unknown) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data?: unknown) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
}