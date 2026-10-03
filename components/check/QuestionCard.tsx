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

export default function QuestionCard({ question, questionNumber, totalQuestions, language = 'en' }: QuestionCardProps) {
  const displayText = language === 'sw' && question.text_sw ? question.text_sw : question.text
  const displayHint = language === 'sw' && question.hint_sw ? question.hint_sw : question.hint

  return (
    <div 
      className="rounded-2xl p-4 space-y-3"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-2">
        <span 
          className="text-xs uppercase font-medium px-2 py-1 rounded"
          style={{
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-green-light)'
          }}
        >
          {question.tag}
        </span>
      </div>
      
      <h3 
        className="text-lg font-semibold leading-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {displayText}
      </h3>
      
      <p 
        className="text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {displayHint}
      </p>
    </div>
  )
}
