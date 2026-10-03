interface AnswerButtonsProps {
  selectedAnswer: boolean | null
  onAnswerSelect: (answer: boolean) => void
  language?: 'en' | 'sw'
}

const translations = {
  en: {
    yes: 'Yes',
    no: 'No'
  },
  sw: {
    yes: 'Ndiyo',
    no: 'Hapana'
  }
}

export default function AnswerButtons({ 
  selectedAnswer, 
  onAnswerSelect,
  language = 'en'
}: AnswerButtonsProps) {
  const t = translations[language]

  return (
    <div className="space-y-3">
      <button
        onClick={() => onAnswerSelect(true)}
        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
          selectedAnswer === true
            ? 'border-danger'
            : 'border-border hover:border-opacity-70'
        }`}
        style={{
          backgroundColor: selectedAnswer === true 
            ? 'var(--color-red-light)' 
            : 'var(--color-background)'
        }}
      >
        <div 
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            selectedAnswer === true ? 'border-danger' : ''
          }`}
          style={{
            borderColor: selectedAnswer === true 
              ? 'var(--color-danger)' 
              : 'var(--color-border)',
            backgroundColor: selectedAnswer === true 
              ? 'var(--color-danger)' 
              : 'transparent'
          }}
        >
          {selectedAnswer === true && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
        <span 
          className="font-medium"
          style={{
            color: selectedAnswer === true 
              ? 'var(--color-red-dark)' 
              : 'var(--color-text-primary)'
          }}
        >
          {t.yes}
        </span>
      </button>

      <button
        onClick={() => onAnswerSelect(false)}
        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
          selectedAnswer === false
            ? 'border-primary'
            : 'border-border hover:border-opacity-70'
        }`}
        style={{
          backgroundColor: selectedAnswer === false 
            ? 'var(--color-green-light)' 
            : 'var(--color-background)'
        }}
      >
        <div 
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            selectedAnswer === false ? 'border-primary' : ''
          }`}
          style={{
            borderColor: selectedAnswer === false 
              ? 'var(--color-primary)' 
              : 'var(--color-border)',
            backgroundColor: selectedAnswer === false 
              ? 'var(--color-primary)' 
              : 'transparent'
          }}
        >
          {selectedAnswer === false && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
        <span 
          className="font-medium"
          style={{
            color: selectedAnswer === false 
              ? 'var(--color-green-dark)' 
              : 'var(--color-text-primary)'
          }}
        >
          {t.no}
        </span>
      </button>
    </div>
  )
}
