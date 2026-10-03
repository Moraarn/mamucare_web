'use client'

import { Calendar } from 'lucide-react'

interface CheckupCardProps {
  lastCheckup: {
    date: string
    riskLevel: string
  }
}

const riskStyle = (level: string) => {
  if (level === 'high')   return { bg: 'var(--color-red-light)', color: 'var(--color-danger)', dot: '#EF4444' }
  if (level === 'medium') return { bg: 'var(--color-amber-light)', color: 'var(--color-warning)', dot: '#F59E0B' }
  return                         { bg: 'var(--color-green-light)', color: '#16A34A', dot: '#22C55E' }
}

export default function CheckupCard({ lastCheckup }: CheckupCardProps) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const lc = riskStyle(lastCheckup.riskLevel)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .checkup-float {
          margin: -1.75rem 1.25rem 0;
          position: relative;
          z-index: 10;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 18px;
          padding: 1rem 1.1rem;
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 12px 28px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'DM Sans', sans-serif;
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }

        [data-theme="dark"] .checkup-float {
          background: rgba(30, 32, 40, 0.88);
          border-color: rgba(255, 255, 255, 0.06);
          box-shadow:
            0 4px 6px rgba(0,0,0,0.2),
            0 12px 28px rgba(0,0,0,0.35);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .cfl {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .cfl-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: linear-gradient(140deg, var(--color-primary), var(--color-primary-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(0,0,0,0.15);
        }

        .cf-eyebrow {
          font-size: 0.62rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-bottom: 2px;
          opacity: 0.7;
        }

        .cf-date {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .cf-time {
          font-size: 0.72rem;
          font-weight: 400;
          color: var(--color-text-secondary);
          margin-top: 2px;
          opacity: 0.65;
        }

        .risk-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 0.67rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: opacity 0.2s;
        }

        .risk-chip:hover {
          opacity: 0.85;
        }

        .risk-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>

      <div className="checkup-float">
        <div className="cfl">
          <div className="cfl-icon">
            <Calendar size={16} color="white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="cf-eyebrow">Last Checkup</div>
            <div className="cf-date">{fmtDate(lastCheckup.date)}</div>
            <div className="cf-time">{fmtTime(lastCheckup.date)}</div>
          </div>
        </div>
        <div className="risk-chip" style={{ background: lc.bg, color: lc.color }}>
          <div className="risk-dot" style={{ background: lc.dot }} />
          {lastCheckup.riskLevel} Risk
        </div>
      </div>
    </>
  )
}