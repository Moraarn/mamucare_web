'use client'

import { ReactNode } from 'react'
import StatusBar from './StatusBar'
import BottomNav from './BottomNav'
import MamuCareChat from '@/components/chat'

interface AppShellProps {
  children: ReactNode
  statusBar?: {
    title: string
    showBack?: boolean
    rightContent?: string
    color?: 'primary' | 'danger' | 'warning'
  }
  showBottomNav?: boolean
  contentWidth?: 'wide' | 'reading'
  viewport?: boolean
}

export default function AppShell({ children, statusBar, showBottomNav = true, contentWidth = 'wide', viewport = false }: AppShellProps) {
  return (
    <div className={`app-shell ${showBottomNav ? 'app-shell-with-nav' : ''} ${viewport ? 'app-shell-viewport' : ''}`}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:p-4">Skip to content</a>
      {showBottomNav && <BottomNav />}
      <div className="app-workspace">
        {statusBar && <StatusBar {...statusBar} />}
        <main id="main-content" className={`app-content ${contentWidth === 'reading' ? 'app-content-reading' : ''}`}>
          {children}
        </main>
      </div>
      <MamuCareChat />
    </div>
  )
}
