'use client'

import { motion } from 'framer-motion'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  urgency: number // 0-100
  estimatedRevenue: number
  action: string
  products: string[]
}

interface PurchaseRecommendationCardProps {
  recommendations: Recommendation[]
  onActionClick: (recommendationId: string) => void
}

const PurchaseRecommendationCard = ({
  recommendations,
  onActionClick
}: PurchaseRecommendationCardProps) => {
  const theme = useTheme()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF4B4B'
      case 'medium':
        return '#FFC732'
      case 'low':
        return '#2AC769'
      default:
        return theme.palette.text.secondary
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bx-error-circle'
      case 'medium':
        return 'bx-time'
      case 'low':
        return 'bx-check-circle'
      default:
        return 'bx-info-circle'
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('ru-RU')} ₽`
  }

  if (recommendations.length === 0) {
    return (
      <Card
        sx={{
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <i className='bx-check-circle text-5xl mb-2' style={{ color: '#2AC769', opacity: 0.7 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Все товары в норме
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Критичных ситуаций по остаткам не обнаружено
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #725CFF 0%, #BB61F9 100%)',
              color: 'white'
            }}
          >
            <i className='bx-brain text-xl' />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              AI Рекомендации
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Интеллектуальный анализ закупок
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recommendations.map((recommendation, index) => (
            <motion.div
              key={recommendation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${alpha(getPriorityColor(recommendation.priority), 0.2)}`,
                  bgcolor: alpha(getPriorityColor(recommendation.priority), 0.03),
                  position: 'relative',
                  '&:hover': {
                    bgcolor: alpha(getPriorityColor(recommendation.priority), 0.06),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(getPriorityColor(recommendation.priority), 0.15)}`
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {/* Приоритет и срочность */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i
                      className={getPriorityIcon(recommendation.priority)}
                      style={{
                        color: getPriorityColor(recommendation.priority),
                        fontSize: '18px'
                      }}
                    />
                    <Chip
                      label={recommendation.priority === 'high' ? 'Высокий' :
                            recommendation.priority === 'medium' ? 'Средний' : 'Низкий'}
                      size="small"
                      sx={{
                        bgcolor: getPriorityColor(recommendation.priority),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>

                  <Tooltip title={`Срочность: ${recommendation.urgency}%`}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80 }}>
                      <LinearProgress
                        variant="determinate"
                        value={recommendation.urgency}
                        sx={{
                          width: 60,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(getPriorityColor(recommendation.priority), 0.2),
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getPriorityColor(recommendation.priority),
                            borderRadius: 3
                          }
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: getPriorityColor(recommendation.priority),
                          minWidth: 35
                        }}
                      >
                        {recommendation.urgency}%
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>

                {/* Заголовок и описание */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {recommendation.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {recommendation.description}
                </Typography>

                {/* Товары */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    Затронутые товары:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {recommendation.products.slice(0, 3).map((product, idx) => (
                      <Chip
                        key={idx}
                        label={product}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: 24,
                          borderColor: alpha(getPriorityColor(recommendation.priority), 0.3)
                        }}
                      />
                    ))}
                    {recommendation.products.length > 3 && (
                      <Chip
                        label={`+${recommendation.products.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: 24,
                          borderColor: alpha(getPriorityColor(recommendation.priority), 0.3)
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Потенциальная выручка */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Потенциальная выручка:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {formatCurrency(recommendation.estimatedRevenue)}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onActionClick(recommendation.id)}
                    sx={{
                      background: `linear-gradient(135deg, ${getPriorityColor(recommendation.priority)} 0%, ${alpha(getPriorityColor(recommendation.priority), 0.8)} 100%)`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(getPriorityColor(recommendation.priority), 0.9)} 0%, ${alpha(getPriorityColor(recommendation.priority), 0.7)} 100%)`,
                        transform: 'scale(1.05)'
                      },
                      fontWeight: 600,
                      borderRadius: 1.5,
                      px: 2
                    }}
                  >
                    {recommendation.action}
                  </Button>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* Общая сводка */}
        <Alert
          severity="info"
          sx={{
            mt: 3,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            '& .MuiAlert-icon': {
              color: theme.palette.info.main
            }
          }}
        >
          <Typography variant="body2">
            <strong>Общий потенциал:</strong> {formatCurrency(
              recommendations.reduce((sum, rec) => sum + rec.estimatedRevenue, 0)
            )} дополнительной выручки при выполнении всех рекомендаций
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  )
}

export default PurchaseRecommendationCard
