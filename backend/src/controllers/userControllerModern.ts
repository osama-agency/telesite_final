import fs from 'fs'
import path from 'path'
import type { Request, Response } from 'express'
import multer from 'multer'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cloudinary или другой CDN config (для production)
const AVATAR_CDN_BASE = process.env.AVATAR_CDN_BASE || 'http://localhost:3011'

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars'

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)

    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
  }
})

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 800 * 1024, // 800KB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'))
    }
  }
})

// Утилиты для работы с аватарами
const avatarUtils = {
  // Генерация URL для аватара
  generateAvatarUrl(filename: string): string {
    return `${AVATAR_CDN_BASE}/uploads/avatars/${filename}`
  },

  // Проверка является ли URL внешним
  isExternalUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://')
  },

  // Получение пути к файлу из URL
  getFilePathFromUrl(url: string): string | null {
    if (url.startsWith('/uploads/')) {
      return path.join(process.cwd(), url)
    }

    return null
  },

  // Удаление старого файла аватара
  async deleteOldAvatar(avatarUrl: string | null): Promise<void> {
    if (!avatarUrl || this.isExternalUrl(avatarUrl)) {
      return
    }

    const filePath = this.getFilePathFromUrl(avatarUrl)

    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
        console.log('Old avatar deleted:', filePath)
      } catch (error) {
        console.error('Error deleting old avatar:', error)
      }
    }
  }
}

// Получить профиль пользователя
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    console.log('Getting user profile for:', req.params.userId)
    const { userId } = req.params

    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    console.log('Found user:', user)

    // Если пользователь не найден, создаем профиль на основе ID
    if (!user) {
      let defaultData

      // Если это админ (go_at_osama_agency), создаем профиль администратора
      if (userId === 'go_at_osama_agency') {
        defaultData = {
          id: userId,
          email: 'go@osama.agency',
          firstName: 'Root',
          lastName: 'Admin',
          organization: 'Root Organization',
          phoneNumber: '',
          address: '',
          avatarUrl: '/images/avatars/1.png'
        }
      } else {
        // Для других пользователей создаем стандартный профиль
        defaultData = {
          id: userId,
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          organization: 'ThemeSelection',
          phoneNumber: '+1 (917) 543-9876',
          address: '123 Main St, New York, NY 10001',
          avatarUrl: '/images/avatars/1.png'
        }
      }

      user = await prisma.user.create({ data: defaultData })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
}

// Обновить профиль пользователя
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    console.log('Updating user profile:', req.params.userId, req.body)
    const { userId } = req.params
    const {
      firstName,
      lastName,
      email,
      organization,
      phoneNumber,
      address
    } = req.body

    // Валидация данных
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return res.status(400).json({
        error: 'Поля firstName, lastName и email обязательны'
      })
    }

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        organization: organization?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null,
        address: address?.trim() || null
      },
      create: {
        id: userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        organization: organization?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null,
        address: address?.trim() || null,
        avatarUrl: '/images/avatars/1.png'
      }
    })

    console.log('User profile updated successfully:', user)
    res.json(user)
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ error: 'Failed to update user profile' })
  }
}

// Загрузить аватар
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Получаем текущий профиль
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    // Генерируем URL для нового аватара
    const avatarUrl = `/uploads/avatars/${req.file.filename}`

    // Обновляем профиль с новым аватаром
    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        avatarUrl
      },
      create: {
        id: userId,
        email: 'user@example.com',
        avatarUrl,
        firstName: 'User',
        lastName: 'Name'
      }
    })

    // Удаляем старый файл аватара (асинхронно)
    if (currentUser?.avatarUrl) {
      avatarUtils.deleteOldAvatar(currentUser.avatarUrl).catch(console.error)
    }

    res.json({
      avatarUrl: avatarUtils.generateAvatarUrl(req.file.filename),
      user: updatedUser
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    res.status(500).json({ error: 'Failed to upload avatar' })
  }
}

// Установить аватар по URL (для CDN или внешних ссылок)
export const setAvatarUrl = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { url } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required' })
    }

    // Валидация URL
    if (!avatarUtils.isExternalUrl(url) && !url.startsWith('/')) {
      return res.status(400).json({ error: 'Invalid URL format' })
    }

    // Получаем текущий профиль
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    // Обновляем аватар
    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        avatarUrl: url
      },
      create: {
        id: userId,
        email: 'user@example.com',
        avatarUrl: url,
        firstName: 'User',
        lastName: 'Name'
      }
    })

    // Удаляем старый файл (если это локальный файл)
    if (currentUser?.avatarUrl && !avatarUtils.isExternalUrl(currentUser.avatarUrl)) {
      avatarUtils.deleteOldAvatar(currentUser.avatarUrl).catch(console.error)
    }

    res.json({
      avatarUrl: url,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error setting avatar URL:', error)
    res.status(500).json({ error: 'Failed to set avatar URL' })
  }
}

// Сбросить аватар
export const resetAvatar = async (req: Request, res: Response) => {
  try {
    console.log('Resetting avatar for user:', req.params.userId)
    const { userId } = req.params

    // Получаем текущий аватар
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    console.log('Current user avatar:', user?.avatarUrl)

    const defaultAvatarUrl = '/images/avatars/1.png'

    // Обновляем на дефолтный аватар
    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        avatarUrl: defaultAvatarUrl
      },
      create: {
        id: userId,
        email: 'user@example.com',
        avatarUrl: defaultAvatarUrl,
        firstName: 'User',
        lastName: 'Name'
      }
    })

    // Удаляем старый файл аватара (если это локальный файл)
    if (user?.avatarUrl && !avatarUtils.isExternalUrl(user.avatarUrl)) {
      avatarUtils.deleteOldAvatar(user.avatarUrl).catch(console.error)
    }

    console.log('Avatar reset successfully')
    res.json({
      avatarUrl: defaultAvatarUrl,
      user: updatedUser
    })
  } catch (error) {
    console.error('Error resetting avatar:', error)
    res.status(500).json({ error: 'Failed to reset avatar' })
  }
}
