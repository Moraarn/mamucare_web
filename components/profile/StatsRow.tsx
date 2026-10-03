'use client'

interface StatsRowProps {
  checkupHistory: Array<{ riskLevel: string }>
  user: {
    trimester?: string
  }
}

export default function StatsRow({ checkupHistory, user }: StatsRowProps) {
  return (
    <div className="flex gap-2.5">
      <div
        className="flex-1 rounded-xl p-3 text-center border"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div
          className="text-2xl font-medium mb-1"
          style={{
            fontFamily: 'Fraunces, serif',
            color: 'var(--color-primary)',
            lineHeight: 1
          }}
        >
          {checkupHistory.length}
        </div>
        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          Checkups
        </div>
      </div>
      <div
        className="flex-1 rounded-xl p-3 text-center border"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div
          className="text-2xl font-medium mb-1"
          style={{
            fontFamily: 'Fraunces, serif',
            color: 'var(--color-primary)',
            lineHeight: 1
          }}
        >
          {checkupHistory.filter((c) => c.riskLevel === 'low').length}
        </div>
        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          Low Risk
        </div>
      </div>
      <div
        className="flex-1 rounded-xl p-3 text-center border"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)'
        }}
      >
        <div
          className="text-2xl font-medium mb-1"
          style={{
            fontFamily: 'Fraunces, serif',
            color: 'var(--color-primary)',
            lineHeight: 1
          }}
        >
          {user.trimester === 'first' ? '1st'
            : user.trimester === 'second' ? '2nd'
            : user.trimester === 'third' ? '3rd'
            : user.trimester === 'term' ? 'Term'
            : '—'}
        </div>
        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          Trimester
        </div>
      </div>
    </div>
  )
}
