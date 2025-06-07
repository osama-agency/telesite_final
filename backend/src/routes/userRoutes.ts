import express from 'express';

import {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  resetAvatar,
  uploadMiddleware
} from '../controllers/userController';

const router = express.Router();

// Получить профиль пользователя
router.get('/profile/:userId', getUserProfile);

// Обновить профиль пользователя
router.put('/profile/:userId', updateUserProfile);

// Загрузить аватар
router.post('/profile/:userId/avatar', uploadMiddleware, uploadAvatar);

// Сбросить аватар
router.delete('/profile/:userId/avatar', resetAvatar);

export default router;
