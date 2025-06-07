import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';
import multer from 'multer';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Дефолтный обезличенный аватар в стиле Sneat
const DEFAULT_AVATAR_URL = '/images/avatars/default.svg';

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 800 * 1024, // 800KB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Получить профиль пользователя
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    console.log('Getting user profile for:', req.params.userId);
    const { userId } = req.params;

    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    console.log('Found user:', user);

    // Если пользователь не найден, создаем профиль на основе ID
    if (!user) {
      let defaultData;

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
          avatarUrl: DEFAULT_AVATAR_URL
        };
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
          avatarUrl: DEFAULT_AVATAR_URL
        };
      }

      user = await prisma.user.create({ data: defaultData });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Обновить профиль пользователя
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    console.log('Updating user profile:', req.params.userId, req.body);
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      email,
      organization,
      phoneNumber,
      address
    } = req.body;

    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        firstName,
        lastName,
        email,
        organization,
        phoneNumber,
        address
      },
      create: {
        id: userId,
        firstName,
        lastName,
        email,
        organization,
        phoneNumber,
        address,
        avatarUrl: DEFAULT_AVATAR_URL
      }
    });

    console.log('User profile updated successfully:', user);
    console.log('Sending response:', user);
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

// Загрузить аватар
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Получаем старый аватар для удаления
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Обновляем аватар в базе данных
    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        avatarUrl
      },
      create: {
        id: userId,
        email: 'john.doe@example.com',
        avatarUrl
      }
    });

    // Удаляем старый файл аватара (если он не дефолтный)
    if (user?.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
      const oldFilePath = path.join(process.cwd(), user.avatarUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    res.json({ avatarUrl, user: updatedUser });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

// Сбросить аватар
export const resetAvatar = async (req: Request, res: Response) => {
  try {
    console.log('Resetting avatar for user:', req.params.userId);
    const { userId } = req.params;

    // Получаем текущий аватар
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    console.log('Current user avatar:', user?.avatarUrl);

    // Обновляем на дефолтный аватар
    const updatedUser = await prisma.user.upsert({
      where: { id: userId },
      update: {
        avatarUrl: DEFAULT_AVATAR_URL
      },
      create: {
        id: userId,
        email: 'user@example.com',
        avatarUrl: DEFAULT_AVATAR_URL,
        firstName: 'User',
        lastName: 'Name'
      }
    });

    // Удаляем файл аватара (если он не дефолтный)
    if (user?.avatarUrl && user.avatarUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), user.avatarUrl);
      console.log('Deleting file:', filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('File deleted successfully');
      } else {
        console.log('File not found:', filePath);
      }
    }

    console.log('Avatar reset successfully to:', DEFAULT_AVATAR_URL);
    res.json({
      avatarUrl: DEFAULT_AVATAR_URL,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error resetting avatar:', error);
    res.status(500).json({ error: 'Failed to reset avatar' });
  }
};

export const uploadMiddleware = upload.single('avatar');
