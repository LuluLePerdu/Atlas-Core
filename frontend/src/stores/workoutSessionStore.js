import { create } from 'zustand'
import api from '../services/api'

export const useWorkoutSessionStore = create((set, get) => ({
  sessions: [],
  currentSession: null,
  progressStats: null,
  loading: false,
  error: null,

  fetchSessions: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams(filters).toString()
      const { data } = await api.get(`/workout-sessions?${params}`)
      set({ sessions: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch sessions', loading: false })
    }
  },

  createSession: async (sessionData) => {
    try {
      const { data } = await api.post('/workout-sessions', sessionData)
      set((state) => ({ sessions: [data, ...state.sessions] }))
      return data
    } catch (error) {
      throw error
    }
  },

  updateSession: async (id, updates) => {
    try {
      const { data } = await api.put(`/workout-sessions/${id}`, updates)
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? data : s)),
        currentSession: state.currentSession?.id === id ? data : state.currentSession
      }))
      return data
    } catch (error) {
      throw error
    }
  },

  markCompleted: async (id, exercisesCompleted, notes = null, durationActual = null) => {
    try {
      const { data } = await api.post(`/workout-sessions/${id}/complete`, {
        exercises_completed: exercisesCompleted,
        notes,
        duration_actual: durationActual
      })
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? data : s)),
        currentSession: null
      }))
      return data
    } catch (error) {
      throw error
    }
  },

  deleteSession: async (id) => {
    try {
      await api.delete(`/workout-sessions/${id}`)
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id)
      }))
    } catch (error) {
      throw error
    }
  },

  fetchDetailedHistory: async (startDate, endDate) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/workout-sessions/history/detailed', {
        params: { start_date: startDate, end_date: endDate }
      })
      set({ sessions: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch history', loading: false })
      throw error
    }
  },

  fetchProgressStats: async (workoutId = null) => {
    set({ loading: true, error: null })
    try {
      const params = workoutId ? { workout_id: workoutId } : {}
      const { data } = await api.get('/workout-sessions/stats/progress', { params })
      set({ progressStats: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch stats', loading: false })
      throw error
    }
  },

  setCurrentSession: (session) => set({ currentSession: session }),

  clearCurrentSession: () => set({ currentSession: null })
}))
