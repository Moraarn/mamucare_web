interface QuestionProgressProps {
  currentQuestionIndex: number
  totalQuestions: number
  showResult: boolean
}

export default function QuestionProgress({ 
  currentQuestionIndex, 
  totalQuestions, 
  showResult 
}: QuestionProgressProps) {
  if (showResult) return null

  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <div 
      className="h-1"
      style={{ backgroundColor: 'var(--color-border)' }}
    >
      <div 
        className="h-full transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          backgroundColor: 'var(--color-primary)'
        }}
      />
    </div>
  )
}
