import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2, Search, Clock } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import { useWorkoutStore } from '../../stores/workoutStore'

export default function WorkoutModal({ isOpen, onClose, workout = null }) {
  const { t } = useTranslation()
  const { createWorkout, updateWorkout, exercises, fetchExercises } = useWorkoutStore()
  const [loading, setLoading] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    program_type: '',
    estimated_duration: 0,
    exercises: []
  })
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    exercise_id: '',
    sets: 3,
    reps: 10,
    rest_seconds: 60,
    notes: ''
  })

  // Load exercises when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExercises()
    }
  }, [isOpen, fetchExercises])

  // Initialize form with workout data when editing
  useEffect(() => {
    if (workout) {
      setFormData({
        name: workout.name || '',
        program_type: workout.program_type || '',
        estimated_duration: workout.estimated_duration || 0,
        exercises: workout.exercises || []
      })
    } else {
      setFormData({
        name: '',
        program_type: '',
        estimated_duration: 0,
        exercises: []
      })
    }
  }, [workout, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (workout) {
        // Update existing workout
        await updateWorkout(workout.id, formData)
      } else {
        // Create new workout
        await createWorkout(formData)
      }
      onClose()
      setFormData({ name: '', program_type: '', estimated_duration: 0, exercises: [] })
    } catch (error) {
      console.error('Failed to save workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const addExerciseFromLibrary = (exercise) => {
    setCurrentExercise({
      name: exercise.name,
      exercise_id: exercise.id,
      sets: 3,
      reps: 10,
      rest_seconds: 60,
      notes: ''
    })
    setShowExerciseLibrary(false)
  }

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addExercise = () => {
    if (!currentExercise.name) return
    
    // Clean up exercise data - remove empty/unnecessary fields
    const exerciseToAdd = {
      name: currentExercise.name,
      sets: currentExercise.sets,
      reps: currentExercise.reps,
      rest_seconds: currentExercise.rest_seconds
    }
    
    // Only add notes if not empty
    if (currentExercise.notes && currentExercise.notes.trim()) {
      exerciseToAdd.notes = currentExercise.notes.trim()
    }
    
    // Only add exercise_id if not empty
    if (currentExercise.exercise_id && currentExercise.exercise_id.trim()) {
      exerciseToAdd.exercise_id = currentExercise.exercise_id.trim()
    }
    
    if (editingIndex !== null) {
      // Update existing exercise
      setFormData(prev => ({
        ...prev,
        exercises: prev.exercises.map((ex, idx) => 
          idx === editingIndex ? exerciseToAdd : ex
        )
      }))
      setEditingIndex(null)
    } else {
      // Add new exercise
      setFormData(prev => ({
        ...prev,
        exercises: [...prev.exercises, exerciseToAdd]
      }))
    }
    
    setCurrentExercise({
      name: '',
      exercise_id: '',
      sets: 3,
      reps: 10,
      rest_seconds: 60,
      notes: ''
    })
  }

  const editExercise = (index) => {
    setCurrentExercise(formData.exercises[index])
    setEditingIndex(index)
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setCurrentExercise({
      name: '',
      exercise_id: '',
      sets: 3,
      reps: 10,
      rest_seconds: 60,
      notes: ''
    })
  }

  const removeExercise = (index) => {
    if (editingIndex === index) {
      cancelEdit()
    }
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-display text-olympus-navy">
            {workout ? t('editWorkout') : t('createWorkout')}
          </h2>
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
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    editingIndex === index ? 'bg-olympus-gold bg-opacity-20 border-2 border-olympus-gold' : 'bg-olympus-marble'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-olympus-navy">{exercise.name}</p>
                    <p className="text-sm text-gray-600">
                      {exercise.sets} sets × {exercise.reps} reps • {exercise.rest_seconds}s rest
                    </p>
                    {exercise.notes && (
                      <p className="text-xs text-gray-500 mt-1">{exercise.notes}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => editExercise(index)}
                      className="text-olympus-gold hover:text-olympus-navy"
                      disabled={editingIndex !== null && editingIndex !== index}
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExercise(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              {editingIndex !== null && (
                <div className="mb-2 p-2 bg-olympus-gold bg-opacity-20 rounded text-sm text-olympus-navy font-medium">
                  {t('editingExercise')} - {t('clickSaveToUpdate')}
                </div>
              )}

              {/* Exercise Library Toggle */}
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium text-gray-700">
                  {t('exerciseName')} *
                </label>
                <button
                  type="button"
                  onClick={() => setShowExerciseLibrary(!showExerciseLibrary)}
                  className="text-xs text-olympus-gold hover:text-olympus-navy flex items-center space-x-1"
                >
                  <Search size={14} />
                  <span>{showExerciseLibrary ? t('hideLibrary') : t('browseLibrary')}</span>
                </button>
              </div>

              {/* Exercise Library Dropdown */}
              {showExerciseLibrary && (
                <div className="mb-3 border border-gray-300 rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                  <input
                    type="text"
                    placeholder={t('searchExercises')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                  />
                  <div className="space-y-1">
                    {filteredExercises.length > 0 ? (
                      filteredExercises.map(exercise => (
                        <button
                          key={exercise.id}
                          type="button"
                          onClick={() => addExerciseFromLibrary(exercise)}
                          className="w-full text-left px-3 py-2 hover:bg-olympus-marble rounded text-sm transition-colors"
                        >
                          <div className="font-medium text-olympus-navy">{exercise.name}</div>
                          <div className="text-xs text-gray-500">{exercise.category}</div>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">{t('noExercisesFound')}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={currentExercise.name}
                  onChange={(e) => setCurrentExercise(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder={t('exerciseName')}
                />
              </div>
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
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('notes')} ({t('optional')})
                </label>
                <input
                  type="text"
                  value={currentExercise.notes}
                  onChange={(e) => setCurrentExercise(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder={t('exerciseNotes')}
                />
              </div>
              <button
                type="button"
                onClick={addExercise}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>{editingIndex !== null ? t('updateExercise') : t('addExercise')}</span>
              </button>
              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full btn-secondary text-red-600 hover:text-red-700"
                >
                  {t('cancel')}
                </button>
              )}
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
