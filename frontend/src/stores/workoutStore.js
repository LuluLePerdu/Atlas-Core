import { create } from 'zustand'
import api from '../services/api'

export const useWorkoutStore = create((set) => ({
  workouts: [],
  exercises: [],
  sessions: [],
  loading: false,
  error: null,

  fetchWorkouts: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/workouts')
      set({ workouts: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch workouts', loading: false })
    }
  },

  fetchExercises: async () => {
    try {
      const { data } = await api.get('/exercises')
      set({ exercises: data })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch exercises' })
    }
  },

  createWorkout: async (workoutData) => {
    try {
      const { data } = await api.post('/workouts', workoutData)
      set((state) => ({ workouts: [...state.workouts, data] }))
      return data
    } catch (error) {
      throw error
    }
  },

  updateWorkout: async (id, updates) => {
    try {
      const { data } = await api.put(`/workouts/${id}`, updates)
      set((state) => ({
        workouts: state.workouts.map((w) => (w.id === id ? data : w))
      }))
      return data
    } catch (error) {
      throw error
    }
  },

  deleteWorkout: async (id) => {
    try {
      await api.delete(`/workouts/${id}`)
      set((state) => ({
        workouts: state.workouts.filter((w) => w.id !== id)
      }))
    } catch (error) {
      throw error
    }
  },

  createExercise: async (exerciseData) => {
    try {
      const { data } = await api.post('/exercises', exerciseData)
      set((state) => ({ exercises: [...state.exercises, data] }))
      return data
    } catch (error) {
      throw error
    }
  }
}))
