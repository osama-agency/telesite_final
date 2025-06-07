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

// Third-party Imports
import { useSession } from 'next-auth/react'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useProfile } from '@/hooks/useProfile'
import type { ProfileUpdateData } from '@/hooks/useProfile'

// Utils Imports
import { profileToasts } from '@/utils/toast'

type Data = {
  firstName: string
  lastName: string
  email: string
  organization: string
  phoneNumber: string
  address: string
}

const AccountDetails = () => {
  // Hooks
  const { data: session } = useSession()
  const { profile, loading, error, updateProfile, uploadAvatar, resetAvatar } = useProfile()

  // States
  const [formData, setFormData] = useState<Data>({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    phoneNumber: '',
    address: ''
  })
  const [fileInput, setFileInput] = useState<string>('')
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')
  const [saving, setSaving] = useState(false)

      // Обновить форму когда профиль загружен или сессия изменилась
  useEffect(() => {
    console.log('Profile updated:', profile)
    console.log('Session data:', session)

    if (profile) {
      // Используем данные из профиля (из базы данных)
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        organization: profile.organization || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || ''
      })

      // Устанавливаем аватар с сервера (если он с uploads, добавляем базовый URL)
      const avatarUrl = profile.avatarUrl || '/images/avatars/1.png'
      if (avatarUrl.startsWith('/uploads/')) {
        setImgSrc(`http://localhost:3011${avatarUrl}`)
      } else {
        setImgSrc(avatarUrl)
      }
    } else if (session?.user) {
      // Если профиль не найден, используем данные из сессии для инициализации
      const fullName = session.user.name || ''
      const nameParts = fullName.split(' ')

      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: session.user.email || '',
        organization: session.user.name === 'Root Admin' ? 'Root Organization' : '',
        phoneNumber: '',
        address: ''
      })

      setImgSrc(session.user.image || '/images/avatars/1.png')
    }
  }, [profile, session])

  const handleFormChange = (field: keyof Data, value: Data[keyof Data]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFileInputChange = async (file: ChangeEvent) => {
    const { files } = file.target as HTMLInputElement

    if (files && files.length !== 0) {
      const selectedFile = files[0]

      // Показываем превью
      const reader = new FileReader()
      reader.onload = () => setImgSrc(reader.result as string)
      reader.readAsDataURL(selectedFile)

            try {
        setSaving(true)
        console.log('Uploading file:', selectedFile.name, selectedFile.size)
        const avatarUrl = await uploadAvatar(selectedFile)
        console.log('Avatar uploaded, URL:', avatarUrl)

        // Обновляем превью с сервера
        if (avatarUrl.startsWith('/uploads/')) {
          setImgSrc(`http://localhost:3011${avatarUrl}`)
        } else {
          setImgSrc(avatarUrl)
        }

        setFileInput('')
        profileToasts.avatarUploaded()
      } catch (error) {
        console.error('Error uploading avatar:', error)
        profileToasts.uploadError()
        // Возвращаем старое изображение при ошибке
        if (profile?.avatarUrl) {
          if (profile.avatarUrl.startsWith('/uploads/')) {
            setImgSrc(`http://localhost:3011${profile.avatarUrl}`)
          } else {
            setImgSrc(profile.avatarUrl)
          }
        }
      } finally {
        setSaving(false)
      }
    }
  }

  const handleFileInputReset = async () => {
    try {
      setSaving(true)
      console.log('Resetting avatar')
      const avatarUrl = await resetAvatar()
      console.log('Avatar reset result:', avatarUrl)
      setFileInput('')
                      setImgSrc(avatarUrl) // Используем URL, полученный от API
        profileToasts.avatarReset()
    } catch (error) {
      console.error('Error resetting avatar:', error)
      profileToasts.resetError()
    } finally {
      setSaving(false)
    }
  }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      console.log('Submitting form data:', formData)
                      const result = await updateProfile(formData as ProfileUpdateData)
        console.log('Profile update result:', result)
        profileToasts.profileUpdated()
      } catch (error) {
        console.error('Error updating profile:', error)
        profileToasts.updateError()
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        organization: profile.organization || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || ''
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <CircularProgress />
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

        <div className='flex max-sm:flex-col items-center gap-6'>
          <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button
                component='label'
                variant='contained'
                htmlFor='account-settings-upload-image'
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <i className='bx-upload' />}
              >
                {saving ? 'Загрузка...' : 'Загрузить новое фото'}
                <input
                  hidden
                  type='file'
                  value={fileInput}
                  accept='image/png, image/jpeg, image/gif'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />
              </Button>
              <Button
                variant='tonal'
                color='secondary'
                onClick={handleFileInputReset}
                disabled={saving}
                startIcon={<i className='bx-reset' />}
              >
                Сбросить
              </Button>
            </div>
            <Typography>Разрешены JPG, GIF или PNG. Максимальный размер 800K</Typography>
          </div>
        </div>
        <Divider className='mbs-4' />
      </CardContent>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Имя'
                value={formData.firstName}
                placeholder='Иван'
                onChange={e => handleFormChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Фамилия'
                value={formData.lastName}
                placeholder='Иванов'
                onChange={e => handleFormChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Email'
                value={formData.email}
                placeholder='ivan.ivanov@example.com'
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Организация'
                value={formData.organization}
                placeholder='Название компании'
                onChange={e => handleFormChange('organization', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Номер телефона'
                value={formData.phoneNumber}
                placeholder='+7 (999) 123-45-67'
                onChange={e => handleFormChange('phoneNumber', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Адрес'
                value={formData.address}
                placeholder='ул. Пушкина, д. 10'
                onChange={e => handleFormChange('address', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4 flex-wrap'>
              <Button
                variant='contained'
                type='submit'
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <i className='bx-save' />}
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              <Button
                variant='tonal'
                type='button'
                color='secondary'
                onClick={handleReset}
                disabled={saving}
              >
                Сбросить
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
