import { useState, useRef, useEffect } from 'react'
import { format, addMinutes, differenceInMinutes, isSameDay } from 'date-fns'
import { Clock, Edit2, Trash2, Copy, UtensilsCrossed, Dumbbell, Briefcase, Moon, Pin, AlertTriangle } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'

export default function TimelineGrid({ 
  date, 
  blocks = [], 
  onBlockClick, 
  onBlockMove, 
  onBlockResize,
  onBlockDelete,
  onBlockDuplicate,
  onTimeSlotClick 
}) {
  const { t } = useTranslation()
  const [draggedBlock, setDraggedBlock] = useState(null)
  const [resizingBlock, setResizingBlock] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const gridRef = useRef(null)

  // Generate hours (0h to 23h - full 24 hours)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const HOUR_HEIGHT = 80 // pixels per hour
  const MINUTE_HEIGHT = HOUR_HEIGHT / 60

  const getBlockStyle = (block) => {
    const startTime = new Date(block.start_time)
    const endTime = new Date(block.end_time)
    
    // Calculate position from midnight (0h)
    const startHour = startTime.getHours()
    const startMinute = startTime.getMinutes()
    const totalStartMinutes = startHour * 60 + startMinute
    
    const duration = differenceInMinutes(endTime, startTime)
    
    return {
      top: `${totalStartMinutes * MINUTE_HEIGHT}px`,
      height: `${duration * MINUTE_HEIGHT}px`,
      backgroundColor: block.color || '#3498db'
    }
  }

  const snapToGrid = (minutes) => {
    // Snap to 15-minute intervals
    return Math.round(minutes / 15) * 15
  }

  const handleBlockMouseDown = (e, block) => {
    if (e.target.classList.contains('resize-handle')) return
    
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setDraggedBlock(block)
  }

  const handleMouseMove = (e) => {
    if (!draggedBlock && !resizingBlock) return

    const gridRect = gridRef.current.getBoundingClientRect()
    const relativeY = e.clientY - gridRect.top - dragOffset.y

    if (draggedBlock) {
      // Calculate new time based on position
      const minutesFromStart = snapToGrid(relativeY / MINUTE_HEIGHT)
      const baseDate = new Date(date)
      baseDate.setHours(0, 0, 0, 0)
      const newStartTime = addMinutes(baseDate, minutesFromStart)
      
      // Update block position visually
      const blockElement = document.getElementById(`block-${draggedBlock.id}`)
      if (blockElement) {
        blockElement.style.top = `${minutesFromStart * MINUTE_HEIGHT}px`
      }
    }

    if (resizingBlock) {
      const blockTop = parseFloat(document.getElementById(`block-${resizingBlock.id}`).style.top)
      const newHeight = Math.max(30, e.clientY - gridRect.top - blockTop)
      const duration = snapToGrid(newHeight / MINUTE_HEIGHT)
      
      const blockElement = document.getElementById(`block-${resizingBlock.id}`)
      if (blockElement) {
        blockElement.style.height = `${duration * MINUTE_HEIGHT}px`
      }
    }
  }

  const handleMouseUp = (e) => {
    if (draggedBlock) {
      const gridRect = gridRef.current.getBoundingClientRect()
      const relativeY = e.clientY - gridRect.top - dragOffset.y
      const minutesFromStart = snapToGrid(relativeY / MINUTE_HEIGHT)
      
      const startTime = new Date(draggedBlock.start_time)
      const endTime = new Date(draggedBlock.end_time)
      const duration = differenceInMinutes(endTime, startTime)
      
      const baseDate = new Date(date)
      baseDate.setHours(0, 0, 0, 0)
      const newStartTime = addMinutes(baseDate, minutesFromStart)
      const newEndTime = addMinutes(newStartTime, duration)
      
      onBlockMove?.(draggedBlock.id, newStartTime, newEndTime)
      setDraggedBlock(null)
    }

    if (resizingBlock) {
      const blockElement = document.getElementById(`block-${resizingBlock.id}`)
      const newHeight = parseFloat(blockElement.style.height)
      const duration = Math.round(newHeight / MINUTE_HEIGHT)
      
      const startTime = new Date(resizingBlock.start_time)
      const newEndTime = addMinutes(startTime, duration)
      
      onBlockResize?.(resizingBlock.id, startTime, newEndTime)
      setResizingBlock(null)
    }
  }

  useEffect(() => {
    if (draggedBlock || resizingBlock) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedBlock, resizingBlock])

  const handleTimeSlotClick = (hour, e) => {
    if (draggedBlock || resizingBlock) return
    
    const rect = gridRef.current.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const minutesFromStart = snapToGrid(relativeY / MINUTE_HEIGHT)
    const baseDate = new Date(date)
    baseDate.setHours(0, 0, 0, 0)
    const clickTime = addMinutes(baseDate, minutesFromStart)
    
    onTimeSlotClick?.(clickTime)
  }

  const getConflictingBlocks = (block) => {
    return blocks.filter(b => {
      if (b.id === block.id) return false
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      const blockStart = new Date(block.start_time)
      const blockEnd = new Date(block.end_time)
      
      return (blockStart < bEnd && blockEnd > bStart)
    })
  }

  return (
    <div className="relative flex-1">
      {/* Time labels */}
      <div className="absolute left-0 top-0 w-16 text-xs text-gray-500">
        {hours.map(hour => (
          <div
            key={hour}
            className="relative"
            style={{ height: `${HOUR_HEIGHT}px` }}
          >
            <div className="absolute -top-2">
              {format(new Date().setHours(hour, 0), 'HH:mm')}
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div 
        ref={gridRef}
        className="ml-16 relative border-l border-gray-200"
        style={{ height: `${hours.length * HOUR_HEIGHT}px` }}
      >
        {/* Hour lines */}
        {hours.map((hour, index) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-gray-200 hover:bg-blue-50/30 cursor-pointer transition"
            style={{ top: `${index * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
            onClick={(e) => handleTimeSlotClick(hour, e)}
          >
            {/* 15-minute marks */}
            <div className="absolute left-0 right-0 border-t border-gray-100" style={{ top: '25%' }} />
            <div className="absolute left-0 right-0 border-t border-gray-100" style={{ top: '50%' }} />
            <div className="absolute left-0 right-0 border-t border-gray-100" style={{ top: '75%' }} />
          </div>
        ))}

        {/* Current time indicator */}
        {isSameDay(new Date(), date) && (() => {
          const now = new Date()
          const currentMinutes = (now.getHours() - 4) * 60 + now.getMinutes()
          if (currentMinutes >= 0 && currentMinutes <= hours.length * 60) {
            return (
              <div
                className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                style={{ top: `${currentMinutes * MINUTE_HEIGHT}px` }}
              >
                <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full" />
              </div>
            )
          }
        })()}

        {/* Blocks */}
        {blocks.map(block => {
          const conflicts = getConflictingBlocks(block)
          const hasConflict = conflicts.length > 0
          const style = getBlockStyle(block)
          
          return (
            <div
              key={block.id}
              id={`block-${block.id}`}
              className={`absolute left-1 right-1 rounded-lg shadow-md cursor-move transition-shadow hover:shadow-lg group ${
                hasConflict ? 'ring-2 ring-red-500' : ''
              }`}
              style={style}
              onMouseDown={(e) => handleBlockMouseDown(e, block)}
            >
              <div className="p-2 h-full flex flex-col text-white overflow-hidden">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{block.title}</h4>
                    <p className="text-xs opacity-90 flex items-center gap-1">
                      <Clock size={10} />
                      {format(new Date(block.start_time), 'HH:mm')} - {format(new Date(block.end_time), 'HH:mm')}
                    </p>
                  </div>
                  
                  {/* Type icon */}
                  <span className="flex-shrink-0">
                    {block.type === 'meal' && <UtensilsCrossed size={16} className="text-white" />}
                    {block.type === 'workout' && <Dumbbell size={16} className="text-white" />}
                    {block.type === 'work' && <Briefcase size={16} className="text-white" />}
                    {block.type === 'sleep' && <Moon size={16} className="text-white" />}
                    {block.type === 'other' && <Pin size={16} className="text-white" />}
                  </span>
                </div>

                {/* Actions - shown on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBlockClick?.(block)
                    }}
                    className="p-1 bg-white/20 hover:bg-white/30 rounded backdrop-blur-sm"
                    title={t('edit')}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBlockDuplicate?.(block)
                    }}
                    className="p-1 bg-white/20 hover:bg-white/30 rounded backdrop-blur-sm"
                    title={t('duplicate')}
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBlockDelete?.(block.id)
                    }}
                    className="p-1 bg-red-500/50 hover:bg-red-500/70 rounded backdrop-blur-sm"
                    title={t('delete')}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Notes preview */}
                {block.notes && (
                  <p className="text-xs opacity-75 truncate mt-auto">
                    {block.notes}
                  </p>
                )}

                {/* Conflict warning */}
                {hasConflict && (
                  <div className="absolute bottom-1 left-1 right-1 bg-red-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <AlertTriangle size={12} />
                    <span>{t('conflictWith')} {conflicts.length} {t('blocks')}</span>
                  </div>
                )}
              </div>

              {/* Resize handle */}
              <div
                className="resize-handle absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-white/30 transition"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setResizingBlock(block)
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
