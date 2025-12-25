import { create } from 'zustand'
import api from '../services/api'

export const useGroceryStore = create((set) => ({
  groceryList: null,
  loading: false,
  error: null,

  fetchGroceryList: async (weekStartDate) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/grocery/week/${weekStartDate}`)
      set({ groceryList: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error, loading: false })
    }
  },

  generateGroceryList: async (weekStartDate) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/grocery/generate', { week_start_date: weekStartDate })
      set({ groceryList: data, loading: false })
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to generate grocery list', loading: false })
      throw error
    }
  },

  toggleItem: async (listId, itemIndex) => {
    try {
      const { data } = await api.patch(`/grocery/${listId}/item/${itemIndex}`)
      set({ groceryList: data })
    } catch (error) {
      throw error
    }
  },

  addItem: async (listId, item) => {
    try {
      const { data } = await api.post(`/grocery/${listId}/item`, item)
      set({ groceryList: data })
    } catch (error) {
      throw error
    }
  },

  deleteItem: async (listId, itemIndex) => {
    try {
      const { data } = await api.delete(`/grocery/${listId}/item/${itemIndex}`)
      set({ groceryList: data })
    } catch (error) {
      throw error
    }
  }
}))
