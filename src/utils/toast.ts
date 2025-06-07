import { toast } from 'react-toastify'

// Настройки для разных типов уведомлений в стиле Aviasales/Notion
const toastConfig = {
  position: 'bottom-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

const errorConfig = {
  ...toastConfig,
  autoClose: 4000, // Ошибки показываем дольше
}

// Утилиты для toast-уведомлений
export const showSuccess = (message: string) => {
  toast.success(message, toastConfig)
}

export const showError = (message: string) => {
  toast.error(message, errorConfig)
}

export const showWarning = (message: string) => {
  toast.warning(message, toastConfig)
}

export const showInfo = (message: string) => {
  toast.info(message, toastConfig)
}

// Специализированные сообщения для профиля
export const profileToasts = {
  avatarUploaded: () => showSuccess('Аватар успешно загружен!'),
  avatarReset: () => showSuccess('Аватар сброшен!'),
  profileUpdated: () => showSuccess('Профиль успешно обновлен!'),
  uploadError: () => showError('Ошибка при загрузке аватара. Попробуйте позже.'),
  resetError: () => showError('Ошибка при сбросе аватара. Попробуйте позже.'),
  updateError: () => showError('Ошибка при обновлении профиля. Попробуйте позже.'),
}
