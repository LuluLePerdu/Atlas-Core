import { create } from 'zustand'
import api from '../services/api'

export const useBudgetStore = create((set, get) => ({
  categories: [],
  transactions: [],
  monthlyBudgets: [],
  summary: { income: 0, expenses: 0, balance: 0 },
  loading: false,
  error: null,

  // Fetch categories
  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get('/budget/categories')
      set({ categories: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch categories', loading: false })
    }
  },

  // Create default categories
  createDefaultCategories: async () => {
    try {
      const { data } = await api.post('/budget/categories/defaults')
      set({ categories: data })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to create default categories' })
    }
  },

  // Fetch transactions
  fetchTransactions: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('start_date', filters.startDate)
      if (filters.endDate) params.append('end_date', filters.endDate)
      if (filters.type) params.append('type', filters.type)
      if (filters.categoryId) params.append('category_id', filters.categoryId)
      
      const { data } = await api.get(`/budget/transactions?${params}`)
      set({ transactions: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch transactions', loading: false })
    }
  },

  // Create transaction
  createTransaction: async (transaction) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/budget/transactions', transaction)
      set(state => ({ 
        transactions: [data, ...state.transactions],
        loading: false 
      }))
      // Refresh summary
      await get().fetchSummary(new Date().getFullYear(), new Date().getMonth() + 1)
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to create transaction', loading: false })
      throw error
    }
  },

  // Update transaction
  updateTransaction: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.put(`/budget/transactions/${id}`, updates)
      set(state => ({
        transactions: state.transactions.map(t => t.id === id ? data : t),
        loading: false
      }))
      await get().fetchSummary(new Date().getFullYear(), new Date().getMonth() + 1)
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update transaction', loading: false })
      throw error
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/budget/transactions/${id}`)
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        loading: false
      }))
      await get().fetchSummary(new Date().getFullYear(), new Date().getMonth() + 1)
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to delete transaction', loading: false })
      throw error
    }
  },

  // Fetch summary for a month
  fetchSummary: async (year, month) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/budget/summary/${year}/${month}`)
      set({ summary: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch summary', loading: false })
    }
  },

  // Fetch transactions for a month
  fetchMonthTransactions: async (year, month) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/budget/transactions/month/${year}/${month}`)
      set({ transactions: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch transactions', loading: false })
    }
  },

  // Fetch category breakdown
  fetchCategoryBreakdown: async (year, month) => {
    try {
      const { data } = await api.get(`/budget/transactions/breakdown/${year}/${month}`)
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch breakdown' })
      return []
    }
  },

  // Fetch monthly budgets
  fetchMonthlyBudgets: async (year, month) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get(`/budget/budgets/${year}/${month}`)
      set({ monthlyBudgets: data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch budgets', loading: false })
    }
  },

  // Set monthly budget
  setMonthlyBudget: async (categoryId, year, month, budgetAmount) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/budget/budgets', {
        category_id: categoryId,
        year,
        month,
        budget_amount: budgetAmount
      })
      set(state => ({
        monthlyBudgets: state.monthlyBudgets.some(b => b.category_id === categoryId)
          ? state.monthlyBudgets.map(b => b.category_id === categoryId ? data : b)
          : [...state.monthlyBudgets, data],
        loading: false
      }))
      return data
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to set budget', loading: false })
      throw error
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}))
