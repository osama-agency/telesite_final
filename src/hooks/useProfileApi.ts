import { useSession } from 'next-auth/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { useProfileStore, type UserProfile, type ProfileUpdateData } from '@/stores/profileStore'

const API_BASE_URL = 'http://localhost:3011/api'

// Query Keys
export const profileKeys = {
  profile: (userId: string) => ['profile', userId] as const,
}

interface UploadAvatarResponse {
  avatarUrl: string
  user: UserProfile
}

// API функции
const profileApi = {
  // Получить профиль
  async getProfile(userId: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`)

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    return response.json()
  },

  // Обновить профиль
  async updateProfile(userId: string, data: ProfileUpdateData): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()

      throw new Error(`Failed to update profile: ${response.status} - ${errorText}`)
    }

    return response.json()
  },

  // Загрузить аватар
  async uploadAvatar(userId: string, file: File): Promise<UploadAvatarResponse> {
    const formData = new FormData()

    formData.append('avatar', file)

    const response = await fetch(`${API_BASE_URL}/user/profile/${userId}/avatar`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()

      throw new Error(`Failed to upload avatar: ${response.status} - ${errorText}`)
    }

    return response.json()
  },

  // Сбросить аватар
  async resetAvatar(userId: string): Promise<UploadAvatarResponse> {
    const response = await fetch(`${API_BASE_URL}/user/profile/${userId}/avatar`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorText = await response.text()

      throw new Error(`Failed to reset avatar: ${response.status} - ${errorText}`)
    }

    return response.json()
  },
}

// Хук для получения ID пользователя
function useUserId() {
  const { data: session } = useSession()

  return session?.user?.email
    ? session.user.email.replace('@', '_at_').replace(/\./g, '_')
    : 'default-user'
}

// Главный хук для работы с профилем
export function useProfileApi() {
  const userId = useUserId()
  const queryClient = useQueryClient()
  const {
    setProfile,
    setLoading,
    setError,
    setOptimisticProfile,
    clearOptimistic,
    shouldRefetch,
    getCurrentProfile
  } = useProfileStore()

  // Query для загрузки профиля
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: profileKeys.profile(userId),
    queryFn: () => profileApi.getProfile(userId),
    enabled: shouldRefetch(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      setProfile(data)
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Unknown error')
    },
  })

  // Mutation для обновления профиля
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileUpdateData) => profileApi.updateProfile(userId, data),
    onMutate: async (newData) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey: profileKeys.profile(userId) })

      // Сохраняем предыдущие данные
      const previousProfile = getCurrentProfile()

      // Optimistic update
      if (previousProfile) {
        const optimisticProfile: UserProfile = {
          ...previousProfile,
          ...newData,
          updatedAt: new Date().toISOString()
        }

        setOptimisticProfile(optimisticProfile)
      }

      return { previousProfile }
    },
    onError: (err, variables, context) => {
      // Откатываем optimistic update
      clearOptimistic()

      // Восстанавливаем кэш
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.profile(userId), context.previousProfile)
      }

      const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении профиля'

      setError(errorMessage)
      toast.error(errorMessage)
    },
    onSuccess: (data) => {
      // Очищаем optimistic update
      clearOptimistic()

      // Обновляем кэш
      queryClient.setQueryData(profileKeys.profile(userId), data)
      setProfile(data)

      toast.success('Профиль успешно обновлён')
    },
    onSettled: () => {
      // Перезагружаем данные для синхронизации
      queryClient.invalidateQueries({ queryKey: profileKeys.profile(userId) })
    },
  })

  // Mutation для загрузки аватара
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(userId, file),
    onMutate: async () => {
      setLoading(true)

      await queryClient.cancelQueries({ queryKey: profileKeys.profile(userId) })
    },
    onError: (err) => {
      setLoading(false)

      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке аватара'

      setError(errorMessage)
      toast.error(errorMessage)
    },
    onSuccess: (data) => {
      setLoading(false)

      // Обновляем профиль с новым аватаром
      queryClient.setQueryData(profileKeys.profile(userId), data.user)
      setProfile(data.user)

      toast.success('Аватар успешно загружен')
    },
  })

  // Mutation для сброса аватара
  const resetAvatarMutation = useMutation({
    mutationFn: () => profileApi.resetAvatar(userId),
    onMutate: async () => {
      setLoading(true)

      await queryClient.cancelQueries({ queryKey: profileKeys.profile(userId) })
    },
    onError: (err) => {
      setLoading(false)

      const errorMessage = err instanceof Error ? err.message : 'Ошибка при сбросе аватара'

      setError(errorMessage)
      toast.error(errorMessage)
    },
    onSuccess: (data) => {
      setLoading(false)

      // Обновляем профиль с дефолтным аватаром
      queryClient.setQueryData(profileKeys.profile(userId), data.user)
      setProfile(data.user)

      toast.success('Аватар сброшен')
    },
  })

  return {
    // Данные
    profile: getCurrentProfile(),
    isLoading: isLoading || updateProfileMutation.isPending || uploadAvatarMutation.isPending || resetAvatarMutation.isPending,
    error: error?.message || null,

    // Методы
    refetch,
    updateProfile: updateProfileMutation.mutate,
    uploadAvatar: uploadAvatarMutation.mutate,
    resetAvatar: resetAvatarMutation.mutate,

    // Состояния мутаций
    isUpdating: updateProfileMutation.isPending,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    isResettingAvatar: resetAvatarMutation.isPending,
  }
}
