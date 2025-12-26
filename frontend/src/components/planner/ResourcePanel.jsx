import { useState } from 'react'
import { Search, Filter, Clock, Users, Dumbbell, UtensilsCrossed, ChevronLeft, ChevronRight, Flame, Apple, Lightbulb } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'

export default function ResourcePanel({ 
  recipes = [], 
  workouts = [], 
  onDragStart, 
  onDragEnd,
  isOpen = true,
  onToggle 
}) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('recipes')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => recipe.tags?.includes(tag))
    return matchesSearch && matchesTags
  })

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const allTags = [...new Set(recipes.flatMap(r => r.tags || []))]

  const handleDragStart = (e, item, type) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...item,
      resourceType: type
    }))
    onDragStart?.(item, type)
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-olympus-gold text-white p-3 rounded-r-lg shadow-xl hover:bg-olympus-gold-light transition-all z-20"
      >
        <ChevronRight size={24} />
      </button>
    )
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-olympus-navy to-olympus-navy/90">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display text-white flex items-center gap-2">
            {activeTab === 'recipes' ? (
              <>
                <UtensilsCrossed size={20} />
                {t('recipes')}
              </>
            ) : (
              <>
                <Dumbbell size={20} />
                {t('workouts')}
              </>
            )}
          </h2>
          <button
            onClick={onToggle}
            className="text-white/80 hover:text-white transition"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex-1 py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === 'recipes'
                ? 'bg-white text-olympus-navy font-semibold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <UtensilsCrossed size={16} />
            {t('recipes')}
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`flex-1 py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === 'workouts'
                ? 'bg-white text-olympus-navy font-semibold'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Dumbbell size={16} />
            {t('workouts')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
          />
        </div>

        {/* Tags filter for recipes */}
        {activeTab === 'recipes' && allTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {allTags.slice(0, 6).map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags(prev => 
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  )
                }}
                className={`text-xs px-3 py-1 rounded-full transition ${
                  selectedTags.includes(tag)
                    ? 'bg-olympus-gold text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-olympus-gold'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'recipes' ? (
          <div className="space-y-3">
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <UtensilsCrossed size={48} className="mx-auto mb-3 opacity-30" />
                <p>{searchTerm ? t('noRecipesFound') : t('noRecipesYet')}</p>
              </div>
            ) : (
              filteredRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, recipe, 'recipe')}
                  onDragEnd={onDragEnd}
                  className="group p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-olympus-gold hover:shadow-lg transition-all cursor-move relative"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-olympus-gold/10 text-olympus-gold text-xs px-2 py-1 rounded font-medium">
                      Drag to calendar
                    </div>
                  </div>

                  <h4 className="font-semibold text-olympus-navy mb-2 pr-20">
                    {recipe.name}
                  </h4>
                  
                  {recipe.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{recipe.servings} {t('servings')}</span>
                    </div>
                    {recipe.difficulty && (
                      <span className={`px-2 py-0.5 rounded ${
                        recipe.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    )}
                  </div>

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{recipe.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Macros if available */}
                  {recipe.macros_per_serving && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex gap-3 text-xs">
                      {recipe.macros_per_serving.calories && (
                        <span className="text-gray-600 flex items-center gap-1">
                          <Flame size={12} className="text-orange-500" />
                          {recipe.macros_per_serving.calories} {t('calories')}
                        </span>
                      )}
                      {recipe.macros_per_serving.protein && (
                        <span className="text-gray-600 flex items-center gap-1">
                          <Apple size={12} className="text-green-600" />
                          {recipe.macros_per_serving.protein}g {t('protein')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWorkouts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Dumbbell size={48} className="mx-auto mb-3 opacity-30" />
                <p>{searchTerm ? t('noWorkoutsFound') : t('noWorkoutsYet')}</p>
              </div>
            ) : (
              filteredWorkouts.map(workout => (
                <div
                  key={workout.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, workout, 'workout')}
                  onDragEnd={onDragEnd}
                  className="group p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-olympus-gold hover:shadow-lg transition-all cursor-move relative"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-olympus-gold/10 text-olympus-gold text-xs px-2 py-1 rounded font-medium">
                      Drag to calendar
                    </div>
                  </div>

                  <h4 className="font-semibold text-olympus-navy mb-2 pr-20">
                    {workout.name}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    {workout.estimated_duration && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{workout.estimated_duration} min</span>
                      </div>
                    )}
                    {workout.program_type && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {workout.program_type}
                      </span>
                    )}
                  </div>

                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        {workout.exercises.length} exercises
                      </p>
                      {workout.exercises.slice(0, 3).map((exercise, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="w-1 h-1 bg-olympus-gold rounded-full" />
                          <span className="truncate">
                            {exercise.name} - {exercise.sets}x{exercise.reps}
                          </span>
                        </div>
                      ))}
                      {workout.exercises.length > 3 && (
                        <p className="text-xs text-gray-500 pl-3">
                          +{workout.exercises.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer tip */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 flex items-center gap-2">
          <Lightbulb size={16} className="text-olympus-gold" />
          {t('dragTip')}
        </p>
      </div>
    </div>
  )
}
