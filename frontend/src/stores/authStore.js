import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
          set({ user: data.user, token: data.token, loading: false })
          return data
        } catch (error) {
          set({ error: error.response?.data?.error || 'Login failed', loading: false })
          throw error
        }
      },

      register: async (email, password, username) => {
        set({ loading: true, error: null })
        try {
          const { data } = await api.post('/auth/register', { email, password, username })
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
          set({ user: data.user, token: data.token, loading: false })
          return data
        } catch (error) {
          set({ error: error.response?.data?.error || 'Registration failed', loading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null })
      },

      fetchUser: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data })
        } catch (error) {
          set({ user: null })
        }
      },

      updateUser: async (updates) => {
        try {
          const { data } = await api.put('/auth/me', updates)
          set({ user: data })
          return data
        } catch (error) {
          throw error
        }
      },

      refreshAccessToken: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const { data } = await api.post('/auth/refresh', { refreshToken })
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
          set({ token: data.token })
          return data.token
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          set({ user: null, token: null })
          throw error
        }
      }
    }),
    {
      name: 'auth-storage',
      partialPersist: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
)
