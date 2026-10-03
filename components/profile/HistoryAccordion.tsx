'use client'

import { useState } from 'react'
import { Activity, Clock, ChevronRight, ChevronDown } from 'lucide-react'

interface HistoryAccordionProps {
  checkupHistory: Array<{ date: string; riskLevel: string }>
}

const riskStyle = (level: string) => {
  if (level === 'high')   return { bg: 'var(--color-red-light)', color: 'var(--color-danger)', dot: 'var(--color-danger)' }
  if (level === 'medium') return { bg: 'var(--color-amber-light)', color: 'var(--color-warning)', dot: 'var(--color-warning)' }
  return                         { bg: 'var(--color-green-light)', color: 'var(--color-success)', dot: 'var(--color-success)' }
}

function Accordion({
  icon, title, badge, children, defaultOpen = false
}: {
  icon: React.ReactNode
  title: string
  badge?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`accordion-card ${open ? 'open' : ''}`}>
      <button aria-expanded={open} className="accordion-trigger" onClick={() => setOpen((o: boolean) => !o)}>
        <div className="accordion-trigger-left">
          <div className="accordion-icon">{icon}</div>
          <span className="accordion-title">{title}</span>
          {badge && badge}
        </div>
        <ChevronDown
          size={15}
          className="accordion-chevron"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <div className="accordion-body" hidden={!open}>
        <div className="accordion-inner">{children}</div>
      </div>
    </div>
  )
}

export default function HistoryAccordion({ checkupHistory }: HistoryAccordionProps) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <style>{`

        .accordion-card {
          font-family: var(--font-body);
          background: var(--color-background);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid var(--color-border);
          box-shadow: 0 4px 18px rgb(var(--color-shadow) / 0.08);
          transition: box-shadow 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        [data-theme="dark"] .accordion-card {
          background: var(--color-surface);
          border-color: var(--color-border);
          box-shadow: 0 4px 18px rgb(var(--color-shadow) / 0.08);
        }
        .accordion-card.open {
          box-shadow: 0 4px 18px rgb(var(--color-shadow) / 0.08);
        }

        .accordion-trigger {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 14px;
          background: none; border: none; cursor: pointer; text-align: left;
          transition: background 0.15s;
        }
        .accordion-trigger:hover { background: rgba(0,0,0,0.02); }
        [data-theme="dark"] .accordion-trigger:hover { background: rgba(255,255,255,0.03); }

        .accordion-trigger-left { display: flex; align-items: center; gap: 10px; }

        .accordion-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: var(--color-primary);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 18px rgb(var(--color-shadow) / 0.08);
        }

        .accordion-title {
          font-size: 0.845rem; font-weight: 600;
          color: var(--color-text-primary); letter-spacing: -0.01em;
        }

        .accordion-badge {
          padding: 2px 8px; border-radius: 999px;
          font-size: 0.63rem; font-weight: 700;
          background: var(--color-surface); color: var(--color-text-secondary);
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        .accordion-chevron {
          color: var(--color-text-secondary);
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
          flex-shrink: 0; opacity: 0.5;
        }

        .accordion-body {
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .accordion-inner { padding: 0 14px 14px; }

        /* History items */
        .h-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 9px 11px;
          border-radius: 12px; margin-bottom: 6px;
          background: rgba(0,0,0,0.02);
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: background 0.15s, transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s;
        }
        [data-theme="dark"] .h-item { background: rgba(255,255,255,0.03); }
        .h-item:last-child { margin-bottom: 0; }
        .h-item:hover {
          background: rgba(0,0,0,0.04);
          transform: translateX(3px);
          box-shadow: 0 4px 18px rgb(var(--color-shadow) / 0.08);
        }

        .h-item-left { display: flex; align-items: center; gap: 10px; }

        .h-dot-wrap {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .h-date {
          font-size: 0.82rem; font-weight: 600;
          color: var(--color-text-primary); letter-spacing: -0.01em;
          line-height: 1.2;
        }
        .h-time {
          font-size: 0.7rem; color: var(--color-text-secondary);
          margin-top: 2px; opacity: 0.65;
        }

        .risk-chip {
          display: flex; align-items: center; gap: 5px;
          padding: 4px 9px; border-radius: 999px;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .risk-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* Empty state */
        .h-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 1.5rem 0; gap: 8px;
        }
        .h-empty-icon {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(0,0,0,0.03); border: 1px solid var(--color-border);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2px;
        }
        .h-empty-title {
          font-size: 0.82rem; font-weight: 600;
          color: var(--color-text-secondary);
        }
        .h-empty-sub {
          font-size: 0.72rem; color: var(--color-text-secondary); opacity: 0.6;
        }
      `}</style>

      <Accordion
        icon={<Activity size={15} color="white" strokeWidth={2.2} />}
        title="Checkup History"
        badge={
          checkupHistory.length > 0
            ? <span className="accordion-badge">{checkupHistory.length}</span>
            : undefined
        }
        defaultOpen={true}
      >
        {checkupHistory.length > 0 ? (
          checkupHistory.map((c, i) => {
            const cs = riskStyle(c.riskLevel)
            return (
              <div className="h-item" key={i}>
                <div className="h-item-left">
                  <div className="h-dot-wrap" style={{ background: cs.bg }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: cs.dot }} />
                  </div>
                  <div>
                    <div className="h-date">{fmtDate(c.date)}</div>
                    <div className="h-time">{fmtTime(c.date)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div className="risk-chip" style={{ background: cs.bg, color: cs.color }}>
                    <div className="risk-dot" style={{ background: cs.dot }} />
                    {c.riskLevel}
                  </div>
                  <ChevronRight size={12} color="var(--color-text-secondary)" strokeWidth={2.5} style={{ opacity: 0.4 }} />
                </div>
              </div>
            )
          })
        ) : (
          <div className="h-empty">
            <div className="h-empty-icon">
              <Clock size={16} color="var(--color-text-secondary)" strokeWidth={2} />
            </div>
            <div className="h-empty-title">No checkups yet</div>
            <div className="h-empty-sub">Your history will appear here</div>
          </div>
        )}
      </Accordion>
    </>
  )
}