'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Paper,
  useTheme,
  alpha,
  Button
} from '@mui/material'

// Component Imports
import { motion } from 'framer-motion'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

const MenuShowcase = () => {
  const theme = useTheme()
  const { isCollapsed, toggleVerticalNav } = useVerticalNav()
  const [showcaseFeature, setShowcaseFeature] = useState<string>('overview')

  const modernFeatures = [
    {
      id: 'glassmorphism',
      title: 'Glassmorphism Effects',
      description: 'Полупрозрачные элементы с эффектом размытия',
      demo: (
        <Box
          sx={{
            height: 80,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Glassmorphism UI
          </Typography>
        </Box>
      )
    },
    {
      id: 'microinteractions',
      title: 'Micro-animations',
      description: 'Плавные анимации при взаимодействии',
      demo: (
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Box
            sx={{
              height: 80,
              background: theme.palette.primary.main,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Typography variant="body2" sx={{ color: '#fff' }}>
              Hover для анимации
            </Typography>
          </Box>
        </motion.div>
      )
    },
    {
      id: 'typography',
      title: 'Modern Typography',
      description: 'Иерархия шрифтов в стиле Linear/Notion',
      demo: (
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.005em',
              mb: 1
            }}
          >
            Modern Title
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: alpha(theme.palette.text.primary, 0.7),
              letterSpacing: '0.01em'
            }}
          >
            Subtitle with proper spacing
          </Typography>
        </Box>
      )
    },
    {
      id: 'shadows',
      title: 'Depth & Shadows',
      description: 'Многослойные тени для создания глубины',
      demo: (
        <Box
          sx={{
            height: 80,
            background: theme.palette.background.paper,
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2">
            Layered Shadows
          </Typography>
        </Box>
      )
    }
  ]

  return (
    <Box sx={{ p: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Современное меню навигации
        </Typography>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, maxWidth: 600 }}>
          Демонстрация современных принципов UX/UI дизайна 2025 года в стиле Linear, Notion и Aviasales
        </Typography>
      </Box>

      {/* Menu Status */}
      <Card sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Состояние меню
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip
                label={isCollapsed ? 'Свернуто' : 'Развернуто'}
                color={isCollapsed ? 'secondary' : 'primary'}
                variant="outlined"
              />
              <Chip
                label="Responsive"
                color="success"
                variant="outlined"
              />
            </Box>
            <Button
              variant="contained"
              onClick={toggleVerticalNav}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              {isCollapsed ? 'Развернуть' : 'Свернуть'} меню
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Меню автоматически адаптируется к размеру экрана и состоянию сворачивания.
              Используются современные анимации и эффекты глубины для улучшения пользовательского опыта.
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Features Showcase */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Современные UX/UI элементы
      </Typography>

      <Grid container spacing={3}>
        {modernFeatures.map((feature, index) => (
          <Grid item xs={12} md={6} key={feature.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }
                }}
                onClick={() => setShowcaseFeature(feature.id)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mb: 3,
                      lineHeight: 1.6
                    }}
                  >
                    {feature.description}
                  </Typography>
                  {feature.demo}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Technical Implementation */}
      <Paper sx={{ mt: 4, p: 3, background: alpha(theme.palette.primary.main, 0.02) }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Техническая реализация
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Технологии
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Chip label="Framer Motion" size="small" variant="outlined" />
              <Chip label="Material-UI v6" size="small" variant="outlined" />
              <Chip label="Lucide React" size="small" variant="outlined" />
              <Chip label="TypeScript" size="small" variant="outlined" />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Анимации
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Chip label="Spring Physics" size="small" variant="outlined" />
              <Chip label="Layout Animations" size="small" variant="outlined" />
              <Chip label="Hover Effects" size="small" variant="outlined" />
              <Chip label="State Transitions" size="small" variant="outlined" />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              UX принципы
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Chip label="44px Touch Targets" size="small" variant="outlined" />
              <Chip label="200ms Timing" size="small" variant="outlined" />
              <Chip label="Accessibility First" size="small" variant="outlined" />
              <Chip label="Progressive Enhancement" size="small" variant="outlined" />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default MenuShowcase
