import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import { useWorkoutStore } from '../../stores/workoutStore'

export default function WorkoutModal({ isOpen, onClose }) {
  const { t } = useTranslation()
  const { createWorkout } = useWorkoutStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    program_type: '',
    estimated_duration: 0,
    exercises: []
  })
  const [currentExercise, setCurrentExercise] = useState({
    exercise_id: '',
    sets: 3,
    reps: 10,
    rest_seconds: 60,
    notes: ''
  })

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createWorkout(formData)
      onClose()
      setFormData({ name: '', program_type: '', estimated_duration: 0, exercises: [] })
    } catch (error) {
      console.error('Failed to create workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const addExercise = () => {
    if (!currentExercise.exercise_id) return
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, currentExercise]
    }))
    setCurrentExercise({
      exercise_id: '',
      sets: 3,
      reps: 10,
      rest_seconds: 60,
      notes: ''
    })
  }

  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-display text-olympus-navy">{t('createWorkout')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('workoutName')} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
              placeholder={t('workoutName')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('programType')}
              </label>
              <select
                value={formData.program_type}
                onChange={(e) => setFormData(prev => ({ ...prev, program_type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
              >
                <option value="">Custom</option>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="hiit">HIIT</option>
                <option value="yoga">Yoga</option>
                <option value="flexibility">Flexibility</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('duration')} ({t('min')})
              </label>
              <input
                type="number"
                min="0"
                value={formData.estimated_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-olympus-navy mb-4">{t('exercises')}</h3>

            <div className="space-y-4 mb-4">
              {formData.exercises.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-olympus-marble rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-olympus-navy">Exercise #{index + 1}</p>
                    <p className="text-sm text-gray-600">
                      {exercise.sets} sets × {exercise.reps} reps • {exercise.rest_seconds}s rest
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentExercise.sets}
                    onChange={(e) => setCurrentExercise(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentExercise.reps}
                    onChange={(e) => setCurrentExercise(prev => ({ ...prev, reps: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Rest (s)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentExercise.rest_seconds}
                    onChange={(e) => setCurrentExercise(prev => ({ ...prev, rest_seconds: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addExercise}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>{t('addExercise')}</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
