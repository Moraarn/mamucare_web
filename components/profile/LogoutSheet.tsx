'use client'

import { LogOut } from 'lucide-react'

interface LogoutSheetProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function LogoutSheet({ isOpen, onConfirm, onCancel }: LogoutSheetProps) {
  if (!isOpen) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:wght@400;500&display=swap');

        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 200;
          display: flex; align-items: flex-end; justify-content: center;
          padding: 1.25rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        .sheet {
          font-family: 'DM Sans', sans-serif;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.7);
          border-radius: 22px;
          padding: 1.5rem;
          width: 100%; max-width: 400px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.12);
          animation: slideUp 0.32s cubic-bezier(0.22,1,0.36,1);
        }

        [data-theme="dark"] .sheet {
          background: rgba(30,32,40,0.92);
          border-color: rgba(255,255,255,0.07);
          box-shadow: 0 8px 16px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.4);
        }

        .sheet-icon {
          width: 44px; height: 44px; border-radius: 13px;
          background: var(--color-red-light);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }

        .sheet-title {
          font-family: 'Fraunces', serif;
          font-size: 1.15rem; font-weight: 500;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 5px;
        }

        .sheet-body {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 1.25rem;
          opacity: 0.8;
        }

        .sheet-actions { display: flex; flex-direction: column; gap: 7px; }

        .sheet-confirm {
          width: 100%; padding: 12px;
          border-radius: 13px;
          background: var(--color-danger); color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.845rem; font-weight: 600;
          border: none; cursor: pointer;
          letter-spacing: 0.01em;
          transition: opacity 0.15s, transform 0.15s;
        }
        .sheet-confirm:hover { opacity: 0.88; transform: translateY(-1px); }
        .sheet-confirm:active { transform: translateY(0); opacity: 1; }

        .sheet-cancel {
          width: 100%; padding: 12px;
          border-radius: 13px;
          background: transparent; color: var(--color-text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.845rem; font-weight: 500;
          border: 1px solid var(--color-border); cursor: pointer;
          transition: background 0.15s;
        }
        .sheet-cancel:hover { background: rgba(0,0,0,0.03); }
        [data-theme="dark"] .sheet-cancel:hover { background: rgba(255,255,255,0.04); }
      `}</style>

      <div className="overlay" onClick={onCancel}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-icon">
            <LogOut size={19} color="var(--color-danger)" strokeWidth={2.2} />
          </div>
          <div className="sheet-title">Sign out?</div>
          <div className="sheet-body">
            You'll be returned to the login screen. Your data and checkup history will still be saved.
          </div>
          <div className="sheet-actions">
            <button className="sheet-confirm" onClick={onConfirm}>Yes, sign me out</button>
            <button className="sheet-cancel" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  )
}