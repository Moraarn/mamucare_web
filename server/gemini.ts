import 'server-only'
import { GoogleGenAI } from '@google/genai'

interface ConversationContext {
  state: string
  userMessage: string
  symptomDetected: boolean
  riskLevel?: 'low' | 'medium' | 'high'
  language: 'en' | 'sw'
  previousMessages?: string[]
}

interface AIResponse {
  message: string
  language: 'en' | 'sw'
}

export async function generateAIResponse(context: ConversationContext): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('AI service is not configured')
  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: getUserPrompt(context),
      config: {
        systemInstruction: getSystemPrompt(context),
        // Allow room for reasoning tokens as well as the concise reply.
        maxOutputTokens: 2048,
        temperature: 0.7,
        // Use the model's default: supported thinking settings vary by model.
      },
    })
    const message = response.text?.trim()
    if (!message) throw new Error('Empty AI response')
    return { message, language: context.language }
  } catch (error) {
    console.error('Gemini provider error:', error)
    // Never return provider diagnostics or credentials to the browser.
    throw new Error('Unable to get an AI response. Please try again.')
  }
}

function getSystemPrompt(context: ConversationContext): string {
  const basePrompt = `You are a compassionate maternal health assistant for pregnant and postpartum mothers using a mobile health app in East Africa. You speak both English and Swahili naturally.

Keep every response focused on the mother's own health and wellbeing during pregnancy and after childbirth: her symptoms, recovery, emotional wellbeing, nutrition, rest, and breast health, including breastfeeding concerns that affect her.
Do not introduce baby or infant care, ask about the baby's wellbeing, or offer support for "your little one" or "mtoto wako" in greetings. If asked about a baby's health or care, briefly explain that your focus is the mother's health and suggest a qualified child healthcare professional for the baby's concern. Then gently ask about the mother's own needs. Apply this scope in both English and Swahili, even when earlier conversation messages mention babies.

Your role is to:
1. Be empathetic and caring
2. Ask relevant follow-up questions about symptoms
3. Assess risk levels appropriately
4. Provide clear health guidance
5. Know when to recommend emergency care
6. Use natural, conversational language
7. Match the user's language (English or Swahili)

Current conversation state: ${context.state}
Language: ${context.language}
Risk level: ${context.riskLevel || 'unknown'}

IMPORTANT: Always respond in the same language as the user. Keep responses concise and natural.`

  if (context.symptomDetected) {
    return basePrompt + `\n\nThe user has mentioned health symptoms. Focus on understanding the details (when it started, severity, location) while being caring and professional.`
  }

  return basePrompt
}

function getUserPrompt(context: ConversationContext): string {
  const { state, userMessage, language, previousMessages } = context

  let prompt = `User said: "${userMessage}"\n\n`
  
  prompt += `Current conversation state: ${state}\n`
  
  if (previousMessages && previousMessages.length > 0) {
    prompt += `Recent conversation:\n${previousMessages.slice(-2).join('\n')}\n`
  }

  if (state === 'greeting') {
    prompt += language === 'sw' 
      ? 'Respond with a warm greeting in Swahili and ask how they are feeling today.'
      : 'Respond with a warm greeting in English and ask how they are feeling today.'
  } else if (state === 'general' && !context.symptomDetected) {
    prompt += language === 'sw'
      ? 'Respond naturally and gently guide the conversation toward health topics if appropriate.'
      : 'Respond naturally and gently guide the conversation toward health topics if appropriate.'
  } else if (state === 'collecting_symptoms') {
    prompt += language === 'sw'
      ? 'Show empathy and ask for more details about their symptoms (when it started, what it feels like, severity).'
      : 'Show empathy and ask for more details about their symptoms (when it started, what it feels like, severity).'
  } else if (state === 'follow_up') {
    prompt += language === 'sw'
      ? 'Ask follow-up questions to better understand their condition and assess risk level.'
      : 'Ask follow-up questions to better understand their condition and assess risk level.'
  } else if (state === 'risk_assessment') {
    prompt += language === 'sw'
      ? 'Provide appropriate health guidance based on their symptoms and risk level.'
      : 'Provide appropriate health guidance based on their symptoms and risk level.'
  } else if (state === 'advice') {
    prompt += language === 'sw'
      ? 'Give clear advice and suggest next steps (see doctor, continue monitoring, etc.).'
      : 'Give clear advice and suggest next steps (see doctor, continue monitoring, etc.).'
  } else if (state === 'emergency') {
    prompt += language === 'sw'
      ? 'URGENT: Tell them to seek immediate medical attention. Be direct and clear.'
      : 'URGENT: Tell them to seek immediate medical attention. Be direct and clear.'
  }

  return prompt
}

