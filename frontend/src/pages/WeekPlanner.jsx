import { useState, useEffect } from 'react'
import { useCalendarStore } from '../stores/calendarStore'
import { useMealStore } from '../stores/mealStore'
import { format, startOfWeek, addDays } from 'date-fns'
import Loading from '../components/shared/Loading'
import { useTranslation } from '../stores/languageStore'
import BlockModal from '../components/modals/BlockModal'
import { ChevronLeft, ChevronRight, UtensilsCrossed, Clock, Users } from 'lucide-react'

export default function WeekPlanner() {
  const { t } = useTranslation()
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  )
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState('monday')
  const [draggedRecipe, setDraggedRecipe] = useState(null)
  const [showRecipePanel, setShowRecipePanel] = useState(true)
  
  const { blocks, loading, fetchWeek, createBlock } = useCalendarStore()
  const { recipes, fetchRecipes, loading: recipesLoading } = useMealStore()

  useEffect(() => {
    fetchWeek(currentWeekStart)
    fetchRecipes()
  }, [currentWeekStart, fetchWeek, fetchRecipes])

  const handleAddBlock = (dayKey) => {
    setSelectedDay(dayKey)
    setIsBlockModalOpen(true)
  }

  const handleDrop = async (dayKey, e) => {
    e.preventDefault()
    const recipeData = e.dataTransfer.getData('recipe')
    if (!recipeData) return

    const recipe = JSON.parse(recipeData)
    const dayIndex = dayKeys.findIndex(d => d === dayKey)
    const dropDate = addDays(new Date(currentWeekStart), dayIndex)

    // Create meal block at 12:00 by default
    const startTime = new Date(dropDate)
    startTime.setHours(12, 0, 0, 0)
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + (recipe.prep_time + recipe.cook_time || 60))

    const blockData = {
      title: recipe.name,
      type: 'meal',
      day_of_week: dayKey,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      week_start_date: currentWeekStart,
      color: '#27ae60',
      notes: `Prep: ${recipe.prep_time}min | Cook: ${recipe.cook_time}min`,
      recipe_id: recipe.id
    }

    await createBlock(blockData)
    
    // Save to meal plan (optional - keeping for backend sync)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  if (loading) return <Loading />

  const days = [
    t('monday'), t('tuesday'), t('wednesday'), 
    t('thursday'), t('friday'), t('saturday'), t('sunday')
  ]
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-6">
      {/* Recipe Sidebar */}
      <div className={`transition-all duration-300 ${showRecipePanel ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="olympus-card sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-olympus-navy flex items-center gap-2">
              <UtensilsCrossed size={20} />
              {t('recipes')}
            </h2>
            <button
              onClick={() => setShowRecipePanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {recipesLoading ? (
            <p className="text-sm text-gray-500">{t('loading')}...</p>
          ) : recipes.length === 0 ? (
            <p className="text-sm text-gray-500">{t('noRecipesYet')}</p>
          ) : (
            <div className="space-y-3">
              {recipes.map(recipe => (
                <div
                  key={recipe.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('recipe', JSON.stringify(recipe))
                    e.dataTransfer.effectAllowed = 'copy'
                    setDraggedRecipe(recipe)
                  }}
                  onDragEnd={() => setDraggedRecipe(null)}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition cursor-move hover:border-olympus-gold"
                >
                  <h4 className="font-semibold text-sm text-olympus-navy mb-1">
                    {recipe.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} {t('min')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{recipe.servings}</span>
                    </div>
                  </div>
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-olympus-gold/20 text-olympus-navy px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toggle button when panel is hidden */}
      {!showRecipePanel && (
        <button
          onClick={() => setShowRecipePanel(true)}
          className="fixed left-4 top-1/2 -translate-y-1/2 bg-olympus-gold text-white p-3 rounded-r-lg shadow-lg hover:bg-olympus-gold-light transition z-10"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Calendar Grid */}
      <div className="flex-1">
        <BlockModal 
          isOpen={isBlockModalOpen} 
          onClose={() => setIsBlockModalOpen(false)}
          day={selectedDay}
          weekStartDate={currentWeekStart}
        />
        
        <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-display text-olympus-navy">{t('weekPlanner')}</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              const prev = new Date(currentWeekStart)
              prev.setDate(prev.getDate() - 7)
              setCurrentWeekStart(format(prev, 'yyyy-MM-dd'))
            }}
            className="btn-secondary"
          >
            {t('previousWeek')}
          </button>
          <span className="text-lg font-medium text-olympus-navy">
            {format(new Date(currentWeekStart), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => {
              const next = new Date(currentWeekStart)
              next.setDate(next.getDate() + 7)
              setCurrentWeekStart(format(next, 'yyyy-MM-dd'))
            }}
            className="btn-secondary"
          >
            {t('nextWeek')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => {
          const dayDate = addDays(new Date(currentWeekStart), index)
          const dayBlocks = blocks.filter(
            block => block.day_of_week === dayKeys[index]
          )

          return (
            <div 
              key={day} 
              className="olympus-card relative"
              onDrop={(e) => handleDrop(dayKeys[index], e)}
              onDragOver={handleDragOver}
            >
              <h3 className="font-semibold text-olympus-navy mb-2">
                {day}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {format(dayDate, 'MMM d')}
              </p>

              <div className="space-y-2 min-h-[100px]">
                {dayBlocks.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-8">
                    {t('dropRecipeHere')}
                  </p>
                ) : (
                  dayBlocks.map(block => (
                    <div
                      key={block.id}
                      className="p-2 rounded text-xs text-white relative group"
                      style={{ backgroundColor: block.color || '#3498db' }}
                    >
                      <p className="font-semibold">{block.title}</p>
                      <p className="text-xs opacity-90">
                        {format(new Date(block.start_time), 'HH:mm')} - 
                        {format(new Date(block.end_time), 'HH:mm')}
                      </p>
                      {block.type === 'meal' && (
                        <span className="absolute top-1 right-1 text-xs">🍽️</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => handleAddBlock(dayKeys[index])}
                className="mt-4 w-full text-sm text-olympus-gold hover:text-olympus-gold-light"
              >
                + {t('addBlock')}
              </button>
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
