'use client'

import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import ModernDatePicker from '@/components/ui/modern-date-picker'

const DemoDatePicker = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight={700} mb={2}>
          🎨 Современный датапикер
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Демонстрация нового мобильного компонента выбора даты
          <br />
          в стиле Aviasales, Notion и Linear
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        p: 4,
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: 1
      }}>
        <ModernDatePicker />
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3 }}>
        <Typography variant="h6" mb={2}>✨ Особенности дизайна:</Typography>
        <Typography variant="body2" component="div" color="text.secondary">
          • Полноразмерные плитки (w-full, min-h-[72px])<br/>
          • Спокойные приглушенные цвета по умолчанию<br/>
          • Градиент с glow-эффектом для выбранной плитки<br/>
          • Фиксированная панель подтверждения снизу<br/>
          • Реальные табы с иконками 🚀 и 📅<br/>
          • Framer Motion анимации<br/>
          • Совместимость с Tailwind + shadcn/ui
        </Typography>
      </Box>
    </Container>
  )
}

export default DemoDatePicker 