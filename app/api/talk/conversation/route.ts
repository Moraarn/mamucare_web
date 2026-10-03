import { NextResponse } from 'next/server'
import { getServerToken } from '@/lib/auth'
import { generateAIResponse } from '@/server/gemini'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!(await getServerToken())) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  const context = await req.json().catch(() => null)
  if (!context || typeof context.userMessage !== 'string' || !context.userMessage.trim() ||
      typeof context.state !== 'string' || typeof context.symptomDetected !== 'boolean' ||
      !['en', 'sw'].includes(context.language) ||
      (context.previousMessages !== undefined && (!Array.isArray(context.previousMessages) ||
        !context.previousMessages.every((message: unknown) => typeof message === 'string')))) {
    return NextResponse.json({ message: 'Please provide a valid message.' }, { status: 400 })
  }
  try {
    return NextResponse.json(await generateAIResponse(context), { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ message: 'Unable to get an AI response. Please try again.' }, { status: 503 })
  }
}
