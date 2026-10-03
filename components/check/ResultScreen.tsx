import { summarizeAlerts, type SmsAlertStatus } from '@/lib/alertStatus'
import { Mic, CheckCircle2, AlertCircle, MapPin, Loader2, MinusCircle } from 'lucide-react'
import RiskResultComponent from './RiskResult'
import HospitalList from './HospitalListDebug'
import Button from '@/components/ui/Button'

type CheckResult = {
  id: string
  userId: string
  answers: boolean[]
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: string[]
  recommendations: string[]
  date: string
  questions: any[]
  riskResults?: any[]
  smsAlertStatus?: SmsAlertStatus
}

interface ResultScreenProps {
  riskResult: CheckResult | null
  user: any
  onBackToHome: () => void
  onCallCHW: () => void
  onCallEmergency: () => void
}

export default function ResultScreen({
  riskResult,
  user,
  onBackToHome,
  onCallCHW,
  onCallEmergency
}: ResultScreenProps) {
  const alerts = summarizeAlerts(riskResult?.smsAlertStatus, user?.chwPhone, user?.emergencyContactPhone)
  return (
    <div className="check-summary">
      {riskResult && (
        <div className="summary-columns">
          <section className="summary-health" aria-label="Checkup result">
          <RiskResultComponent result={{
            riskLevel: riskResult.riskLevel as 'low' | 'medium' | 'high',
            conditionChecked: 'Maternal health symptoms',
            symptomsDetected: riskResult.riskFactors
          }} />

          {/* SMS Alert Status for High Risk */}
          {riskResult.riskLevel === 'high' && (
            <div className="summary-alert-panel" role="status" aria-live="polite">
              <div className="summary-alert-heading" style={{ color: alerts.sending ? 'var(--color-text-secondary)' : alerts.sentCount === 2 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {alerts.sending ? <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                  : alerts.sentCount === 2 ? <CheckCircle2 size={20} aria-hidden="true" /> : <AlertCircle size={20} aria-hidden="true" />}
                <h4>{alerts.title}</h4>
              </div>
              <div className="summary-alert-rows">
                {([
                  ['Health Worker (CHW)', alerts.chw, alerts.chwLabel],
                  ['Emergency Contact', alerts.emergency, alerts.emergencyLabel],
                ] as const).map(([name, status, label]) => (
                  <div key={name} className="summary-alert-row">
                    <span>{name}</span>
                    <span className="summary-alert-state" style={{ color: status === 'sent' ? 'var(--color-success)' : status === 'failed' ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
                      {status === 'sending' ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        : status === 'sent' ? <CheckCircle2 size={14} aria-hidden="true" />
                        : status === 'failed' ? <AlertCircle size={14} aria-hidden="true" /> : <MinusCircle size={14} aria-hidden="true" />}
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          </section>
          <section className="summary-care" aria-label="Care and location">
          <h2 className="summary-section-heading">Nearby care</h2>
          {/* User Location */}
          {user?.location && (
            <div
              className="summary-location"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex items-center gap-3">
                <div style={{ color: 'var(--color-primary)' }}>
                  <MapPin size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-semibold text-sm mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Your location
                  </h4>
                  <p
                    className="text-sm leading-relaxed break-words"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {user.location}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* High Risk: Hospital List */}
          {riskResult.riskLevel === 'high' && (
            <>
              <HospitalList userLocation={user?.location} />
              
              <div>
                <h3 className="text-xs uppercase tracking-wide text-text-secondary font-semibold mb-3">
                  Call your care team
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button
                    onClick={onCallCHW}
                    className="flex items-center justify-center gap-2"
                  >
                    <Mic size={16} />
                    Call CHW
                  </Button>
                  <Button
                    onClick={onCallEmergency}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    style={{
                      color: 'var(--color-danger)',
                      borderColor: 'var(--color-danger)'
                    }}
                  >
                    <Mic size={16} />
                    Emergency: 999
                  </Button>
                </div>
              </div>
            </>
          )}
          </section>
        </div>
      )}

      {/* Back to Home Button */}
      <Button
        onClick={onBackToHome}
        variant="outline"
        fullWidth
      >
        Back to home
      </Button>
    </div>
  )
}
