import { useState } from 'react'
import { LayoutTemplate } from 'lucide-react'
import { useTranslation } from '../stores/languageStore'
import TemplateModal from '../components/modals/TemplateModal'

export default function Templates() {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-display text-olympus-navy">{t('weekTemplates')}</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          {t('saveCurrentWeek')}
        </button>
      </div>

      <TemplateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="olympus-card text-center py-12">
        <LayoutTemplate size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('noTemplatesYet')}</h3>
        <p className="text-gray-500 mb-4">
          {t('saveWeekAsTemplate')}
        </p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          {t('createTemplate')}
        </button>
      </div>
    </div>
  )
}
