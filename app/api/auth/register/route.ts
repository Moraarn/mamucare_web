import { backendSignup, authenticatedResponse, signupError, validOrigin } from '@/lib/signup-verification'

export async function POST(req: Request) {
  if (!validOrigin(req)) return signupError(403, { message: 'Please return to signup and try again.' })
  try {
    const body = await req.json().catch(() => null)
    if (!body) return signupError(400, { message: 'Please check your signup details.' })
    const { response, data } = await backendSignup('register', body)
    if (!response.ok) return signupError(response.status, data)
    if (!data) return signupError(502)
    return authenticatedResponse(data)
  } catch {
    return signupError()
  }
}
