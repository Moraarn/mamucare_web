import { verificationProxy } from '@/lib/signup-verification'

export async function POST(req: Request) {
  return verificationProxy(req, 'resend-otp')
}
