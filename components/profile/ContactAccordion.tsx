'use client'

import { useState } from 'react'
import { Phone, MapPin, Baby, Shield, ChevronDown } from 'lucide-react'

interface ContactAccordionProps {
  user: {
    phone: string
    location?: string
    chwName?: string
    chwPhone?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
  }
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

export default function ContactAccordion({ user }: ContactAccordionProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .accordion-card {
          font-family: 'DM Sans', sans-serif;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 8px 20px rgba(0,0,0,0.06);
          transition: box-shadow 0.25s cubic-bezier(0.22,1,0.36,1);
        }

        [data-theme="dark"] .accordion-card {
          background: rgba(30, 32, 40, 0.88);
          border-color: rgba(255, 255, 255, 0.06);
          box-shadow:
            0 4px 6px rgba(0,0,0,0.2),
            0 8px 20px rgba(0,0,0,0.3);
        }

        .accordion-card.open {
          box-shadow:
            0 4px 8px rgba(0,0,0,0.06),
            0 16px 32px rgba(0,0,0,0.1);
        }

        .accordion-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 14px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }

        .accordion-trigger:hover {
          background: rgba(0,0,0,0.02);
        }

        [data-theme="dark"] .accordion-trigger:hover {
          background: rgba(255,255,255,0.03);
        }

        .accordion-trigger-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .accordion-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(140deg, var(--color-primary), var(--color-primary-dark));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        }

        .accordion-title {
          font-size: 0.845rem;
          font-weight: 600;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
        }

        .accordion-badge {
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 0.63rem;
          font-weight: 700;
          background: var(--color-surface);
          color: var(--color-text-secondary);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .accordion-chevron {
          color: var(--color-text-secondary);
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
          flex-shrink: 0;
          opacity: 0.5;
        }

        .accordion-body {
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.22,1,0.36,1);
        }

        .accordion-inner {
          padding: 0 14px 14px;
        }

        .info-row {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 9px 0;
          border-bottom: 1px solid var(--color-border);
        }

        .info-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .info-ico {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: rgba(0,0,0,0.03);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        [data-theme="dark"] .info-ico {
          background: rgba(255,255,255,0.04);
          border-color: var(--color-border);
        }

        .info-lbl {
          font-size: 0.62rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 2px;
          opacity: 0.65;
        }

        .info-val {
          font-size: 0.845rem;
          font-weight: 500;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
          line-height: 1.25;
        }

        .info-sub {
          font-size: 0.72rem;
          color: var(--color-text-secondary);
          margin-top: 2px;
          opacity: 0.7;
        }
      `}</style>

      <Accordion
        icon={<Shield size={15} color="white" strokeWidth={2.2} />}
        title="Contact & Care"
        defaultOpen={false}
      >
        <div className="info-row">
          <div className="info-ico"><Phone size={14} color="var(--color-text-secondary)" strokeWidth={2} /></div>
          <div>
            <div className="info-lbl">Phone</div>
            <div className="info-val">{user.phone}</div>
          </div>
        </div>

        <div className="info-row">
          <div className="info-ico"><MapPin size={14} color="var(--color-text-secondary)" strokeWidth={2} /></div>
          <div>
            <div className="info-lbl">Location</div>
            <div className="info-val">{user.location || 'Not set'}</div>
          </div>
        </div>

        {user.chwName && (
          <div className="info-row">
            <div className="info-ico"><Baby size={14} color="var(--color-text-secondary)" strokeWidth={2} /></div>
            <div>
              <div className="info-lbl">Community Health Worker</div>
              <div className="info-val">{user.chwName}</div>
              <div className="info-sub">{user.chwPhone}</div>
            </div>
          </div>
        )}

        {user.emergencyContactName && (
          <div className="info-row">
            <div className="info-ico"><Phone size={14} color="var(--color-danger)" strokeWidth={2} /></div>
            <div>
              <div className="info-lbl">Emergency Contact</div>
              <div className="info-val">{user.emergencyContactName}</div>
              <div className="info-sub">{user.emergencyContactPhone}</div>
            </div>
          </div>
        )}
      </Accordion>
    </>
  )
}