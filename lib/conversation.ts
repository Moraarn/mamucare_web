interface AIResponse {
  message: string;
  language: 'en' | 'sw';
}

interface ConversationContext {
  state: string;
  userMessage: string;
  symptomDetected: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  language: 'en' | 'sw';
  previousMessages?: string[];
}

// Browser-safe compatibility helper; the provider SDK and credentials stay on the server.
export async function generateConversationResponse(context: ConversationContext): Promise<AIResponse> {
  const response = await fetch('/api/talk/conversation', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(context),
  })
  if (!response.ok) throw new Error('Unable to get an AI response. Please try again.')
  return response.json()
}
