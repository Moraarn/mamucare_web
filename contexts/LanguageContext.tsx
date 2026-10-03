'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'sw' | 'fr'

type TranslationKey = 
  | 'profile.title'
  | 'profile.loading'
  | 'profile.edit'
  | 'profile.startCheckup'
  | 'profile.account'
  | 'profile.editProfile'
  | 'profile.settings'
  | 'profile.signOut'
  | 'profile.contactInfo'
  | 'profile.checkupHistory'
  | 'profile.phone'
  | 'profile.location'
  | 'profile.chw'
  | 'profile.emergencyContact'
  | 'profile.noHistory'
  | 'profile.noHistoryText'
  | 'profile.lastCheckup'
  | 'theme.title'
  | 'theme.light'
  | 'theme.dark'
  | 'language.title'
  | 'language.english'
  | 'language.swahili'
  | 'language.french'
  | 'settings.theme'
  | 'settings.language'
  | 'settings.save'
  | 'settings.cancel'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'profile.title': 'My Profile',
    'profile.loading': 'Loading profile...',
    'profile.edit': 'Edit Profile',
    'profile.startCheckup': 'Start New Checkup',
    'profile.account': 'Account',
    'profile.editProfile': 'Edit Profile',
    'profile.settings': 'Settings',
    'profile.signOut': 'Sign Out',
    'profile.contactInfo': 'Contact Information',
    'profile.checkupHistory': 'Checkup History',
    'profile.phone': 'Phone',
    'profile.location': 'Location',
    'profile.chw': 'Community Health Worker',
    'profile.emergencyContact': 'Emergency Contact',
    'profile.noHistory': 'No checkup history yet',
    'profile.noHistoryText': 'Complete your first health check to see it here',
    'profile.lastCheckup': 'Last Checkup',
    'theme.title': 'Theme Settings',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    'language.title': 'Language Settings',
    'language.english': 'English',
    'language.swahili': 'Swahili',
    'language.french': 'French',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.save': 'Save Changes',
    'settings.cancel': 'Cancel'
  },
  sw: {
    'profile.title': 'Wasifu Wangu',
    'profile.loading': 'Inapakia wasifu...',
    'profile.edit': 'Hariri Wasifu',
    'profile.startCheckup': 'Anza Ukaguzi Mpya',
    'profile.account': 'Akaunti',
    'profile.editProfile': 'Hariri Wasifu',
    'profile.settings': 'Mipangilio',
    'profile.signOut': 'Ondoka',
    'profile.contactInfo': 'Maelezo ya Mawasiliano',
    'profile.checkupHistory': 'Historia ya Ukaguzi',
    'profile.phone': 'Simu',
    'profile.location': 'Mahali',
    'profile.chw': 'Mtaalamu wa Afya ya Jamii',
    'profile.emergencyContact': 'Mawasiliano ya Dharura',
    'profile.noHistory': 'Hakuna historia ya ukaguzi bado',
    'profile.noHistoryText': 'Kamilisha ukaguzi wako wa kwanza wa afya kuiona hapa',
    'profile.lastCheckup': 'Ukaguzi wa Mwisho',
    'theme.title': 'Mipangilio ya Mandhari',
    'theme.light': 'Hali ya Mwanga',
    'theme.dark': 'Hali ya Giza',
    'language.title': 'Mipangilio ya Lugha',
    'language.english': 'Kiingereza',
    'language.swahili': 'Kiswahili',
    'language.french': 'Kifaransa',
    'settings.theme': 'Mandhari',
    'settings.language': 'Lugha',
    'settings.save': 'Hifadhi Mabadiliko',
    'settings.cancel': 'Ghairi'
  },
  fr: {
    'profile.title': 'Mon Profil',
    'profile.loading': 'Chargement du profil...',
    'profile.edit': 'Modifier le Profil',
    'profile.startCheckup': 'Commencer un Nouveau Contrôle',
    'profile.account': 'Compte',
    'profile.editProfile': 'Modifier le Profil',
    'profile.settings': 'Paramètres',
    'profile.signOut': 'Se Déconnecter',
    'profile.contactInfo': 'Informations de Contact',
    'profile.checkupHistory': 'Historique des Contrôles',
    'profile.phone': 'Téléphone',
    'profile.location': 'Localisation',
    'profile.chw': 'Agent de Santé Communautaire',
    'profile.emergencyContact': 'Contact d\'Urgence',
    'profile.noHistory': 'Aucun historique de contrôle yet',
    'profile.noHistoryText': 'Complétez votre premier contrôle de santé pour le voir ici',
    'profile.lastCheckup': 'Dernier Contrôle',
    'theme.title': 'Paramètres du Thème',
    'theme.light': 'Mode Clair',
    'theme.dark': 'Mode Sombre',
    'language.title': 'Paramètres de Langue',
    'language.english': 'Anglais',
    'language.swahili': 'Swahili',
    'language.french': 'Français',
    'settings.theme': 'Thème',
    'settings.language': 'Langue',
    'settings.save': 'Sauvegarder les Changements',
    'settings.cancel': 'Annuler'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Get language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && ['en', 'sw', 'fr'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('language', language)
  }, [language])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
