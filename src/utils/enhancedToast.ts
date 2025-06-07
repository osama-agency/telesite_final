import { toast, ToastOptions, Id } from 'react-toastify'
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material'
import React from 'react'

// Enhanced toast configuration
const defaultConfig: ToastOptions = {
  position: 'bottom-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'colored',
  transition: 'slide' as any,
}

// Success toast with enhanced styling
export const showSuccessToast = (
  message: string,
  options?: ToastOptions
): Id => {
  return toast.success(
    message,
    {
      ...defaultConfig,
      icon: '✅',
      style: {
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 500,
        boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
      },
      progressStyle: {
        background: 'rgba(255, 255, 255, 0.3)',
      },
      ...options,
    }
  )
}

// Error toast with enhanced styling
export const showErrorToast = (
  message: string,
  options?: ToastOptions
): Id => {
  return toast.error(
    message,
    {
      ...defaultConfig,
      autoClose: 5000, // Errors stay longer
      icon: '❌',
      style: {
        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 500,
        boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
      },
      progressStyle: {
        background: 'rgba(255, 255, 255, 0.3)',
      },
      ...options,
    }
  )
}

// Warning toast
export const showWarningToast = (
  message: string,
  options?: ToastOptions
): Id => {
  return toast.warning(
    message,
    {
      ...defaultConfig,
      icon: '⚠️',
      style: {
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 500,
        boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
      },
      progressStyle: {
        background: 'rgba(255, 255, 255, 0.3)',
      },
      ...options,
    }
  )
}

// Info toast
export const showInfoToast = (
  message: string,
  options?: ToastOptions
): Id => {
  return toast.info(
    message,
    {
      ...defaultConfig,
      icon: 'ℹ️',
      style: {
        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 500,
        boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
      },
      progressStyle: {
        background: 'rgba(255, 255, 255, 0.3)',
      },
      ...options,
    }
  )
}

// Loading toast with spinner
export const showLoadingToast = (
  message: string,
  options?: ToastOptions
): Id => {
  return toast.loading(
    message,
    {
      ...defaultConfig,
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      style: {
        background: 'linear-gradient(135deg, #696CFF 0%, #5A5FE0 100%)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: 500,
        boxShadow: '0 8px 32px rgba(105, 108, 255, 0.3)',
      },
      ...options,
    }
  )
}

// Update existing toast (useful for loading -> success/error)
export const updateToast = (
  toastId: Id,
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'success',
  options?: ToastOptions
) => {
  const configs = {
    success: {
      type: toast.TYPE.SUCCESS,
      icon: '✅',
      style: {
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
      },
    },
    error: {
      type: toast.TYPE.ERROR,
      icon: '❌',
      style: {
        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
        boxShadow: '0 8px 32px rgba(244, 67, 54, 0.3)',
      },
    },
    warning: {
      type: toast.TYPE.WARNING,
      icon: '⚠️',
      style: {
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        boxShadow: '0 8px 32px rgba(255, 152, 0, 0.3)',
      },
    },
    info: {
      type: toast.TYPE.INFO,
      icon: 'ℹ️',
      style: {
        background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
        boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
      },
    },
  }

  const config = configs[type]

  toast.update(toastId, {
    render: message,
    type: config.type,
    icon: config.icon,
    isLoading: false,
    autoClose: 3000,
    closeOnClick: true,
    draggable: true,
    style: {
      ...config.style,
      color: 'white',
      borderRadius: '12px',
      fontWeight: 500,
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.3)',
    },
    ...options,
  })
}

// Specialized toast messages for different actions
export const toastMessages = {
  // Data operations
  dataLoaded: () => showSuccessToast('Данные успешно загружены'),
  dataLoadError: () => showErrorToast('Ошибка загрузки данных'),
  dataSaved: () => showSuccessToast('Данные сохранены'),
  dataSaveError: () => showErrorToast('Ошибка сохранения данных'),

  // Orders
  orderCreated: (id: string) => showSuccessToast(`Заказ ${id} создан`),
  orderUpdated: (id: string) => showSuccessToast(`Заказ ${id} обновлен`),
  orderDeleted: (id: string) => showWarningToast(`Заказ ${id} удален`),
  orderError: () => showErrorToast('Ошибка обработки заказа'),

  // Products
  productAdded: (name: string) => showSuccessToast(`Товар "${name}" добавлен`),
  productUpdated: (name: string) => showSuccessToast(`Товар "${name}" обновлен`),
  productRemoved: (name: string) => showWarningToast(`Товар "${name}" удален`),
  productError: () => showErrorToast('Ошибка обработки товара'),

  // Purchases
  purchaseCreated: (id: string) => showSuccessToast(`Закупка #${id} создана`),
  purchaseUpdated: (id: string) => showSuccessToast(`Закупка #${id} обновлена`),
  purchaseError: () => showErrorToast('Ошибка создания закупки'),

  // File operations
  fileUploaded: (filename: string) => showSuccessToast(`Файл "${filename}" загружен`),
  fileUploadError: () => showErrorToast('Ошибка загрузки файла'),

  // Authentication
  loginSuccess: () => showSuccessToast('Вход выполнен успешно'),
  loginError: () => showErrorToast('Ошибка входа в систему'),
  logoutSuccess: () => showInfoToast('Вы вышли из системы'),

  // Network
  networkError: () => showErrorToast('Ошибка сети. Проверьте подключение.'),
  serverError: () => showErrorToast('Ошибка сервера. Попробуйте позже.'),

  // Permissions
  accessDenied: () => showWarningToast('Доступ запрещен'),
  permissionError: () => showErrorToast('Недостаточно прав доступа'),

  // Validation
  validationError: (field: string) => showWarningToast(`Проверьте поле: ${field}`),
  requiredField: (field: string) => showWarningToast(`Поле "${field}" обязательно`),

  // Sync
  syncStart: () => showLoadingToast('Синхронизация данных...'),
  syncSuccess: () => showSuccessToast('Синхронизация завершена'),
  syncError: () => showErrorToast('Ошибка синхронизации'),

  // Currency
  currencyUpdated: () => showInfoToast('Курс валюты обновлен'),
  currencyError: () => showErrorToast('Ошибка обновления курса'),

  // Settings
  settingsSaved: () => showSuccessToast('Настройки сохранены'),
  settingsError: () => showErrorToast('Ошибка сохранения настроек'),
}

// Promise-based toast for async operations
export const toastPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: any) => string)
  },
  options?: ToastOptions
): Promise<T> => {
  return toast.promise(
    promise,
    {
      pending: {
        render: messages.loading,
        icon: '⏳',
        style: {
          background: 'linear-gradient(135deg, #696CFF 0%, #5A5FE0 100%)',
          color: 'white',
          borderRadius: '12px',
          fontWeight: 500,
        },
      },
      success: {
        render: messages.success,
        icon: '✅',
        style: {
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          color: 'white',
          borderRadius: '12px',
          fontWeight: 500,
        },
      },
      error: {
        render: messages.error,
        icon: '❌',
        style: {
          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
          color: 'white',
          borderRadius: '12px',
          fontWeight: 500,
        },
      },
    },
    {
      ...defaultConfig,
      ...options,
    }
  )
}
