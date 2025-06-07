'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'

// Form Imports
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useProfileStore } from '@/stores/profileStore'
import { useProfileApi } from '@/hooks/useProfileApi'

// Schema Imports
import { profileUpdateSchema, validateAvatar, type ProfileUpdateFormData } from '@/schemas/profileSchema'

// Utils Imports
import { toast } from 'react-toastify'

const AccountDetailsModern = () => {
  // Hooks
  const { profile, isLoading, error, updateProfile, uploadAvatar, resetAvatar, isUpdating, isUploadingAvatar } = useProfileApi()
  const { getAvatarUrl, getDisplayName } = useProfileStore()

  // States
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isValid }
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      organization: '',
      phoneNumber: '',
      address: ''
    }
  })

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        organization: profile.organization || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || ''
      })
    }
  }, [profile, reset])

  // Clear avatar preview when profile avatar changes
  useEffect(() => {
    setAvatarPreview(null)
  }, [profile?.avatarUrl])

  const handleFormSubmit = (data: ProfileUpdateFormData) => {
    updateProfile(data)
  }

  const handleAvatarChange = async (file: File) => {
    // Validate file
    const validation = validateAvatar(file)

    if (!validation.success) {
      toast.error(validation.error.errors[0].message)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    uploadAvatar(file)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleAvatarChange(file)
    }
    // Reset input
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleAvatarChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleResetAvatar = () => {
    setAvatarPreview(null)
    resetAvatar()
  }

  const currentAvatarUrl = avatarPreview || getAvatarUrl()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <CircularProgress />
          <Typography variant="body1" className="ml-4">
            Загрузка профиля...
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Avatar Section */}
        <Box className="flex max-sm:flex-col items-center gap-6 mb-6">
          <Box
            className={`relative transition-all duration-200 ${isDragOver ? 'scale-105 opacity-80' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  size="small"
                  component="label"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <i className="bx-camera text-base" />
                  <input
                    hidden
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileInputChange}
                  />
                </IconButton>
              }
            >
              <Avatar
                src={currentAvatarUrl}
                alt={getDisplayName()}
                sx={{
                  width: 120,
                  height: 120,
                  border: isDragOver ? '3px dashed' : '3px solid',
                  borderColor: isDragOver ? 'primary.main' : 'transparent',
                  transition: 'border-color 0.2s'
                }}
              />
            </Badge>
          </Box>

          <Box className="flex flex-grow flex-col gap-4">
            <Box className="flex flex-col sm:flex-row gap-3">
              <Button
                component="label"
                variant="contained"
                disabled={isUploadingAvatar}
                startIcon={
                  isUploadingAvatar ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <i className="bx-upload" />
                  )
                }
              >
                {isUploadingAvatar ? 'Загрузка...' : 'Загрузить фото'}
                <input
                  hidden
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleFileInputChange}
                />
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                onClick={handleResetAvatar}
                disabled={isUploadingAvatar}
                startIcon={<i className="bx-reset" />}
              >
                Сбросить
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Поддерживаются форматы: JPG, PNG, GIF. Максимальный размер: 800KB
            </Typography>

            <Typography variant="body2" color="text.secondary">
              💡 Вы можете перетащить файл прямо на аватар или нажать "Сбросить" для анонимного силуэта
            </Typography>
          </Box>
        </Box>

        <Divider className="mb-6" />

        {/* Form Section */}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Имя *"
                    placeholder="Иван"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Фамилия *"
                    placeholder="Иванов"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Email *"
                    placeholder="ivan.ivanov@example.com"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="organization"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Организация"
                    placeholder="Название компании"
                    error={!!errors.organization}
                    helperText={errors.organization?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Номер телефона"
                    placeholder="+7 (999) 123-45-67"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label="Адрес"
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isDirty || !isValid || isUpdating}
                  startIcon={
                    isUpdating ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <i className="bx-save" />
                    )
                  }
                >
                  {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>

                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  disabled={!isDirty || isUpdating}
                  onClick={() => reset()}
                  startIcon={<i className="bx-reset" />}
                >
                  Отменить
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" className="mt-2">
                * Обязательные поля
              </Typography>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetailsModern
