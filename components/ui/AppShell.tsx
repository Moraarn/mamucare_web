'use client'

import { ReactNode } from 'react'
import TopNav from './TopNav'
import MedicalDisclaimer from './MedicalDisclaimer'

interface AppShellProps {
  children: ReactNode
  contentWidth?: 'wide' | 'reading'
  viewport?: boolean
  aiGuidance?: boolean
}

export default function AppShell({ children, contentWidth = 'wide', viewport = false, aiGuidance = false }: AppShellProps) {
  return (
    <div className={`app-shell ${viewport ? 'app-shell-viewport' : ''}`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:p-4">Skip to content</a>
      <TopNav />
      <div className="app-workspace">
        <main id="main-content" className={`app-content ${contentWidth === 'reading' ? 'app-content-reading' : ''}`}>
          {aiGuidance && <MedicalDisclaimer compact />}
          {children}
        </main>
      </div>
      <footer className="app-medical-footer">
        <MedicalDisclaimer />
      </footer>
    </div>
  )
}
