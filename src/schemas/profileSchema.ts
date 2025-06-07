import { z } from 'zod'

// Схема для обновления профиля
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Имя обязательно')
    .max(50, 'Имя должно быть не более 50 символов')
    .regex(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, 'Имя должно содержать только буквы, пробелы и дефисы'),

  lastName: z
    .string()
    .min(1, 'Фамилия обязательна')
    .max(50, 'Фамилия должна быть не более 50 символов')
    .regex(/^[a-zA-Zа-яА-ЯёЁ\s-]+$/, 'Фамилия должна содержать только буквы, пробелы и дефисы'),

  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Некорректный формат email')
    .max(100, 'Email должен быть не более 100 символов'),

  organization: z
    .string()
    .max(100, 'Название организации должно быть не более 100 символов')
    .optional()
    .or(z.literal('')),

  phoneNumber: z
    .string()
    .regex(/^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$|^$/, 'Некорректный формат номера телефона')
    .max(20, 'Номер телефона должен быть не более 20 символов')
    .optional()
    .or(z.literal('')),

  address: z
    .string()
    .max(200, 'Адрес должен быть не более 200 символов')
    .optional()
    .or(z.literal('')),
})

// Типы для использования в компонентах
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

// Функции для валидации
export const validateProfileUpdate = (data: unknown) => {
  return profileUpdateSchema.safeParse(data)
}

// Простая валидация аватара без Zod
export const validateAvatar = (file: File) => {
  const errors = []

  // Проверка размера
  if (file.size > 800 * 1024) {
    errors.push('Размер файла не должен превышать 800KB')
  }

  // Проверка типа
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    errors.push('Поддерживаются только форматы: JPEG, PNG, GIF')
  }

  return {
    success: errors.length === 0,
    error: errors.length > 0 ? { errors: errors.map(msg => ({ message: msg })) } : null
  }
}
