import { Info } from 'lucide-react'

interface MedicalDisclaimerProps {
  compact?: boolean
}

export default function MedicalDisclaimer({ compact = false }: MedicalDisclaimerProps) {
  return (
    <aside className={`medical-disclaimer ${compact ? 'medical-disclaimer-compact' : ''}`}
      aria-label={compact ? 'AI guidance notice' : 'Medical disclaimer'}>
      <Info size={15} aria-hidden="true" />
      <p>{compact
        ? 'AI guidance only — not a diagnosis or substitute for a health worker.'
        : 'MamuCare does not diagnose medical conditions and does not replace a qualified health worker. If you have urgent symptoms, seek professional medical care immediately.'}</p>
    </aside>
  )
}
