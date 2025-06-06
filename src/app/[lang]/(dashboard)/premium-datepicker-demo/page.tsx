'use client'

// React Imports
import React from 'react'

// MUI Imports
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material'

// Component Imports
import PremiumDateRangePicker from '@components/premium/PremiumDateRangePicker'

// Store Imports
import { useDateRangeStore } from '@/store/dateRangeStore'

const PremiumDatePickerDemo = () => {
  const { range } = useDateRangeStore()

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        🗓️ Premium DateRangePicker Demo
      </Typography>

      <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
        Премиум компонент выбора диапазона дат в стиле Aviasales с улучшенным UX и анимациями
      </Typography>

      <Grid container spacing={4}>
        {/* Sticky Version */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Sticky Version (Desktop)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Компонент с липким позиционированием, остается видимым при скролле
              </Typography>

              <Box sx={{ position: 'relative', minHeight: 100 }}>
                <PremiumDateRangePicker
                  sticky={true}
                  stickyTop={80}
                  className="demo-sticky"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Non-Sticky Version */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Regular Version
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Обычная версия без sticky позиционирования
              </Typography>

              <Box sx={{ position: 'relative', minHeight: 100 }}>
                <PremiumDateRangePicker
                  sticky={false}
                  className="demo-regular"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Selection Display */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Текущий выбранный период:
            </Typography>
            <Divider sx={{ my: 2 }} />

            {range.start && range.end ? (
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Начало:</strong> {range.start.toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Конец:</strong> {range.end.toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Количество дней:</strong> {Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) + 1}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Период не выбран
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Features List */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                ✨ Особенности премиум компонента
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      🎯 Быстрые пресеты
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Сегодня, Вчера, Неделя, Месяц, Квартал
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      🎨 Framer Motion анимации
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Плавные переходы и микро-взаимодействия
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      📱 Адаптивный дизайн
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Оптимизирован для десктопа и мобильных устройств
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      🔄 Sticky позиционирование
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Остается видимым при прокрутке страницы
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      🎭 Премиум стилизация
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Дизайн в стиле Aviasales с градиентами и тенями
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      ⚡ Умная валидация
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Автоматическая коррекция неправильных диапазонов
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Scroll Test Area */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                📜 Тест прокрутки для Sticky версии
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Прокрутите страницу вниз, чтобы увидеть, как работает sticky позиционирование
              </Typography>

              {/* Spacer content for scroll testing */}
              {Array.from({ length: 20 }, (_, i) => (
                <Box key={i} sx={{ p: 2, mb: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body1">
                    Блок контента #{i + 1} - прокрутите вниз, чтобы протестировать sticky поведение DateRangePicker
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default PremiumDatePickerDemo
