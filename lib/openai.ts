// OpenAI integration for natural conversation responses

interface OpenAIResponse {
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

export async function generateConversationResponse(
  context: ConversationContext
): Promise<OpenAIResponse> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key is missing');
    throw new Error('OpenAI API key is required');
  }

  try {
    const systemPrompt = getSystemPrompt(context);
    const userPrompt = getUserPrompt(context);

    console.log('OpenAI API Request:', {
      state: context.state,
      language: context.language,
      userMessage: context.userMessage,
      hasApiKey: !!apiKey
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content;

    if (!aiMessage) {
      console.error('No message in OpenAI response:', data);
      throw new Error('No message received from OpenAI');
    }

    console.log('OpenAI Response:', aiMessage.substring(0, 100));

    return {
      message: aiMessage.trim(),
      language: context.language
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

function getSystemPrompt(context: ConversationContext): string {
  const basePrompt = `You are a compassionate maternal health assistant for a mobile health app in East Africa. You speak both English and Swahili naturally.

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

IMPORTANT: Always respond in the same language as the user. Keep responses concise and natural.`;

  if (context.symptomDetected) {
    return basePrompt + `\n\nThe user has mentioned health symptoms. Focus on understanding the details (when it started, severity, location) while being caring and professional.`;
  }

  return basePrompt;
}

function getUserPrompt(context: ConversationContext): string {
  const { state, userMessage, language, previousMessages } = context;

  let prompt = `User said: "${userMessage}"\n\n`;
  
  prompt += `Current conversation state: ${state}\n`;
  
  if (previousMessages && previousMessages.length > 0) {
    prompt += `Recent conversation:\n${previousMessages.slice(-2).join('\n')}\n`;
  }

  if (state === 'greeting') {
    prompt += language === 'sw' 
      ? 'Respond with a warm greeting in Swahili and ask how they are feeling today.'
      : 'Respond with a warm greeting in English and ask how they are feeling today.';
  } else if (state === 'general' && !context.symptomDetected) {
    prompt += language === 'sw'
      ? 'Respond naturally and gently guide the conversation toward health topics if appropriate.'
      : 'Respond naturally and gently guide the conversation toward health topics if appropriate.';
  } else if (state === 'collecting_symptoms') {
    prompt += language === 'sw'
      ? 'Show empathy and ask for more details about their symptoms (when it started, what it feels like, severity).'
      : 'Show empathy and ask for more details about their symptoms (when it started, what it feels like, severity).';
  } else if (state === 'follow_up') {
    prompt += language === 'sw'
      ? 'Ask follow-up questions to better understand their condition and assess risk level.'
      : 'Ask follow-up questions to better understand their condition and assess risk level.';
  } else if (state === 'risk_assessment') {
    prompt += language === 'sw'
      ? 'Provide appropriate health guidance based on their symptoms and risk level.'
      : 'Provide appropriate health guidance based on their symptoms and risk level.';
  } else if (state === 'advice') {
    prompt += language === 'sw'
      ? 'Give clear advice and suggest next steps (see doctor, continue monitoring, etc.).'
      : 'Give clear advice and suggest next steps (see doctor, continue monitoring, etc.).';
  } else if (state === 'emergency') {
    prompt += language === 'sw'
      ? 'URGENT: Tell them to seek immediate medical attention. Be direct and clear.'
      : 'URGENT: Tell them to seek immediate medical attention. Be direct and clear.';
  }

  return prompt;
}

