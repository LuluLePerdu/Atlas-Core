import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import { useCalendarStore } from '../../stores/calendarStore'
import { useTranslation } from '../../stores/languageStore'
import { format, startOfWeek, addDays } from 'date-fns'

export default function WorkoutCalendarModal({ isOpen, onClose, workout }) {
  const { t } = useTranslation()
  const { createBlockWithWorkout } = useCalendarStore()
  
  const [selectedDay, setSelectedDay] = useState('monday')
  const [startTime, setStartTime] = useState('09:00')
  const [currentWeekStart] = useState(() => 
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  )

  if (!isOpen || !workout) return null

  const days = [
    { key: 'monday', label: t('monday') },
    { key: 'tuesday', label: t('tuesday') },
    { key: 'wednesday', label: t('wednesday') },
    { key: 'thursday', label: t('thursday') },
    { key: 'friday', label: t('friday') },
    { key: 'saturday', label: t('saturday') },
    { key: 'sunday', label: t('sunday') }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dayIndex = days.findIndex(d => d.key === selectedDay)
    const selectedDate = addDays(new Date(currentWeekStart), dayIndex)
    
    // Calculate end time based on workout duration
    const [hours, minutes] = startTime.split(':').map(Number)
    const startDate = new Date(selectedDate)
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + (workout.estimated_duration || 60))

    const blockData = {
      title: workout.name,
      type: 'workout',
      day_of_week: selectedDay,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      week_start_date: currentWeekStart,
      color: '#3498db',
      linked_workout_id: workout.id
    }

    await createBlockWithWorkout(blockData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="text-olympus-gold" size={24} />
            <h2 className="text-2xl font-display text-olympus-navy">
              {t('addToCalendar')}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-olympus-navy mb-2">
              {workout.name}
            </h3>
            <p className="text-sm text-gray-600">
              {workout.program_type} · {workout.exercises?.length || 0} {t('exercises')} · {workout.estimated_duration || 0} {t('min')}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('selectDay')}
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="input-field"
                required
              >
                {days.map(day => (
                  <option key={day.key} value={day.key}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('startTime')}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary flex-1">
              {t('addToCalendar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
