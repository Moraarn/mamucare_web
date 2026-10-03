'use client'

import { User, Settings, LogOut, Sparkles } from 'lucide-react'

type TranslationKey = 
  | 'profile.startCheckup'
  | 'profile.account'
  | 'profile.editProfile'
  | 'profile.settings'
  | 'profile.signOut'

interface ActionButtonsProps {
  onStartCheckup: () => void
  onEditProfile: () => void
  onSettings: () => void
  onLogout: () => void
  t: (key: TranslationKey) => string
}

export default function ActionButtons({ onStartCheckup, onEditProfile, onSettings, onLogout, t }: ActionButtonsProps) {
  return (
    <>
      <style>{`
        .actions-wrap {
          padding: 1.1rem 1.25rem 2.5rem;
          display: flex; flex-direction: column; gap: 9px;
          animation: fadeUp 0.45s 0.15s ease both;
        }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        
        .btn-cta {
          width: 100%; padding: 14px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          letter-spacing: 0.02em;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 6px 20px rgba(13, 110, 64, 0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(13, 110, 64, 0.38); }
        .btn-cta:active { transform: translateY(0); }

        .btn-row { display: flex; gap: 9px; }
        .btn-sec {
          flex: 1; padding: 12px;
          border-radius: 14px;
          background: white; color: var(--color-text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.83rem; font-weight: 500;
          border: 1.5px solid var(--color-border); cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: background 0.15s, border-color 0.15s;
        }
        [data-theme="dark"] .btn-sec {
          background: var(--color-surface);
          color: var(--color-text-primary);
          border-color: var(--color-border);
        }
        .btn-sec:hover { background: var(--color-surface); border-color: var(--color-primary); }
        [data-theme="dark"] .btn-sec:hover {
          background: var(--color-background);
          border-color: var(--color-primary);
        }

        .btn-logout {
          width: 100%; padding: 13px;
          border-radius: 14px;
          background: var(--color-red-light); color: var(--color-danger);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.87rem; font-weight: 500;
          border: 1.5px solid var(--color-danger); cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, border-color 0.15s;
        }
        [data-theme="dark"] .btn-logout {
          background: var(--color-red-light-dark);
          color: var(--color-danger);
          border-color: var(--color-danger);
        }
        .btn-logout:hover { background: var(--color-danger); border-color: var(--color-danger); }
        [data-theme="dark"] .btn-logout:hover {
          background: var(--color-danger);
          border-color: var(--color-danger);
        }

        .divider {
          display: flex; align-items: center; gap: 10px;
          padding: 0 1px;
        }
        .divider-line { flex: 1; height: 1px; background: var(--color-border); }
        .divider-text { font-size: 0.68rem; color: var(--color-text-secondary); letter-spacing: 0.06em; text-transform: uppercase; }
      `}</style>

      <div className="flex flex-col gap-2">
        <button
          onClick={onStartCheckup}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            boxShadow: '0 6px 20px rgba(13, 110, 64, 0.3)'
          }}
        >
          <Sparkles size={16} />
          {t('profile.startCheckup')}
        </button>

        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            {t('profile.account')}
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEditProfile}
            className="flex-1 py-2.5 px-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1.5px solid var(--color-border)'
            }}
          >
            <User size={15} />
            {t('profile.editProfile')}
          </button>
          <button
            onClick={onSettings}
            className="flex-1 py-2.5 px-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              border: '1.5px solid var(--color-border)'
            }}
          >
            <Settings size={15} />
            {t('profile.settings')}
          </button>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          style={{
            background: 'var(--color-red-light)',
            color: 'var(--color-danger)',
            border: '1.5px solid var(--color-danger)'
          }}
        >
          <LogOut size={16} />
          {t('profile.signOut')}
        </button>
      </div>
    </>
  )
}
