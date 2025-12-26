import { create } from 'zustand'
import api from '../services/api'

export const useCalendarStore = create((set, get) => ({
  blocks: [],
  selectedBlock: null,
  currentWeek: null,
  loading: false,
  error: null,

  fetchWeek: async (weekStartDate) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/calendar/week/${weekStartDate}`)
      set({ blocks: data, currentWeek: weekStartDate, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch calendar', loading: false })
    }
  },

  createBlock: async (blockData) => {
    try {
      const conflicts = get().getConflicts(blockData)
      
      const { data } = await api.post('/calendar/block', blockData)
      set((state) => ({ blocks: [...state.blocks, data] }))
      
      return { block: data, conflicts }
    } catch (error) {
      throw error
    }
  },

  updateBlock: async (id, updates) => {
    try {
      const { data } = await api.put(`/calendar/block/${id}`, updates)
      set((state) => ({
        blocks: state.blocks.map((block) => (block.id === id ? data : block))
      }))
      return data
    } catch (error) {
      throw error
    }
  },

  deleteBlock: async (id) => {
    try {
      await api.delete(`/calendar/block/${id}`)
      set((state) => ({
        blocks: state.blocks.filter((block) => block.id !== id)
      }))
    } catch (error) {
      throw error
    }
  },

  moveBlock: async (id, start_time, end_time) => {
    try {
      const { data } = await api.patch(`/calendar/block/${id}/move`, { start_time, end_time })
      set((state) => ({
        blocks: state.blocks.map((block) => (block.id === id ? data : block))
      }))
      return data
    } catch (error) {
      throw error
    }
  },

  // Get conflicting blocks for a given block
  getConflicts: (block) => {
    if (!block || !block.start_time || !block.end_time) return []
    
    const blocks = get().blocks
    const blockStart = new Date(block.start_time)
    const blockEnd = new Date(block.end_time)
    
    return blocks.filter(b => {
      if (b.id === block.id) return false
      if (b.day_of_week !== block.day_of_week) return false
      
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      
      // Check if there's overlap
      return (blockStart < bEnd && blockEnd > bStart)
    })
  },

  // Resolve conflicts by moving blocks
  resolveConflict: async (blockId, strategy = 'push') => {
    const state = get()
    const block = state.blocks.find(b => b.id === blockId)
    if (!block) return

    const conflicts = state.getConflicts(block)
    if (conflicts.length === 0) return

    if (strategy === 'push') {
      // Push conflicting blocks forward
      const blockEnd = new Date(block.end_time)
      
      for (const conflict of conflicts) {
        const conflictStart = new Date(conflict.start_time)
        const conflictEnd = new Date(conflict.end_time)
        const duration = conflictEnd - conflictStart
        
        const newStart = new Date(blockEnd)
        const newEnd = new Date(blockEnd.getTime() + duration)
        
        await state.moveBlock(conflict.id, newStart.toISOString(), newEnd.toISOString())
      }
    }
  },

  createBlockWithWorkout: async (blockData) => {
    try {
      const { data } = await api.post('/calendar/block', blockData)
      set((state) => ({ blocks: [...state.blocks, data] }))
      return data
    } catch (error) {
      throw error
    }
  },

  linkWorkout: async (blockId, workoutId) => {
    try {
      const { data } = await api.post(`/calendar/block/${blockId}/link-workout`, { workout_id: workoutId })
      set((state) => ({
        blocks: state.blocks.map((block) => (block.id === blockId ? data : block))
      }))
      return data
    } catch (error) {
      throw error
    }
  },

  unlinkWorkout: async (blockId) => {
    try {
      const { data } = await api.delete(`/calendar/block/${blockId}/link-workout`)
      set((state) => ({
        blocks: state.blocks.map((block) => (block.id === blockId ? data : block))
      }))
      return data
    } catch (error) {
      throw error
    }
  },

  fetchBlocksWithWorkouts: async (startDate, endDate) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/calendar/blocks-with-workouts', {
        params: { start_date: startDate, end_date: endDate }
      })
      set({ blocks: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch calendar', loading: false })
      throw error
    }
  },

  setSelectedBlock: (block) => set({ selectedBlock: block })
}))
