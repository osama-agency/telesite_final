import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface UserProfile {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  organization: string | null
  phoneNumber: string | null
  address: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface ProfileUpdateData {
  firstName: string
  lastName: string
  email: string
  organization: string
  phoneNumber: string
  address: string
}

// Дефолтный обезличенный аватар в стиле Sneat
const DEFAULT_AVATAR_URL = '/images/avatars/default.svg'

interface ProfileState {
  // Core state
  profile: UserProfile | null
  loading: boolean
  error: string | null
  lastFetch: number | null

  // Optimistic updates
  optimisticProfile: UserProfile | null
  isOptimistic: boolean

  // Actions
  setProfile: (profile: UserProfile) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Optimistic actions
  setOptimisticProfile: (profile: UserProfile) => void
  clearOptimistic: () => void

  // Utils
  shouldRefetch: () => boolean
  getCurrentProfile: () => UserProfile | null
  getDisplayName: () => string
  getAvatarUrl: () => string
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      immer((set, get) => ({
        profile: null,
        loading: false,
        error: null,
        lastFetch: null,
        optimisticProfile: null,
        isOptimistic: false,

        setProfile: (profile) =>
          set((state) => {
            state.profile = profile
            state.lastFetch = Date.now()
            state.error = null
            state.optimisticProfile = null
            state.isOptimistic = false
          }),

        setLoading: (loading) =>
          set((state) => {
            state.loading = loading
          }),

        setError: (error) =>
          set((state) => {
            state.error = error
            state.loading = false
            state.optimisticProfile = null
            state.isOptimistic = false
          }),

        setOptimisticProfile: (profile) =>
          set((state) => {
            state.optimisticProfile = profile
            state.isOptimistic = true
          }),

        clearOptimistic: () =>
          set((state) => {
            state.optimisticProfile = null
            state.isOptimistic = false
          }),

        shouldRefetch: () => {
          const { lastFetch } = get()

          if (!lastFetch) return true

          return Date.now() - lastFetch > CACHE_DURATION
        },

        getCurrentProfile: () => {
          const { optimisticProfile, profile } = get()

          return optimisticProfile || profile
        },

        getDisplayName: () => {
          const currentProfile = get().getCurrentProfile()

          if (currentProfile?.firstName || currentProfile?.lastName) {
            const fullName = `${currentProfile.firstName || ''} ${currentProfile.lastName || ''}`.trim()

            return fullName || 'Пользователь'
          }

          return 'Пользователь'
        },

        getAvatarUrl: () => {
          const currentProfile = get().getCurrentProfile()

          if (currentProfile?.avatarUrl && currentProfile.avatarUrl !== DEFAULT_AVATAR_URL) {
            // Если это ссылка из uploads, добавляем базовый URL
            if (currentProfile.avatarUrl.startsWith('/uploads/')) {
              return `http://localhost:3011${currentProfile.avatarUrl}`
            }
            // Если это внешняя ссылка или CDN
            return currentProfile.avatarUrl
          }
          return DEFAULT_AVATAR_URL
        }
      })),
      {
        name: 'profile-storage',
        partialize: (state) => ({
          profile: state.profile,
          lastFetch: state.lastFetch
        }),
      }
    ),
    { name: 'profile-store' }
  )
)
