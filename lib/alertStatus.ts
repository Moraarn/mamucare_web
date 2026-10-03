export type AlertRecipientStatus = 'sending' | 'sent' | 'failed' | 'not_configured'
export interface SmsAlertStatus {
  chw?: { status: AlertRecipientStatus; messageSid?: string; error?: string }
  emergency?: { status: AlertRecipientStatus; messageSid?: string; error?: string }
  chwSent?: boolean
  emergencySent?: boolean
}
export function summarizeAlerts(status?: SmsAlertStatus, chwPhone?: string, emergencyPhone?: string) {
  const chw = status?.chw?.status ?? (status?.chwSent ? 'sent' : chwPhone?.trim() ? 'failed' : 'not_configured')
  const emergency = status?.emergency?.status ?? (status?.emergencySent ? 'sent' : emergencyPhone?.trim() ? 'failed' : 'not_configured')
  const labels = { sending: 'Sending', sent: 'Sent', failed: 'Failed', not_configured: 'Not configured' }
  const sending = chw === 'sending' || emergency === 'sending'
  const sentCount = Number(chw === 'sent') + Number(emergency === 'sent')
  const title = sending ? 'Sending alerts...' : sentCount === 2 ? 'Alerts sent to your care team'
    : sentCount === 1 ? 'Some alerts could not be sent' : 'Alerts could not be sent'
  return { chw, emergency, chwLabel: labels[chw], emergencyLabel: labels[emergency], title, sentCount, sending }
}
