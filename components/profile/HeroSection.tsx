'use client'

import { Phone, Baby, Heart, Sparkles, Flower2 } from 'lucide-react'

interface HeroSectionProps {
  user: {
    fullName: string
    phone: string
    status: string
    trimester?: string
  }
}

const statusMap: Record<string, { icon: React.ReactNode; label: string }> = {
  pregnant:         { icon: <Heart size={13} strokeWidth={2.2} color="white" />,   label: 'Pregnant' },
  postpartum_early: { icon: <Baby size={13} strokeWidth={2.2} color="white" />,    label: 'New Mama · 0–6 weeks' },
  postpartum_late:  { icon: <Flower2 size={13} strokeWidth={2.2} color="white" />, label: 'Recovering · 6–12 weeks' },
}

const trimesterMap: Record<string, string> = {
  first:  '1st Trimester · Weeks 1–12',
  second: '2nd Trimester · Weeks 13–26',
  third:  '3rd Trimester · Weeks 27–36',
  term:   'Term · 37+ Weeks',
}

export default function HeroSection({ user }: HeroSectionProps) {
  const statusInfo = statusMap[user.status] ?? { icon: <Sparkles size={13} strokeWidth={2.2} color="white" />, label: 'Welcome' }
  const initials = user.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,400;0,500;1,400&display=swap');

        .hero {
          position: relative;
          background: linear-gradient(150deg, var(--color-primary) 0%, var(--color-primary-dark) 55%, var(--color-primary-light) 100%);
          padding: 1.75rem 1.5rem 4rem;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        .hero-orb1 {
          position: absolute; top: -70px; right: -50px;
          width: 240px; height: 240px; border-radius: 50%;
          background: radial-gradient(circle, rgba(249,168,212,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-orb2 {
          position: absolute; bottom: -60px; left: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(147,197,253,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .hero-content { position: relative; z-index: 1; }

        /* Avatar */
        .avatar-wrap {
          position: relative;
          width: 68px; height: 68px;
          flex-shrink: 0;
          animation: pulseRing 3s ease-in-out infinite;
          border-radius: 50%;
        }

        @keyframes pulseRing {
          0%,100% { box-shadow: 0 0 0 0 rgba(249,168,212,0.45); }
          50%      { box-shadow: 0 0 0 8px rgba(249,168,212,0); }
        }

        .avatar-ring {
          width: 68px; height: 68px; border-radius: 50%;
          background: linear-gradient(135deg, #f9a8d4 0%, #93c5fd 50%, #86efac 100%);
          padding: 2px;
        }

        .avatar-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: var(--color-primary);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif;
          font-size: 1.3rem; font-weight: 500;
          color: white;
          letter-spacing: -0.02em;
        }

        .online-dot {
          position: absolute; bottom: 2px; right: 2px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #4ade80;
          border: 2px solid var(--color-primary);
          box-shadow: 0 0 6px rgba(74,222,128,0.6);
        }

        /* Name & phone */
        .hero-name {
          font-family: 'Fraunces', serif;
          font-size: 1.4rem; font-weight: 500;
          color: white; line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .hero-phone {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.74rem; color: rgba(255,255,255,0.42);
          letter-spacing: 0.03em; margin-top: 3px;
        }

        /* Status pill */
        .status-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 999px;
          padding: 5px 12px 5px 8px;
          margin-top: 1rem;
        }

        .status-pill-icon {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .status-pill-text {
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.01em;
        }

        /* Trimester tag */
        .trimester-tag {
          display: inline-flex; align-items: center; gap: 5px;
          margin-top: 8px;
          font-size: 0.67rem; font-weight: 600;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.09em; text-transform: uppercase;
        }

        .trimester-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          flex-shrink: 0;
        }
      `}</style>

      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="hero-grid" />

        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '0.85rem' }}>
            <div className="avatar-wrap">
              <div className="avatar-ring">
                <div className="avatar-inner">{initials}</div>
              </div>
              <div className="online-dot" />
            </div>
            <div>
              <div className="hero-name">{user.fullName}</div>
              <div className="hero-phone">
                <Phone size={11} strokeWidth={2} color="rgba(255,255,255,0.4)" />
                {user.phone}
              </div>
            </div>
          </div>

          <div className="status-pill">
            <div className="status-pill-icon">{statusInfo.icon}</div>
            <span className="status-pill-text">{statusInfo.label}</span>
          </div>

          {user.trimester && (
            <div className="trimester-tag">
              <div className="trimester-dot" />
              {trimesterMap[user.trimester] ?? ''}
            </div>
          )}
        </div>
      </div>
    </>
  )
}