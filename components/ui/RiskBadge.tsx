import { RiskLevel } from '@/store/useStore'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface RiskBadgeProps {
  riskLevel: RiskLevel
  lastCheckDate?: string
  className?: string
}

export default function RiskBadge({ riskLevel, lastCheckDate, className = '' }: RiskBadgeProps) {
  const getRiskConfig = (level: RiskLevel) => {
    switch (level) {
      case 'low':
        return {
          bgClass: 'bg-green-light',
          textClass: 'text-green-dark',
          icon: CheckCircle,
          title: 'No risk detected',
          subtitle: lastCheckDate ? `Last check: ${lastCheckDate}` : 'Check completed'
        }
      case 'medium':
        return {
          bgClass: 'bg-amber-light',
          textClass: 'text-amber-dark',
          icon: AlertCircle,
          title: 'Monitor your symptoms',
          subtitle: 'Visit clinic within 48hrs'
        }
      case 'high':
        return {
          bgClass: 'bg-red-light',
          textClass: 'text-red-dark',
          icon: AlertTriangle,
          title: 'Seek care now',
          subtitle: 'High risk detected today'
        }
    }
  }

  const config = getRiskConfig(riskLevel)
  const Icon = config.icon

  return (
    <div className={`w-full p-4 rounded-2xl ${config.bgClass} ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${config.textClass}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${config.textClass}`}>
            {config.title}
          </h3>
          <p className={`text-sm ${config.textClass} opacity-80`}>
            {config.subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}
