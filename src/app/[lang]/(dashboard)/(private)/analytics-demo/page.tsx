'use client'

import { useState, useCallback } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import { alpha, useTheme } from '@mui/material/styles'

// Component Imports
import PremiumActionBar from '@/components/products/PremiumActionBar'
import PurchaseRecommendationCard from '@/components/products/PurchaseRecommendationCard'

// Types
interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  urgency: number
  estimatedRevenue: number
  action: string
  products: string[]
}

const AnalyticsDemoPage = () => {
  const theme = useTheme()
  const [selectedCount, setSelectedCount] = useState(3)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock данные для демонстрации
  const mockRecommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Критичные остатки iPhone 15 Pro',
      description: 'iPhone 15 Pro Natural Titanium закончится через 5 дней при текущих продажах. Рекомендуется срочная закупка.',
      priority: 'high',
      urgency: 95,
      estimatedRevenue: 2450000,
      action: 'Заказать 15 шт',
      products: ['iPhone 15 Pro 128GB', 'iPhone 15 Pro 256GB', 'iPhone 15 Pro 512GB']
    },
    {
      id: '2',
      title: 'Сезонный рост продаж наушников',
      description: 'Sony WH-1000XM5 показывают рост продаж на 40%. Стоит увеличить закупку к праздникам.',
      priority: 'medium',
      urgency: 65,
      estimatedRevenue: 850000,
      action: 'Увеличить заказ',
      products: ['Sony WH-1000XM5', 'AirPods Pro 2', 'Bose QC45']
    },
    {
      id: '3',
      title: 'Оптимизация закупки пылесосов',
      description: 'Dyson V15 имеет избыточные остатки. Можно снизить следующую закупку на 30%.',
      priority: 'low',
      urgency: 25,
      estimatedRevenue: 320000,
      action: 'Снизить заказ',
      products: ['Dyson V15 Detect', 'Dyson V12 Detect']
    }
  ]

  const handleBulkPurchase = useCallback(() => {
    console.log('Массовая закупка для', selectedCount, 'товаров')
  }, [selectedCount])

  const handleExportCritical = useCallback(() => {
    console.log('Экспорт критичных товаров')
  }, [])

  const handleExportAll = useCallback(() => {
    console.log('Экспорт всех товаров')
  }, [])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }, [])

  const handleRecommendationAction = useCallback((recommendationId: string) => {
    console.log('Выполнение действия для рекомендации:', recommendationId)
  }, [])

  return (
    <Box>
      {/* Заголовок */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(135deg, #725CFF 0%, #BB61F9 50%, #F2445B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 1
          }}
        >
          Демо: Премиум аналитика закупок
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Система уровня Aviasales/Notion для управления запасами и планирования закупок
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="🎯 AI Рекомендации" color="primary" variant="outlined" />
          <Chip label="📊 Предиктивная аналитика" color="secondary" variant="outlined" />
          <Chip label="⚡ Автоматизация" color="success" variant="outlined" />
          <Chip label="🔄 Реальное время" color="info" variant="outlined" />
        </Box>
      </Box>

      {/* Premium Action Bar */}
      <PremiumActionBar
        selectedCount={selectedCount}
        totalCritical={2}
        onBulkPurchase={handleBulkPurchase}
        onExportCritical={handleExportCritical}
        onExportAll={handleExportAll}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Основной контент */}
      <Grid container spacing={3}>
        {/* AI Рекомендации */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <PurchaseRecommendationCard
            recommendations={mockRecommendations}
            onActionClick={handleRecommendationAction}
          />
        </Grid>

        {/* Боковая панель с метриками */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Быстрые действия */}
            <Paper
              sx={{
                p: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Быстрые действия
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<i className='bx-plus' />}
                  onClick={() => setSelectedCount(prev => prev + 1)}
                >
                  Добавить товар ({selectedCount})
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<i className='bx-refresh' />}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Обновление...' : 'Обновить данные'}
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<i className='bx-cart-add' />}
                  sx={{
                    background: 'linear-gradient(135deg, #725CFF 0%, #BB61F9 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #6249E6 0%, #A855E6 100%)',
                    }
                  }}
                >
                  Создать закупку
                </Button>
              </Box>
            </Paper>

            {/* Статистика */}
            <Paper
              sx={{
                p: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Статистика
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Критичные товары:</Typography>
                  <Chip label="2" color="error" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">В пути:</Typography>
                  <Chip label="15 шт" color="info" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Потенциал:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                    3.6M ₽
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Информационный блок */}
      <Paper
        sx={{
          p: 4,
          mt: 4,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          🚀 Особенности премиум системы
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>✨ AI-powered рекомендации:</strong> Интеллектуальный анализ продаж и остатков
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>📊 Предиктивная аналитика:</strong> Прогнозирование спроса и оптимальных закупок
            </Typography>
            <Typography variant="body2">
              <strong>⚡ Автоматизация:</strong> Массовые операции и умные уведомления
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>🎨 Современный UX:</strong> Дизайн уровня Aviasales, Linear, Notion
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>📱 Адаптивность:</strong> Оптимизация для всех устройств
            </Typography>
            <Typography variant="body2">
              <strong>🔄 Реальное время:</strong> Мгновенные обновления и синхронизация
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default AnalyticsDemoPage
