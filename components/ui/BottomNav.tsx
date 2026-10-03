'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Activity, MessageCircle, User, Heart } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const tabs = [
  { path: '/home', en: 'Home', sw: 'Nyumbani', fr: 'Accueil', icon: Home },
  { path: '/check', en: 'Checkup', sw: 'Angalia', fr: 'Bilan', icon: Activity },
  { path: '/talk', en: 'Talk', sw: 'Zungumza', fr: 'Discuter', icon: MessageCircle },
  { path: '/profile', en: 'Profile', sw: 'Wasifu', fr: 'Profil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { language } = useLanguage()
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <Link href="/home" className="app-brand"><Heart aria-hidden="true" size={26} /><span>CystaNiva</span></Link>
      <div className="app-nav-links">
        {tabs.map(({ path, icon: Icon, ...labels }) => (
          <Link key={path} href={path} aria-current={pathname === path ? 'page' : undefined} className="app-nav-link">
            <Icon size={22} aria-hidden="true" /><span>{labels[language]}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
