import { useId } from 'react'
import { Check } from 'lucide-react'

interface AnswerButtonsProps {
  selectedAnswer: boolean | null
  onAnswerSelect: (answer: boolean) => void
  language?: 'en' | 'sw'
}

const translations = {
  en: { yes: 'Yes', no: 'No', answer: 'Choose your answer' },
  sw: { yes: 'Ndiyo', no: 'Hapana', answer: 'Chagua jibu lako' },
}

export default function AnswerButtons({ selectedAnswer, onAnswerSelect, language = 'en' }: AnswerButtonsProps) {
  const name = useId()
  const t = translations[language]

  return (
    <fieldset aria-describedby="check-question-text check-question-hint">
      <legend className="sr-only">{t.answer}</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[{ value: true, label: t.yes }, { value: false, label: t.no }].map(({ value, label }) => (
          <label key={String(value)} className="relative block cursor-pointer">
            <input type="radio" name={name} value={String(value)} checked={selectedAnswer === value}
              onChange={() => onAnswerSelect(value)} className="peer sr-only" />
            <span className="flex min-h-24 items-center justify-center gap-3 rounded-xl border-2 border-border bg-background px-6 py-5 text-xl font-medium text-text-primary transition-colors hover:border-primary peer-checked:border-primary peer-checked:bg-surface-soft peer-checked:text-primary peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary sm:min-h-28">
              <span>{label}</span>
              <Check size={20} aria-hidden="true" className={selectedAnswer === value ? 'shrink-0' : 'invisible shrink-0'} />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
