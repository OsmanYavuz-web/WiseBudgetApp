import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios'
import toast from 'react-hot-toast'

/**
 * Authentication Store
 * Kullanıcı kimlik doğrulama durumunu yönetir
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      // Kullanıcı girişi
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/api/auth/login', { email, password })
          const { user, token } = response.data.data

          set({ user, token, isLoading: false })
          toast.success('Giriş başarılı!')
          return true
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Giriş başarısız'
          toast.error(message)
          return false
        }
      },

      // Kullanıcı kaydı
      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/api/auth/register', { name, email, password })
          const { user, token } = response.data.data

          set({ user, token, isLoading: false })
          toast.success('Kayıt başarılı!')
          return true
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Kayıt başarısız'
          toast.error(message)
          return false
        }
      },

      // Kullanıcı çıkışı
      logout: () => {
        set({ user: null, token: null })
        toast.success('Çıkış yapıldı')
      },

      // Kullanıcı bilgilerini güncelle
      updateUser: (userData) => {
        set({ user: userData })
      },

      // Profil güncelleme
      updateProfile: async (data) => {
        set({ isLoading: true })
        try {
          const response = await api.put('/api/auth/update', data)
          const user = response.data.data

          set({ user, isLoading: false })
          toast.success('Profil güncellendi')
          return true
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Güncelleme başarısız'
          toast.error(message)
          return false
        }
      },

      // Şifre değiştirme
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true })
        try {
          await api.put('/api/auth/change-password', { currentPassword, newPassword })
          set({ isLoading: false })
          toast.success('Şifre değiştirildi')
          return true
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Şifre değiştirilemedi'
          toast.error(message)
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
)

