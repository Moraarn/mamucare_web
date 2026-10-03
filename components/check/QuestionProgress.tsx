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
    <div className="space-y-3">
      <p className="text-center text-sm font-medium text-text-secondary" aria-live="polite" aria-atomic="true">
        Question {currentQuestionIndex + 1} of {totalQuestions}
      </p>
      <div role="progressbar" aria-label="Checkup progress" aria-valuemin={0}
        aria-valuemax={totalQuestions} aria-valuenow={currentQuestionIndex + 1}
        className="h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
