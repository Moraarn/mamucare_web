import { RiskResult } from '@/lib/riskEngine'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface RiskResultProps {
  result: RiskResult
}

export default function RiskResultComponent({ result }: RiskResultProps) {
  const getResultConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return {
          bgVar: 'var(--color-green-light)',
          textVar: 'var(--color-green-dark)',
          icon: CheckCircle,
          title: 'You are safe for now',
          subtitle: 'No danger signs detected. Check again in 3 days.'
        }
      case 'medium':
        return {
          bgVar: 'var(--color-amber-light)',
          textVar: 'var(--color-amber-dark)',
          icon: AlertCircle,
          title: 'Visit a clinic soon',
          subtitle: 'You may be at risk. Please visit a clinic within 24–48 hours.'
        }
      case 'high':
        return {
          bgVar: 'var(--color-red-light)',
          textVar: 'var(--color-red-dark)',
          icon: AlertTriangle,
          title: 'Urgent — seek care now',
          subtitle: 'Possible complication detected. Go to your nearest clinic immediately. Your health worker has been notified.'
        }
      default:
        return {
          bgVar: 'var(--color-green-light)',
          textVar: 'var(--color-green-dark)',
          icon: CheckCircle,
          title: 'You are safe for now',
          subtitle: 'No danger signs detected. Check again in 3 days.'
        }
    }
  }

  const config = getResultConfig(result.riskLevel)
  const Icon = config.icon

  return (
    <div className="space-y-4">
      {/* Result Hero Card */}
      <div 
        className="w-full p-4 rounded-2xl"
        style={{ backgroundColor: config.bgVar }}
      >
        <div className="flex items-start gap-3">
          <div 
            className="p-2 rounded-full"
            style={{ color: config.textVar }}
          >
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <h3 
              className="font-bold text-lg mb-2"
              style={{ color: config.textVar }}
            >
              {config.title}
            </h3>
            <p 
              className="text-sm leading-relaxed opacity-90"
              style={{ color: config.textVar }}
            >
              {config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Symptom Tags */}
      {result.symptomsDetected && result.symptomsDetected.length > 0 && result.riskLevel !== 'low' && (
        <div>
          <h4 
            className="text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Symptoms detected:
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.symptomsDetected.map((symptom, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'var(--color-red-light)',
                  color: 'var(--color-red-dark)'
                }}
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
