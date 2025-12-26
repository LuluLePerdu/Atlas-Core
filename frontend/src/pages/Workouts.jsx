import { useEffect, useState } from 'react'
import { useWorkoutStore } from '../stores/workoutStore'
import { Plus, Dumbbell, Calendar, Edit2, Trash2, Clock } from 'lucide-react'
import Loading from '../components/shared/Loading'
import { useTranslation } from '../stores/languageStore'
import WorkoutModal from '../components/modals/WorkoutModal'
import WorkoutCalendarModal from '../components/modals/WorkoutCalendarModal'

export default function Workouts() {
  const { t } = useTranslation()
  const { workouts, exercises, loading, fetchWorkouts, fetchExercises, deleteWorkout } = useWorkoutStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState(null)
  const [editingWorkout, setEditingWorkout] = useState(null)

  useEffect(() => {
    fetchWorkouts()
    fetchExercises()
  }, [fetchWorkouts, fetchExercises])

  const handleAddToCalendar = (workout) => {
    setSelectedWorkout(workout)
    setIsCalendarModalOpen(true)
  }

  const handleEdit = (workout) => {
    setEditingWorkout(workout)
    setIsModalOpen(true)
  }

  const handleDelete = async (workoutId) => {
    if (window.confirm(t('confirmDeleteWorkout'))) {
      try {
        await deleteWorkout(workoutId)
      } catch (error) {
        console.error('Failed to delete workout:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingWorkout(null)
  }

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-display text-olympus-navy">{t('workouts')}</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{t('createWorkout')}</span>
        </button>
      </div>

      <WorkoutModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        workout={editingWorkout}
      />
      <WorkoutCalendarModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => {
          setIsCalendarModalOpen(false)
          setSelectedWorkout(null)
        }}
        workout={selectedWorkout}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.length === 0 ? (
          <div className="col-span-full olympus-card text-center py-12">
            <Dumbbell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('noWorkoutsYet')}</h3>
            <p className="text-gray-500 mb-4">{t('createFirstWorkout')}</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              {t('createWorkout')}
            </button>
          </div>
        ) : (
          workouts.map(workout => (
            <div key={workout.id} className="olympus-card hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-olympus-navy flex-1">
                  {workout.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(workout)}
                    className="text-olympus-gold hover:text-olympus-navy transition-colors"
                    title={t('edit')}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {workout.program_type || t('custom')}
              </p>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-gray-500">
                  <Dumbbell size={14} className="inline mr-1" />
                  {workout.exercises?.length || 0} {t('exercises')}
                </span>
                <span className="text-gray-500">
                  <Clock size={14} className="inline mr-1" />
                  {workout.estimated_duration || 0} {t('min')}
                </span>
              </div>
              <button
                onClick={() => handleAddToCalendar(workout)}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                <Calendar size={16} />
                <span>{t('addToCalendar')}</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
