import { useState, useEffect } from 'react'
import { useCalendarStore } from '../stores/calendarStore'
import { useMealStore } from '../stores/mealStore'
import { useWorkoutStore } from '../stores/workoutStore'
import { format, startOfWeek, addDays, addMinutes } from 'date-fns'
import Loading from '../components/shared/Loading'
import { useTranslation } from '../stores/languageStore'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, List, Download, ShoppingCart } from 'lucide-react'
import TimelineGrid from '../components/planner/TimelineGrid'
import ResourcePanel from '../components/planner/ResourcePanel'
import BlockEditModal from '../components/modals/BlockEditModal'
import GroceryListModal from '../components/modals/GroceryListModal'

// Helper function to get Monday of the week
const getMondayOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day // If Sunday, go back 6 days, else go back to Monday
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday
}

export default function WeekPlanner() {
  const { t } = useTranslation()
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    format(getMondayOfWeek(new Date()), 'yyyy-MM-dd')
  )
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false)
  // Set initial selected day to today's day of week (0=Monday, 6=Sunday)
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date()
    return (today.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
  })
  const [viewMode, setViewMode] = useState('timeline') // 'timeline' or 'grid'
  const [showResourcePanel, setShowResourcePanel] = useState(true)
  
  const { blocks, loading, fetchWeek, createBlock, updateBlock, deleteBlock, moveBlock } = useCalendarStore()
  const { recipes, fetchRecipes } = useMealStore()
  const { workouts, fetchWorkouts } = useWorkoutStore()

  useEffect(() => {
    fetchWeek(currentWeekStart)
    fetchRecipes()
    fetchWorkouts()
  }, [currentWeekStart, fetchWeek, fetchRecipes, fetchWorkouts])

  const days = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')]
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  // Parse currentWeekStart as local date to avoid timezone issues
  const weekStartDate = new Date(currentWeekStart + 'T00:00:00')
  const currentDate = addDays(weekStartDate, selectedDay)
  const currentDayBlocks = blocks
    .filter(block => block.day_of_week === dayKeys[selectedDay])
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))

  const handleResourceDrop = async (e) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (!data) return

    try {
      const resource = JSON.parse(data)
      
      // Calculate drop time based on mouse position
      const container = e.currentTarget
      const rect = container.getBoundingClientRect()
      const relativeY = e.clientY - rect.top
      
      // Account for padding and calculate minutes from midnight
      const HOUR_HEIGHT = 80 // Must match TimelineGrid
      const PADDING = 24 // Account for container padding
      const adjustedY = Math.max(0, relativeY - PADDING - 16) // 16px for time labels offset
      const minutesFromMidnight = Math.round((adjustedY / HOUR_HEIGHT) * 60)
      
      // Snap to 15-minute intervals
      const snappedMinutes = Math.round(minutesFromMidnight / 15) * 15
      
      // Create drop time at calculated position
      const dropTime = new Date(currentDate)
      const hours = Math.floor(snappedMinutes / 60)
      const minutes = snappedMinutes % 60
      dropTime.setHours(hours, minutes, 0, 0)

      let blockData = {
        day_of_week: dayKeys[selectedDay],
        week_start_date: currentWeekStart,
        start_time: dropTime.toISOString(),
        color: resource.resourceType === 'recipe' ? '#27ae60' : '#e74c3c'
      }

      if (resource.resourceType === 'recipe') {
        const duration = (resource.prep_time || 0) + (resource.cook_time || 0) || 60
        blockData = {
          ...blockData,
          title: resource.name,
          type: 'meal',
          end_time: addMinutes(dropTime, duration).toISOString(),
          notes: `Prep: ${resource.prep_time || 0}min | Cook: ${resource.cook_time || 0}min`,
          linked_recipe_ids: [resource.id]
        }
      } else if (resource.resourceType === 'workout') {
        const duration = resource.estimated_duration || 60
        blockData = {
          ...blockData,
          title: resource.name,
          type: 'workout',
          end_time: addMinutes(dropTime, duration).toISOString(),
          notes: resource.program_type || '',
          linked_workout_id: resource.id
        }
      }

      await createBlock(blockData)
    } catch (error) {
      console.error('Failed to create block from drop:', error)
    }
  }

  const handleTimeSlotClick = (clickTime) => {
    const endTime = addMinutes(clickTime, 60)
    setSelectedBlock({
      start_time: clickTime.toISOString(),
      end_time: endTime.toISOString(),
      day_of_week: dayKeys[selectedDay],
      week_start_date: currentWeekStart
    })
    setIsEditModalOpen(true)
  }

  const handleBlockClick = (block) => {
    setSelectedBlock(block)
    setIsEditModalOpen(true)
  }

  const handleBlockMove = async (blockId, newStartTime, newEndTime) => {
    try {
      await moveBlock(blockId, newStartTime.toISOString(), newEndTime.toISOString())
    } catch (error) {
      console.error('Failed to move block:', error)
    }
  }

  const handleBlockResize = async (blockId, startTime, endTime) => {
    try {
      await updateBlock(blockId, {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      })
    } catch (error) {
      console.error('Failed to resize block:', error)
    }
  }

  const handleBlockDuplicate = async (block) => {
    try {
      const { id, created_at, updated_at, ...blockData } = block
      const newBlock = {
        ...blockData,
        title: `${block.title} (Copy)`,
        day_of_week: block.day_of_week,
        week_start_date: currentWeekStart
      }
      await createBlock(newBlock)
    } catch (error) {
      console.error('Failed to duplicate block:', error)
    }
  }

  const handleSaveBlock = async (blockData) => {
    try {
      // For existing blocks, keep the original day_of_week
      // For new blocks, extract day_of_week from start_time
      let dayOfWeek
      if (blockData.id) {
        // Keep existing day_of_week for updates
        const existingBlock = blocks.find(b => b.id === blockData.id)
        dayOfWeek = existingBlock?.day_of_week || dayKeys[selectedDay]
      } else {
        // Calculate day_of_week for new blocks
        const startDate = new Date(blockData.start_time)
        const dayIndex = (startDate.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
        dayOfWeek = dayKeys[dayIndex]
      }
      
      // Prepare complete block data with correct day_of_week
      const completeBlockData = {
        ...blockData,
        day_of_week: dayOfWeek,
        week_start_date: currentWeekStart
      }
      
      const conflicts = getConflicts(completeBlockData)
      
      if (conflicts.length > 0 && !blockData.id) {
        const confirmed = window.confirm(
          `${t('schedulingConflict')}: ${t('conflictsWith')} ${conflicts.length} ${t('otherBlocks')}. ${t('continueAnyway')}?`
        )
        if (!confirmed) return
      }

      if (blockData.id) {
        await updateBlock(blockData.id, completeBlockData)
      } else {
        await createBlock(completeBlockData)
      }
    } catch (error) {
      console.error('Failed to save block:', error)
      throw error
    }
  }

  const getConflicts = (block) => {
    if (!block) return []
    const blockStart = new Date(block.start_time)
    const blockEnd = new Date(block.end_time)
    
    return blocks.filter(b => {
      if (b.id === block.id) return false
      if (b.day_of_week !== block.day_of_week) return false
      
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      
      return (blockStart < bEnd && blockEnd > bStart)
    })
  }

  const navigateWeek = (direction) => {
    const current = new Date(currentWeekStart + 'T00:00:00')
    const newDate = addDays(current, direction * 7)
    setCurrentWeekStart(format(newDate, 'yyyy-MM-dd'))
  }

  if (loading) return <Loading />

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3">
          <h1 className="text-2xl sm:text-3xl font-display text-olympus-navy flex items-center gap-2 sm:gap-3">
            <CalendarIcon size={28} className="text-olympus-gold sm:w-8 sm:h-8" />
            {t('weekPlanner')}
          </h1>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Grocery List button */}
            <button
              onClick={() => setIsGroceryModalOpen(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm"
              title={t('generateGroceryList')}
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">{t('groceryList')}</span>
              <span className="sm:hidden">Liste</span>
            </button>

            {/* CalDAV Subscription button - Hidden on mobile */}
            <button
              onClick={() => {
                const token = localStorage.getItem('token')
                const url = `${window.location.origin}/caldav/calendar.ics`
                window.open(url, '_blank')
              }}
              className="hidden md:flex px-4 py-2 bg-olympus-navy text-white rounded-lg hover:bg-olympus-navy/90 transition items-center gap-2 text-sm"
              title="Subscribe to calendar in iOS Calendar"
            >
              <Download size={16} />
              {t('subscribeCalendar') || 'Subscribe Calendar'}
            </button>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 rounded-md transition flex items-center gap-1.5 text-sm ${
                  viewMode === 'timeline'
                    ? 'bg-white shadow-sm text-olympus-navy font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={16} />
                <span className="hidden sm:inline">Timeline</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md transition flex items-center gap-1.5 text-sm ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-olympus-navy font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid size={16} />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Week navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-base sm:text-lg font-semibold text-olympus-navy flex-1 sm:flex-none text-center sm:text-left">
              {format(weekStartDate, 'MMM d')} - {format(addDays(weekStartDate, 6), 'MMM d, yyyy')}
            </div>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => {
                const today = new Date()
                const monday = getMondayOfWeek(today)
                setCurrentWeekStart(format(monday, 'yyyy-MM-dd'))
                // Set selected day to today's day of week (0=Monday, 6=Sunday)
                const dayIndex = (today.getDay() + 6) % 7
                setSelectedDay(dayIndex)
              }}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-olympus-gold text-white rounded-lg hover:bg-olympus-gold-light transition whitespace-nowrap"
            >
              {t('today')}
            </button>
          </div>

          <div className="text-xs sm:text-sm text-gray-600">
            {blocks.length} {t('blocksScheduled')}
          </div>
        </div>

        {/* Day tabs for timeline view */}
        {viewMode === 'timeline' && (
          <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            {days.map((day, index) => {
              const dayDate = addDays(weekStartDate, index)
              const dayBlockCount = blocks.filter(b => b.day_of_week === dayKeys[index]).length
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-lg transition text-left ${
                    selectedDay === index
                      ? 'bg-olympus-navy text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="font-semibold text-sm sm:text-base">{day}</div>
                  <div className="text-xs opacity-75 mt-0.5 sm:mt-1">
                    {format(dayDate, 'MMM d')}
                  </div>
                  {dayBlockCount > 0 && (
                    <div className={`text-xs mt-0.5 sm:mt-1 ${
                      selectedDay === index ? 'text-olympus-gold' : 'text-gray-500'
                    }`}>
                      {dayBlockCount} blocks
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Resource panel - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <ResourcePanel
            recipes={recipes}
            workouts={workouts}
            isOpen={showResourcePanel}
            onToggle={() => setShowResourcePanel(!showResourcePanel)}
            onDragStart={(item, type) => {
              // Optional: Add visual feedback
            }}
            onDragEnd={() => {
              // Optional: Remove visual feedback
            }}
          />
        </div>

        {/* Calendar view */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'timeline' ? (
            <div 
              className="h-full p-3 sm:p-6"
              onDrop={handleResourceDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <TimelineGrid
                date={currentDate}
                blocks={currentDayBlocks}
                onBlockClick={handleBlockClick}
                onBlockMove={handleBlockMove}
                onBlockResize={handleBlockResize}
                onBlockDelete={deleteBlock}
                onBlockDuplicate={handleBlockDuplicate}
                onTimeSlotClick={handleTimeSlotClick}
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-7 gap-4">
                {days.map((day, index) => {
                  const dayDate = addDays(weekStartDate, index)
                  const dayBlocks = blocks.filter(b => b.day_of_week === dayKeys[index])
                  
                  return (
                    <div
                      key={day}
                      className="olympus-card min-h-[400px]"
                      onDrop={(e) => {
                        setSelectedDay(index)
                        handleResourceDrop(e)
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <h3 className="font-semibold text-olympus-navy mb-1">{day}</h3>
                      <p className="text-xs text-gray-500 mb-4">{format(dayDate, 'MMM d')}</p>
                      
                      <div className="space-y-2">
                        {dayBlocks.length === 0 ? (
                          <p className="text-sm text-gray-400 italic text-center py-8">
                            {t('dropHere')}
                          </p>
                        ) : (
                          dayBlocks
                            .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                            .map(block => (
                              <div
                                key={block.id}
                                onClick={() => handleBlockClick(block)}
                                className="p-3 rounded-lg text-white cursor-pointer hover:shadow-lg transition"
                                style={{ backgroundColor: block.color }}
                              >
                                <p className="font-semibold text-sm">{block.title}</p>
                                <p className="text-xs opacity-90 mt-1">
                                  {format(new Date(block.start_time), 'HH:mm')} - {format(new Date(block.end_time), 'HH:mm')}
                                </p>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      <BlockEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedBlock(null)
        }}
        block={selectedBlock}
        conflicts={getConflicts(selectedBlock)}
        onSave={handleSaveBlock}
        onDelete={deleteBlock}
      />

      {/* Grocery List modal */}
      <GroceryListModal
        isOpen={isGroceryModalOpen}
        onClose={() => setIsGroceryModalOpen(false)}
        weekStartDate={currentWeekStart}
      />
    </div>
  )
}
