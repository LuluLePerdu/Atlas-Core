import { create } from 'zustand'
import api from '../services/api'

export const useMealStore = create((set) => ({
  recipes: [],
  mealPlan: null,
  loading: false,
  error: null,

  fetchRecipes: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/recipes')
      set({ recipes: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch recipes', loading: false })
    }
  },

  fetchMealPlan: async (weekStartDate) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/meal-plans/week/${weekStartDate}`)
      set({ mealPlan: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error, loading: false })
    }
  },

  createRecipe: async (recipeData) => {
    try {
      const { data } = await api.post('/recipes', recipeData)
      set((state) => ({ recipes: [...state.recipes, data] }))
      return data
    } catch (error) {
      throw error
    }
  },

  updateRecipe: async (id, updates) => {
    try {
      const { data } = await api.put(`/recipes/${id}`, updates)
      set((state) => ({
        recipes: state.recipes.map((r) => (r.id === id ? data : r))
      }))
      return data
    } catch (error) {
      throw error
    }
  },

  deleteRecipe: async (id) => {
    try {
      await api.delete(`/recipes/${id}`)
      set((state) => ({
        recipes: state.recipes.filter((r) => r.id !== id)
      }))
    } catch (error) {
      throw error
    }
  },

  saveMealPlan: async (weekStartDate, meals) => {
    try {
      const { data } = await api.post('/meal-plans', { week_start_date: weekStartDate, meals })
      set({ mealPlan: data })
      return data
    } catch (error) {
      throw error
    }
  }
}))
