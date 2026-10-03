type Question = {
  id: string
  text: string
  text_sw?: string
  swahiliText?: string
  category?: string
  tag?: string
  hint?: string
  hint_sw?: string
  userStatus?: string
}

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  language?: 'en' | 'sw'
}

export default function QuestionCard({ question, language = 'en' }: QuestionCardProps) {
  const displayText = language === 'sw' && question.text_sw ? question.text_sw : question.text
  const displayHint = language === 'sw' && question.hint_sw ? question.hint_sw : question.hint

  return (
    <div className="space-y-5 text-center">
      <h1 id="check-question-text" className="text-3xl font-normal leading-snug tracking-tight text-text-primary sm:text-4xl">
        {displayText}
      </h1>
      <p id="check-question-hint" className="mx-auto max-w-lg text-base leading-relaxed text-text-secondary">
        {displayHint}
      </p>
    </div>
  )
}
