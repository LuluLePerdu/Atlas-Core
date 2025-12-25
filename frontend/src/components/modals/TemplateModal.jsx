import { useState, useEffect } from 'react'
import { X, Calendar } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import { useCalendarStore } from '../../stores/calendarStore'
import { format, startOfWeek } from 'date-fns'
import api from '../../services/api'

export default function TemplateModal({ isOpen, onClose }) {
  const { t } = useTranslation()
  const { blocks } = useCalendarStore()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState([])
  const [showSave, setShowSave] = useState(false)
  const [templateName, setTemplateName] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen])

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/templates')
      setTemplates(data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const saveCurrentWeek = async () => {
    if (!templateName.trim()) return

    setLoading(true)
    try {
      const weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      await api.post('/templates', {
        name: templateName,
        week_start_date: weekStartDate
      })
      setTemplateName('')
      setShowSave(false)
      fetchTemplates()
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyTemplate = async (templateId) => {
    setLoading(true)
    try {
      const weekStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
      await api.post(`/templates/${templateId}/apply`, {
        week_start_date: weekStartDate
      })
      onClose()
      window.location.reload() // Refresh to show new blocks
    } catch (error) {
      console.error('Failed to apply template:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (templateId) => {
    if (!confirm(t('confirmDelete'))) return

    try {
      await api.delete(`/templates/${templateId}`)
      fetchTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-display text-olympus-navy">{t('weekTemplates')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Save current week section */}
          <div className="mb-6 p-4 bg-olympus-marble rounded-lg">
            {!showSave ? (
              <button
                onClick={() => setShowSave(true)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                {t('saveCurrentWeek')}
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={t('templateName')}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSave(false)}
                    className="flex-1 btn-secondary"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={saveCurrentWeek}
                    disabled={loading || !templateName.trim()}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {loading ? t('loading') : t('save')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Templates list */}
          <div>
            <h3 className="text-lg font-semibold text-olympus-navy mb-4">
              {t('myTemplates')}
            </h3>

            {templates.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">{t('noTemplatesYet')}</p>
                <p className="text-sm text-gray-500 mt-2">{t('saveWeekAsTemplate')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="olympus-card flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-olympus-navy">{template.name}</h4>
                      <p className="text-sm text-gray-600">
                        {t('created')}: {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => applyTemplate(template.id)}
                        disabled={loading}
                        className="btn-primary text-sm"
                      >
                        {t('applyTemplate')}
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
