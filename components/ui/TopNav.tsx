'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Activity, MessageCircle, User, Heart, Menu, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const tabs = [
  { path: '/home', en: 'Home', sw: 'Nyumbani', fr: 'Accueil', icon: Home },
  { path: '/check', en: 'Checkup', sw: 'Angalia', fr: 'Bilan', icon: Activity },
  { path: '/talk', en: 'Talk', sw: 'Zungumza', fr: 'Discuter', icon: MessageCircle },
  { path: '/profile', en: 'Profile', sw: 'Wasifu', fr: 'Profil', icon: User },
]

export default function TopNav() {
  const pathname = usePathname()
  const { language } = useLanguage()
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  return (
    <nav ref={navRef} className="app-nav" aria-label="Main navigation">
      <div className="app-nav-inner">
        <Link href="/home" className="app-brand" onClick={() => setOpen(false)}>
          <span className="app-brand-mark"><Heart aria-hidden="true" size={23} /></span>
          <span>MamuCare</span>
        </Link>
        <button ref={toggleRef} type="button" className="app-menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-navigation-links" onClick={() => setOpen(!open)}>
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <div id="main-navigation-links" className={`app-nav-links ${open ? 'is-open' : ''}`}>
          {tabs.map(({ path, icon: Icon, ...labels }) => (
            <Link key={path} href={path} aria-current={pathname === path || pathname.startsWith(`${path}/`) ? 'page' : undefined} className="app-nav-link" onClick={() => setOpen(false)}>
              <Icon size={18} aria-hidden="true" /><span>{labels[language]}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
