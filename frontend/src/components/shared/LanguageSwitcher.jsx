import { useTranslation } from '../../stores/languageStore'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      title={language === 'en' ? 'Switch to French' : 'Passer en anglais'}
    >
      <Languages size={16} className="text-gray-600" />
      <span className="text-sm font-medium text-gray-700 w-6 text-center">
        {language === 'en' ? 'EN' : 'FR'}
      </span>
    </button>
  )
}
