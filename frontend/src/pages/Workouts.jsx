import { useEffect, useState } from 'react'
import { useWorkoutStore } from '../stores/workoutStore'
import { Plus, Dumbbell, Calendar } from 'lucide-react'
import Loading from '../components/shared/Loading'
import { useTranslation } from '../stores/languageStore'
import WorkoutModal from '../components/modals/WorkoutModal'
import WorkoutCalendarModal from '../components/modals/WorkoutCalendarModal'

export default function Workouts() {
  const { t } = useTranslation()
  const { workouts, exercises, loading, fetchWorkouts, fetchExercises } = useWorkoutStore()
  const [activeTab, setActiveTab] = useState('workouts')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState(null)

  useEffect(() => {
    fetchWorkouts()
    fetchExercises()
  }, [fetchWorkouts, fetchExercises])

  const handleAddToCalendar = (workout) => {
    setSelectedWorkout(workout)
    setIsCalendarModalOpen(true)
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

      <WorkoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <WorkoutCalendarModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => {
          setIsCalendarModalOpen(false)
          setSelectedWorkout(null)
        }}
        workout={selectedWorkout}
      />

      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('workouts')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'workouts'
              ? 'text-olympus-gold border-b-2 border-olympus-gold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('myWorkouts')}
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'exercises'
              ? 'text-olympus-gold border-b-2 border-olympus-gold'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('exerciseLibrary')}
        </button>
      </div>

      {activeTab === 'workouts' && (
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
                <h3 className="text-xl font-semibold text-olympus-navy mb-2">
                  {workout.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {workout.program_type || t('custom')}
                </p>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-500">
                    {workout.exercises?.length || 0} {t('exercises')}
                  </span>
                  <span className="text-gray-500">
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
      )}

      {activeTab === 'exercises' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map(exercise => (
            <div key={exercise.id} className="olympus-card">
              <h3 className="font-semibold text-olympus-navy mb-2">
                {exercise.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">{exercise.category}</p>
              <div className="flex flex-wrap gap-1">
                {exercise.muscle_groups?.map(muscle => (
                  <span
                    key={muscle}
                    className="text-xs bg-olympus-marble px-2 py-1 rounded"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
