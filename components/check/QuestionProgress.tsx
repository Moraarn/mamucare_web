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
      role="progressbar"
      aria-label="Checkup progress"
      aria-valuemin={0}
      aria-valuemax={totalQuestions}
      aria-valuenow={currentQuestionIndex + 1}
      className="h-1.5 rounded-full overflow-hidden"
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
