import { useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import { useCalendarStore } from '../../stores/calendarStore'

export default function BlockModal({ isOpen, onClose, day, weekStartDate }) {
  const { t } = useTranslation()
  const { createBlock } = useCalendarStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'other',
    day_of_week: day || 'monday',
    start_time: '09:00',
    end_time: '10:00',
    color: '#3498db',
    notes: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Convert times to full datetime
      const startDateTime = `${weekStartDate}T${formData.start_time}:00Z`
      const endDateTime = `${weekStartDate}T${formData.end_time}:00Z`

      await createBlock({
        ...formData,
        start_time: startDateTime,
        end_time: endDateTime,
        week_start_date: weekStartDate
      })
      
      onClose()
      setFormData({
        title: '',
        type: 'other',
        day_of_week: day || 'monday',
        start_time: '09:00',
        end_time: '10:00',
        color: '#3498db',
        notes: ''
      })
    } catch (error) {
      console.error('Failed to create block:', error)
    } finally {
      setLoading(false)
    }
  }

  const colorOptions = [
    { name: 'Blue', value: '#3498db' },
    { name: 'Green', value: '#2ecc71' },
    { name: 'Orange', value: '#e67e22' },
    { name: 'Red', value: '#e74c3c' },
    { name: 'Purple', value: '#9b59b6' },
    { name: 'Teal', value: '#1abc9c' },
    { name: 'Yellow', value: '#f39c12' },
    { name: 'Pink', value: '#e91e63' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-display text-olympus-navy">{t('addBlock')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('title')} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
              placeholder={t('blockTitle')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('type')}
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="workout">💪 {t('workout')}</option>
              <option value="meal">🍽️ {t('meal')}</option>
              <option value="work">📚 {t('work')}</option>
              <option value="sleep">😴 {t('sleep')}</option>
              <option value="other">📌 {t('other')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('startTime')}
              </label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('endTime')}
              </label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('color')}
            </label>
            <div className="grid grid-cols-8 gap-2">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.color === color.value 
                      ? 'border-olympus-navy scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
              placeholder={t('optionalNotes')}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
