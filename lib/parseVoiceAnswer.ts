export type VoiceAnswerResult = {
  transcript: string
  intent: 'yes' | 'no' | 'unknown'
}

/** Interpret explicit answers only; symptom descriptions alone are ambiguous. */
export function parseVoiceAnswer(transcript: string): VoiceAnswerResult {
  const text = transcript.toLowerCase().replace(/[’']/g, "'").replace(/[^\p{L}\p{N}'\s]/gu, ' ').replace(/\s+/g, ' ').trim()
  const result = (intent: VoiceAnswerResult['intent']): VoiceAnswerResult => ({ transcript, intent })
  if (!text || /\b(maybe|perhaps|unsure|uncertain|sometimes|probably|possibly|sijui|labda|actually|but|however|instead|lakini|ila)\b/.test(text) || /\b(not sure|not certain|don't know|do not know|not really|i guess|yes or no|ndiyo au hapana)\b/.test(text)) return result('unknown')

  const positive = /\b(yes|yeah|yep|ndiyo|ndio|naam)\b/.test(text)
  const negative = /\b(no|nope|hapana|la)\b/.test(text)
  const negated = /\b(not|never|don't|doesn't|didn't|isn't|aren't|wasn't|weren't|can't|cannot|won't|without|si|sina|siko|siyo|hakuna)\b/.test(text) || /\b(?:si[jkvt]\p{L}*|hatu\p{L}*)\b/u.test(text)
  if (positive && (negative || negated)) return result('unknown')
  if (positive && /^(yes|yeah|yep|ndiyo|ndio|naam)\b/.test(text)) return result('yes')
  if (negative && /^(no|nope|hapana|la)\b/.test(text)) return result('no')
  if (/^(i am not|i'm not)(\s|$)/.test(text)) return result('no')
  if (/^(i am|i'm)$/.test(text)) return result('yes')
  return result('unknown')
}
