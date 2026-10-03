import { verificationProxy } from '@/lib/signup-verification'

export async function GET(req: Request) {
  return verificationProxy(req, 'otp-status')
}
