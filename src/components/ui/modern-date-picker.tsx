'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Drawer,
  useTheme,
  useMediaQuery,
  alpha,
  ButtonBase
} from '@mui/material'
import { useDateRangeStore } from '@/store/dateRangeStore'

interface ModernDatePickerProps {
  onClose?: () => void
}

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({ onClose }) => {
  const { range, setRange } = useDateRangeStore()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  // States
  const [isOpen, setIsOpen] = useState(false)
  const [activeStep, setActiveStep] = useState<'quick' | 'calendar'>('quick')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // Format date range display  
  const formatDateRange = useCallback(() => {
    if (!range.start || !range.end) return 'Выбрать период'

    const formatDate = (date: Date) => {
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      if (date.toDateString() === today.toDateString()) return 'сегодня'
      if (date.toDateString() === yesterday.toDateString()) return 'вчера'

      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short'
      })
    }

    const startFormatted = formatDate(range.start)
    const endFormatted = formatDate(range.end)

    if (startFormatted === endFormatted) return startFormatted
    return `${startFormatted} – ${endFormatted}`
  }, [range])

  // Quick range presets - СОВРЕМЕННЫЙ ДИЗАЙН В СТИЛЕ AVIASALES/NOTION
  const quickPresets = [
    {
      label: 'Сегодня',
      icon: '⚡',
      action: () => {
        const today = new Date()
        setRange({ start: today, end: today })
        setSelectedPreset('today')
      },
      description: 'Только текущий день',
      key: 'today'
    },
    {
      label: 'Неделя',
      icon: '📊',
      action: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 6)
        setRange({ start, end })
        setSelectedPreset('week')
      },
      description: 'Последние 7 дней',
      key: 'week'
    },
    {
      label: 'Месяц',
      icon: '📈',
      action: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 29)
        setRange({ start, end })
        setSelectedPreset('month')
      },
      description: 'Последние 30 дней',
      key: 'month'
    },
    {
      label: 'Квартал',
      icon: '📋',
      action: () => {
        const now = new Date()
        const quarter = Math.floor(now.getMonth() / 3)
        const start = new Date(now.getFullYear(), quarter * 3, 1)
        const end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
        setRange({ start, end })
        setSelectedPreset('quarter')
      },
      description: 'Текущий квартал',
      key: 'quarter'
    }
  ]

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => {
    setIsOpen(false)
    setSelectedPreset(null)
    onClose?.()
  }

  const handleApply = () => {
    setIsOpen(false)
    setSelectedPreset(null)
    onClose?.()
  }

  const handleStepChange = (step: 'quick' | 'calendar') => {
    setActiveStep(step)
    setSelectedPreset(null)
  }

  // Trigger Button
  const TriggerButton = () => (
    <ButtonBase
      onClick={handleOpen}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3,
        py: 1.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.12),
        bgcolor: 'background.paper',
        color: 'text.primary',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        minWidth: 220,
        justifyContent: 'flex-start',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.25),
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`
        },
        '&:active': {
          transform: 'translateY(0) scale(0.98)'
        }
      }}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '0.75rem'
        }}
      >
        📅
      </Box>
      
      <Typography
        variant="body2"
        sx={{
          color: range.start && range.end ? 'text.primary' : 'text.secondary',
          fontWeight: 500,
          letterSpacing: '0.01em'
        }}
      >
        {formatDateRange()}
      </Typography>

      <Box sx={{ ml: 'auto', opacity: 0.6 }}>
        <i className="bx-chevron-down" style={{ fontSize: '1rem' }} />
      </Box>
    </ButtonBase>
  )

  // Mobile Bottom Sheet Content
  const BottomSheetContent = () => (
    <Box
      sx={{
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        borderRadius: '24px 24px 0 0',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
        boxShadow: `0 -12px 40px ${alpha(theme.palette.common.black, 0.15)}`
      }}
    >
      {/* Swipe Handle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 1 }}>
        <Box
          sx={{
            width: 36,
            height: 4,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.text.primary, 0.12),
            transition: 'all 0.2s ease'
          }}
        />
      </Box>

      {/* Header */}
      <Box
        sx={{
          px: 4,
          py: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.04)}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              variant="h5" 
              fontWeight={700} 
              letterSpacing="-0.02em"
              sx={{ 
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              Выбор периода
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ fontSize: '0.875rem', mt: 0.5, fontWeight: 400 }}
            >
              Выберите диапазон для анализа данных
            </Typography>
          </Box>

          <IconButton
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.action.hover, 0.6),
              borderRadius: 2.5,
              width: 40,
              height: 40,
              '&:hover': { 
                bgcolor: 'action.hover',
                transform: 'scale(1.05)'
              }
            }}
          >
            <i className="bx-x" style={{ fontSize: '1.25rem' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Step Navigation - РЕАЛЬНЫЕ ТАБЫ С ИКОНКАМИ */}
      <Box
        sx={{
          display: 'flex',
          px: 4,
          py: 3,
          gap: 1,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.04)}`
        }}
      >
        {[
          { key: 'quick', label: 'Быстрый выбор', icon: '🚀' },
          { key: 'calendar', label: 'Календарь', icon: '📅' }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeStep === tab.key ? 'contained' : 'text'}
            onClick={() => handleStepChange(tab.key as 'quick' | 'calendar')}
            sx={{
              minWidth: 'auto',
              px: 3,
              py: 1.5,
              borderRadius: 3,
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.01em',
              textTransform: 'none',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(activeStep === tab.key ? {
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`
                }
              } : {
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.6),
                  color: 'text.primary'
                }
              })
            }}
          >
            <span style={{ marginRight: '8px', fontSize: '1rem' }}>{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {activeStep === 'quick' ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ padding: '24px' }}
            >
              {/* ПЛИТКИ - ПОЛНОРАЗМЕРНЫЕ W-FULL MIN-H-[72PX] */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {quickPresets.map((preset, index) => (
                  <motion.div
                    key={preset.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <ButtonBase
                      onClick={preset.action}
                      sx={{
                        width: '100%',
                        minHeight: '72px',
                        p: 4,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 3,
                        textAlign: 'left',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        ...(selectedPreset === preset.key ? {
                          // ВЫБРАННАЯ ПЛИТКА - ГРАДИЕНТ С GLOW
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          color: 'white',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.25)}`,
                          transform: 'translateY(-2px)'
                        } : {
                          // ОБЫЧНАЯ ПЛИТКА - СПОКОЙНЫЕ ПРИГЛУШЕННЫЕ ЦВЕТА
                          bgcolor: alpha(theme.palette.action.hover, 0.02),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.action.hover, 0.6),
                            transform: 'translateY(-1px) scale(1.01)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`
                          }
                        }),
                        '&:active': {
                          transform: 'scale(0.95)'
                        }
                      }}
                    >
                      {/* ИКОНКА В КРУЖКЕ */}
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          ...(selectedPreset === preset.key ? {
                            bgcolor: alpha('#ffffff', 0.15),
                            border: `1px solid ${alpha('#ffffff', 0.2)}`
                          } : {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`
                          })
                        }}
                      >
                        {preset.icon}
                      </Box>
                      
                      {/* ТЕКСТОВЫЙ КОНТЕНТ */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{ 
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            mb: 0.5,
                            color: selectedPreset === preset.key ? 'white' : 'text.primary'
                          }}
                        >
                          {preset.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ 
                            fontSize: '0.875rem',
                            color: selectedPreset === preset.key 
                              ? alpha('#ffffff', 0.8) 
                              : 'text.secondary',
                            fontWeight: 400
                          }}
                        >
                          {preset.description}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ padding: '24px' }}
            >
              <Typography variant="h6" color="text.secondary" textAlign="center">
                Календарь (в разработке)
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* ФИКСИРОВАННАЯ ПАНЕЛЬ ПОДТВЕРЖДЕНИЯ СНИЗУ */}
      <AnimatePresence>
        {(selectedPreset || (range.start && range.end)) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 400,
              duration: 0.3
            }}
          >
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                bgcolor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 3,
                zIndex: 10
              }}
            >
              {/* ИНДИКАТОР ВЫБРАННОГО ПЕРИОДА */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '0.8125rem', fontWeight: 500, mb: 0.5 }}
                >
                  ✅ Период:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ 
                    fontSize: '1rem',
                    color: 'text.primary',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {formatDateRange()}
                </Typography>
              </Box>

              {/* КНОПКА ПРИМЕНИТЬ */}
              <Button
                variant="contained"
                size="large"
                onClick={handleApply}
                disabled={!range.start || !range.end}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  borderRadius: 2.5,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.action.disabled, 0.12),
                    color: alpha(theme.palette.action.disabled, 0.26)
                  }
                }}
              >
                Применить
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )

  return (
    <>
      <TriggerButton />
      <Drawer
        anchor="bottom"
        open={isOpen}
        onClose={handleClose}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: 'transparent',
            boxShadow: 'none'
          }
        }}
      >
        <BottomSheetContent />
      </Drawer>
    </>
  )
}

export default ModernDatePicker 