'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// MUI Imports
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Collapse,
  alpha,
  useTheme
} from '@mui/material'

// Icons
import {
  TrendingUp,
  Warning,
  Schedule,
  ShoppingCart,
  ChevronRight,
  AutoAwesome,
  Timeline,
  MonetizationOn,
  Inventory,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'

interface AIRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  urgency: number
  estimatedRevenue: number
  action: string
  products: string[]
  category: string
  impact: string
}

const mockRecommendations: AIRecommendation[] = [
  {
    id: '1',
    title: 'Критический недостаток iPhone 15 Pro',
    description: 'Остаток iPhone 15 Pro составляет всего 3 единицы при среднем спросе 0.6 в день. Товар закончится через 5 дней.',
    priority: 'high',
    urgency: 95,
    estimatedRevenue: 1346400,
    action: 'Заказать 15 единиц немедленно',
    products: ['iPhone 15 Pro 128GB', 'iPhone 15 Pro 256GB'],
    category: 'Электроника',
    impact: 'Предотвращение потери 1.3М₽ выручки'
  },
  {
    id: '2',
    title: 'Оптимизация наценки на наушники Sony',
    description: 'Наушники Sony имеют высокую наценку 45.2%, но медленные продажи. Рекомендуется снизить цену для ускорения оборачиваемости.',
    priority: 'medium',
    urgency: 60,
    estimatedRevenue: 89500,
    action: 'Снизить цену на 10%',
    products: ['Sony WH-1000XM5'],
    category: 'Аудио',
    impact: 'Увеличение продаж на 40%'
  },
  {
    id: '3',
    title: 'Планирование закупки MacBook Pro',
    description: 'MacBook Pro показывает стабильный спрос. Рекомендуется увеличить запас перед сезоном повышенного спроса.',
    priority: 'low',
    urgency: 30,
    estimatedRevenue: 2145600,
    action: 'Заказать 10 единиц к концу месяца',
    products: ['MacBook Pro 14" M3', 'MacBook Pro 16" M3'],
    category: 'Компьютеры',
    impact: 'Подготовка к сезонному спросу'
  }
]

const AIRecommendations = () => {
  const theme = useTheme()
  const [expandedCards, setExpandedCards] = useState<string[]>([])

  const toggleExpanded = (id: string) => {
    setExpandedCards(prev =>
      prev.includes(id)
        ? prev.filter(cardId => cardId !== id)
        : [...prev, id]
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: alpha('#ff4444', 0.1),
          color: '#ff4444',
          icon: <Warning />,
          border: '#ff4444'
        }
      case 'medium':
        return {
          bg: alpha('#ffa726', 0.1),
          color: '#ffa726',
          icon: <Schedule />,
          border: '#ffa726'
        }
      case 'low':
        return {
          bg: alpha('#4caf50', 0.1),
          color: '#4caf50',
          icon: <TrendingUp />,
          border: '#4caf50'
        }
      default:
        return {
          bg: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.grey[500],
          icon: <AutoAwesome />,
          border: theme.palette.grey[500]
        }
    }
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}М₽`
    }
    return `${(value / 1000).toFixed(0)}К₽`
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AutoAwesome sx={{ color: 'primary.main', fontSize: 24 }} />
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{
              background: 'linear-gradient(135deg, #725CFF 0%, #BB61F9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
            AI Рекомендации
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Интеллектуальные советы по оптимизации закупок
          </Typography>
        </Box>
      </Box>

      {/* Recommendations Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <AnimatePresence>
          {mockRecommendations.map((recommendation, index) => {
            const priorityStyle = getPriorityColor(recommendation.priority)
            const isExpanded = expandedCards.includes(recommendation.id)

            return (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: 3,
                    border: `1px solid ${alpha(priorityStyle.border, 0.2)}`,
                    borderLeft: `4px solid ${priorityStyle.color}`,
                    bgcolor: priorityStyle.bg,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(priorityStyle.color, 0.15)}`
                    }
                  }}
                  onClick={() => toggleExpanded(recommendation.id)}
                >
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{ color: priorityStyle.color }}>
                          {priorityStyle.icon}
                        </Box>

                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {recommendation.title}
                        </Typography>

                        <Chip
                          label={recommendation.priority.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: priorityStyle.color,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {recommendation.description}
                      </Typography>

                      {/* Urgency Progress */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Срочность
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: priorityStyle.color }}>
                            {recommendation.urgency}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={recommendation.urgency}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(priorityStyle.color, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: priorityStyle.color,
                              borderRadius: 3
                            }
                          }}
                        />
                      </Box>

                      {/* Key Metrics */}
                      <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MonetizationOn sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2">
                            <strong>{formatCurrency(recommendation.estimatedRevenue)}</strong>
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Inventory sx={{ fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {recommendation.products.length} товар{recommendation.products.length > 1 ? 'а' : ''}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Timeline sx={{ fontSize: 16, color: 'info.main' }} />
                          <Typography variant="body2">
                            {recommendation.category}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton size="small">
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Expanded Content */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                      {/* Products */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Затронутые товары:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {recommendation.products.map((product, idx) => (
                            <Chip
                              key={idx}
                              label={product}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Impact */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          Ожидаемый эффект:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: priorityStyle.color }}>
                          {recommendation.impact}
                        </Typography>
                      </Box>

                      {/* Action Button */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={<ShoppingCart />}
                          sx={{
                            bgcolor: priorityStyle.color,
                            '&:hover': {
                              bgcolor: alpha(priorityStyle.color, 0.8)
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Выполнение действия:', recommendation.action)
                          }}
                        >
                          {recommendation.action}
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Подробнее
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </Box>
    </Box>
  )
}

export default AIRecommendations
