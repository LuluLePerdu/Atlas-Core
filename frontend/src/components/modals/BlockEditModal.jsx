import { useState, useEffect } from 'react'
import { X, AlertTriangle, Clock, Trash2 } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import { format, differenceInMinutes } from 'date-fns'

export default function BlockEditModal({ 
  isOpen, 
  onClose, 
  block, 
  conflicts = [],
  onSave, 
  onDelete 
}) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'other',
    start_time: '',
    end_time: '',
    color: '#3498db',
    notes: '',
    linked_workout_id: null,
    linked_recipe_ids: []
  })

  useEffect(() => {
    if (block && isOpen) {
      setFormData({
        title: block.title || '',
        type: block.type || 'other',
        start_time: block.start_time ? format(new Date(block.start_time), "yyyy-MM-dd'T'HH:mm") : '',
        end_time: block.end_time ? format(new Date(block.end_time), "yyyy-MM-dd'T'HH:mm") : '',
        color: block.color || '#3498db',
        notes: block.notes || '',
        linked_workout_id: block.linked_workout_id || null,
        linked_recipe_ids: block.linked_recipe_ids || []
      })
    }
  }, [block, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate that end time is after start time
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time)
      const end = new Date(formData.end_time)
      if (end <= start) {
        alert(t('endTimeBeforeStart') || 'End time must be after start time')
        return
      }
    }
    
    setLoading(true)
    try {
      // Convert datetime-local strings to ISO strings with proper timezone
      // datetime-local format: "2025-12-26T15:15" (no timezone)
      // We need to treat this as local time and convert to ISO
      const startISO = new Date(formData.start_time).toISOString()
      const endISO = new Date(formData.end_time).toISOString()
      
      await onSave({
        ...formData,
        start_time: startISO,
        end_time: endISO,
        id: block?.id
      })
      onClose()
    } catch (error) {
      console.error('Failed to save block:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(t('confirmDelete'))) {
      setLoading(true)
      try {
        await onDelete(block.id)
        onClose()
      } catch (error) {
        console.error('Failed to delete block:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const duration = formData.start_time && formData.end_time
    ? differenceInMinutes(new Date(formData.end_time), new Date(formData.start_time))
    : 0

  const colorOptions = [
    { name: 'Blue', value: '#3498db' },
    { name: 'Green', value: '#2ecc71' },
    { name: 'Emerald', value: '#27ae60' },
    { name: 'Orange', value: '#e67e22' },
    { name: 'Red', value: '#e74c3c' },
    { name: 'Purple', value: '#9b59b6' },
    { name: 'Teal', value: '#1abc9c' },
    { name: 'Yellow', value: '#f39c12' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Indigo', value: '#3f51b5' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-olympus-navy to-olympus-navy/90">
          <h2 className="text-2xl font-display text-white">
            {block?.id ? t('editBlock') : t('addBlock')}
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Conflicts warning */}
        {conflicts.length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">
                  {t('schedulingConflict')}
                </h4>
                <p className="text-sm text-red-700 mb-2">
                  {t('conflictsWith')} {conflicts.length} {t('otherBlocks')}:
                </p>
                <ul className="space-y-1">
                  {conflicts.map(conflict => (
                    <li key={conflict.id} className="text-sm text-red-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span className="font-medium">{conflict.title}</span>
                      <span className="text-red-600">
                        ({format(new Date(conflict.start_time), 'HH:mm')} - {format(new Date(conflict.end_time), 'HH:mm')})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('title')} *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent transition"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
              >
                <option value="workout">{t('workout')}</option>
                <option value="meal">{t('meal')}</option>
                <option value="work">{t('work')}</option>
                <option value="sleep">{t('sleep')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('color')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-full h-10 rounded-lg transition-all ${
                      formData.color === color.value
                        ? 'ring-2 ring-offset-2 ring-olympus-gold scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('startTime')} *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('endTime')} *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
              />
            </div>

            {/* Duration display */}
            {duration > 0 && (
              <div className="col-span-2 p-3 bg-gray-50 rounded-lg flex items-center gap-2 text-sm text-gray-700">
                <Clock size={16} className="text-olympus-gold" />
                <span className="font-medium">
                  {t('duration')}: {Math.floor(duration / 60)}h {duration % 60}min
                </span>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent resize-none"
                placeholder={t('addNotes')}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          {block?.id ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
            >
              <Trash2 size={18} />
              {t('delete')}
            </button>
          ) : (
            <div />
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-olympus-gold text-white rounded-lg hover:bg-olympus-gold-light transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
