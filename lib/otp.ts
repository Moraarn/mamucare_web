// otp.ts
import africastalking from 'africastalking'
import twilio from 'twilio'

// In-memory store (Use Redis or MongoDB in production)
interface OtpRecord {
  otp: string
  expiresAt: Date
  attempts: number
  phoneNumber: string
}

const otpStore = new Map<string, OtpRecord>()

// Initialize SMS Clients
const atClient = africastalking({
  username: process.env.AT_USERNAME || 'sandbox',
  apiKey: process.env.AT_API_KEY || '',
})

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
  try {
    // Rate limiting: max 1 OTP per 60 seconds
    const existing = otpStore.get(phoneNumber)
    if (existing) {
      const timeSinceLastOtp = Date.now() - (existing.expiresAt.getTime() - 5 * 60 * 1000)
      if (timeSinceLastOtp < 60000) {
        return { success: false, message: 'Please wait 60 seconds before requesting another OTP' }
      }
    }

    const otp = generateOtp()
    const expiryMinutes = 5
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

    // Store OTP
    otpStore.set(phoneNumber, {
      otp,
      expiresAt,
      attempts: 0,
      phoneNumber,
    })

    const messageBody = `Your MamuCare verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code with anyone.`
    const provider = process.env.SMS_PROVIDER || 'africastalking'

    if (provider === 'africastalking') {
      const sms = atClient.SMS
      await sms.send({
        to: [phoneNumber],
        message: messageBody,
        from: process.env.AT_SENDER_ID || 'MamuCare',
      })
    } else if (provider === 'twilio') {
      await twilioClient.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      })
    } else {
      throw new Error(`Unsupported SMS provider: ${provider}`)
    }

    return { success: true, message: 'OTP sent successfully' }
  } catch (error: any) {
    console.error('Failed to send OTP:', error)
    return { success: false, message: error.message || 'Failed to send OTP. Please try again.' }
  }
}

export function verifyOtp(phoneNumber: string, otp: string): { success: boolean; message: string } {
  const record = otpStore.get(phoneNumber)

  if (!record) {
    return { success: false, message: 'No OTP found. Please request a new one.' }
  }

  if (record.attempts >= 3) {
    otpStore.delete(phoneNumber)
    return { success: false, message: 'Too many failed attempts. Please request a new OTP.' }
  }

  if (new Date() > record.expiresAt) {
    otpStore.delete(phoneNumber)
    return { success: false, message: 'OTP has expired. Please request a new one.' }
  }

  if (record.otp !== otp) {
    record.attempts++
    const remaining = 3 - record.attempts
    return { success: false, message: `Invalid OTP. ${remaining} attempts remaining.` }
  }

  // Success - clean up
  otpStore.delete(phoneNumber)
  return { success: true, message: 'Phone verified successfully' }
}