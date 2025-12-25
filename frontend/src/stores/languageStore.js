import { create } from 'zustand'
import { translations } from '../i18n/translations'

export const useLanguageStore = create((set) => ({
  language: localStorage.getItem('language') || 'en',
  
  setLanguage: (lang) => {
    localStorage.setItem('language', lang)
    set({ language: lang })
  },
  
  t: (key) => {
    const lang = localStorage.getItem('language') || 'en'
    return translations[lang]?.[key] || translations.en[key] || key
  }
}))

// Hook for easy translation access
export const useTranslation = () => {
  const { language, setLanguage } = useLanguageStore()
  
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key
  }
  
  return { t, language, setLanguage }
}
