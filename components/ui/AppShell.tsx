'use client'

import { ReactNode } from 'react'
import TopNav from './TopNav'

interface AppShellProps {
  children: ReactNode
  contentWidth?: 'wide' | 'reading'
  viewport?: boolean
}

export default function AppShell({ children, contentWidth = 'wide', viewport = false }: AppShellProps) {
  return (
    <div className={`app-shell ${viewport ? 'app-shell-viewport' : ''}`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:p-4">Skip to content</a>
      <TopNav />
      <div className="app-workspace">
        <main id="main-content" className={`app-content ${contentWidth === 'reading' ? 'app-content-reading' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
