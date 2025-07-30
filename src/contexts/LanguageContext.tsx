'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getTranslation } from '@/lib/translations'

type Language = 'en' | 'fr' | 'ar' | 'ber' | 'es' | 'zh' | 'uk'

type LanguageContextType = {
  currentLanguage: Language
  changeLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en')

  useEffect(() => {
    // Get language from localStorage or default to English
    const savedLanguage = localStorage.getItem('language') as Language | null
    const initialLanguage = savedLanguage || 'en'
    setCurrentLanguage(initialLanguage)
    
    // Update document direction for RTL languages
    if (initialLanguage === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = initialLanguage
    }
  }, [])

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language)
    localStorage.setItem('language', language)
    
    // Update document direction for RTL languages
    if (language === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = language
    }
  }

  const t = (key: string): string => {
    return getTranslation(key, currentLanguage)
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 