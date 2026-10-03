'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Palette, Globe } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'theme' | 'language'
}

export default function SettingsModal({ isOpen, onClose, defaultTab = 'theme' }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'theme' | 'language'>(defaultTab)
  const [tempTheme, setTempTheme] = useState(theme)
  const [tempLanguage, setTempLanguage] = useState(language)

  const handleSave = () => {
    setTheme(tempTheme)
    setLanguage(tempLanguage)
    onClose()
  }

  const handleCancel = () => {
    setTempTheme(theme)
    setTempLanguage(language)
    onClose()
  }

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English' },
    { code: 'sw' as const, name: 'Swahili', nativeName: 'Kiswahili' },
    { code: 'fr' as const, name: 'French', nativeName: 'Français' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.theme')}>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'theme'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Palette size={16} />
            {t('settings.theme')}
          </button>
          <button
            onClick={() => setActiveTab('language')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'language'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Globe size={16} />
            {t('settings.language')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'theme' && (
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-4">
              {t('theme.title')}
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={tempTheme === 'light'}
                  onChange={(e) => setTempTheme(e.target.value as 'light' | 'dark')}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{t('theme.light')}</div>
                  <div className="text-sm text-text-secondary">Clean and bright interface</div>
                </div>
                <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full"></div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={tempTheme === 'dark'}
                  onChange={(e) => setTempTheme(e.target.value as 'light' | 'dark')}
                  className="w-4 h-4 text-primary"
                />
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{t('theme.dark')}</div>
                  <div className="text-sm text-text-secondary">Easy on the eyes at night</div>
                </div>
                <div className="w-8 h-8 bg-gray-900 border-2 border-gray-600 rounded-full"></div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'language' && (
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-4">
              {t('language.title')}
            </h3>
            <div className="space-y-3">
              {languages.map((lang) => (
                <label key={lang.code} className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={tempLanguage === lang.code}
                    onChange={(e) => setTempLanguage(e.target.value as 'en' | 'sw' | 'fr')}
                    className="w-4 h-4 text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">{lang.nativeName}</div>
                    <div className="text-sm text-text-secondary">{lang.name}</div>
                  </div>
                  <div className="text-2xl">
                    {lang.code === 'en' && '🇺🇸'}
                    {lang.code === 'sw' && '🇰🇪'}
                    {lang.code === 'fr' && '🇫🇷'}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            {t('settings.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            {t('settings.save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
