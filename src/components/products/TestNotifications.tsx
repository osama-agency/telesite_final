'use client'

import React, { useState } from 'react'
import { Box, Button, Stack } from '@mui/material'
import PremiumNotification from '@/components/common/PremiumNotification'

const TestNotifications = () => {
  const [notification, setNotification] = useState({
    open: false,
    type: 'success' as 'success' | 'warning' | 'error' | 'info',
    title: '',
    message: ''
  })

  const showNotification = (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => {
    setNotification({
      open: true,
      type,
      title,
      message: message || ''
    })
  }

  return (
    <Box sx={{ p: 4 }}>
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          color="success"
          onClick={() => showNotification('success', '✅ Закупка создана', 'Поставщик: Тест\\nТоваров: 3\\nСумма: 15,000 ₽')}
        >
          Успех
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => showNotification('warning', '⚠️ Товары не выбраны', 'Выберите товары для создания закупки')}
        >
          Предупреждение
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => showNotification('error', '❌ Ошибка создания', 'Не удалось создать закупку. Попробуйте еще раз.')}
        >
          Ошибка
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={() => showNotification('info', 'ℹ️ Информация', 'Это информационное сообщение')}
        >
          Инфо
        </Button>
      </Stack>

      <PremiumNotification
        open={notification.open}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        duration={5000}
        position="top-right"
      />
    </Box>
  )
}

export default TestNotifications
