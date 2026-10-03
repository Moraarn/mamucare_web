'use client'

import { Heart } from 'lucide-react'

interface AuthHeaderProps {
  onSignIn?: () => void
  onCreateAccount?: () => void
  activeTab?: 'signin' | 'signup'
}

export default function AuthHeader({ onSignIn, onCreateAccount, activeTab = 'signin' }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Logo and Brand */}
      <div className="flex flex-col items-center mb-5">
        {/* Logo Circle */}
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{ 
            backgroundColor: 'var(--color-primary)',
            boxShadow: '0 2px 8px rgb(var(--color-shadow) / 0.12)'
          }}
        >
          <Heart size={32} className="text-[var(--color-on-primary)]" fill="white" />
        </div>
        
        {/* App Name */}
        <h1 
          className="text-2xl font-bold mb-1 tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          MamuCare
        </h1>
        
        {/* Subtitle */}
        <p 
          className="text-xs font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Maternal health risk checker
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 w-full max-w-sm">
        <button
          onClick={onSignIn}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all text-sm ${
            activeTab === 'signin' ? 'text-white' : 'text-text-primary'
          }`}
          style={{
            backgroundColor: activeTab === 'signin' ? 'var(--color-primary)' : 'var(--color-background)',
            border: activeTab === 'signin' ? 'none' : '1px solid var(--color-border)'
          }}
        >
          Sign in
        </button>
        <button
          onClick={onCreateAccount}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all text-sm ${
            activeTab === 'signup' ? 'text-white' : 'text-text-primary'
          }`}
          style={{
            backgroundColor: activeTab === 'signup' ? 'var(--color-primary)' : 'var(--color-background)',
            border: activeTab === 'signup' ? 'none' : '1px solid var(--color-border)'
          }}
        >
          Create account
        </button>
      </div>
    </div>
  )
}
