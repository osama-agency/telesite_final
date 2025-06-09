'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Drawer,
  Paper,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
  ButtonBase,
  Divider,
  ClickAwayListener,
  Popper,
  SwipeableDrawer
} from '@mui/material'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { useDateRangeStore } from '@/store/dateRangeStore'

interface PremiumDateRangePickerProps {
  sticky?: boolean
  stickyTop?: number
  className?: string
}

const PremiumDateRangePicker: React.FC<PremiumDateRangePickerProps> = ({
  sticky = false,
  stickyTop = 64,
  className = ''
}) => {
  const { range, setRange } = useDateRangeStore()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  // States
  const [isOpen, setIsOpen] = useState(false)
  const [activeStep, setActiveStep] = useState<'quick' | 'calendar'>('quick')
  const anchorRef = useRef<HTMLButtonElement>(null)

  console.log('🗓️ PremiumDateRangePicker component rendered')

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

  // Quick range presets - ОБНОВЛЕННЫЕ ПО СПЕЦИФИКАЦИЯМ ДИЗАЙНЕРА
  const quickPresets = [
    {
      label: 'Сегодня',
      icon: '⚡',
      action: () => {
        const today = new Date()
        setRange({ start: today, end: today })
        if (isMobile) setIsOpen(false)
      },
      description: 'Только текущий день',
      isSelected: () => {
        if (!range.start || !range.end) return false
        const today = new Date()
        return range.start.toDateString() === today.toDateString() && 
               range.end.toDateString() === today.toDateString()
      }
    },
    {
      label: 'Вчера',
      icon: '⏰',
      action: () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        setRange({ start: yesterday, end: yesterday })
        if (isMobile) setIsOpen(false)
      },
      description: 'Только вчерашний день',
      isSelected: () => {
        if (!range.start || !range.end) return false
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        return range.start.toDateString() === yesterday.toDateString() && 
               range.end.toDateString() === yesterday.toDateString()
      }
    },
    {
      label: 'Неделя',
      icon: '📊',
      action: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 6)
        setRange({ start, end })
        if (isMobile) setIsOpen(false)
      },
      description: 'Последние 7 дней',
      isSelected: () => {
        if (!range.start || !range.end) return false
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 6)
        return Math.abs(range.start.getTime() - start.getTime()) < 86400000 && 
               Math.abs(range.end.getTime() - end.getTime()) < 86400000
      }
    },
    {
      label: 'Месяц',
      icon: '📈',
      action: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 29)
        setRange({ start, end })
        if (isMobile) setIsOpen(false)
      },
      description: 'Последние 30 дней',
      isSelected: () => {
        if (!range.start || !range.end) return false
        const end = new Date()
        const start = new Date()
        start.setDate(end.getDate() - 29)
        return Math.abs(range.start.getTime() - start.getTime()) < 86400000 && 
               Math.abs(range.end.getTime() - end.getTime()) < 86400000
      }
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
        if (isMobile) setIsOpen(false)
      },
      description: 'Текущий квартал',
      isSelected: () => {
        if (!range.start || !range.end) return false
        const now = new Date()
        const quarter = Math.floor(now.getMonth() / 3)
        const start = new Date(now.getFullYear(), quarter * 3, 1)
        const end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
        return Math.abs(range.start.getTime() - start.getTime()) < 86400000 && 
               Math.abs(range.end.getTime() - end.getTime()) < 86400000
      }
    },
    {
      label: 'Весь период',
      icon: '🌍',
      action: () => {
        const start = new Date('2020-01-01')
        const end = new Date()
        setRange({ start, end })
        if (isMobile) setIsOpen(false)
      },
      description: 'Все доступные данные',
      isSelected: () => {
        if (!range.start || !range.end) return false
        const yearStart = new Date('2020-01-01')
        const today = new Date()
        return Math.abs(range.start.getTime() - yearStart.getTime()) < 86400000 && 
               Math.abs(range.end.getTime() - today.getTime()) < 86400000
      }
    }
  ]

  // Handle open/close
  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setActiveStep('quick')
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleStepChange = useCallback((step: 'quick' | 'calendar') => {
    setActiveStep(step)
  }, [])

  // Desktop Trigger Button
  const triggerButton = (
    <ButtonBase
      ref={anchorRef}
      onClick={handleOpen}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.25,
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
        },
        ...(sticky && {
          position: 'sticky',
          top: stickyTop,
          zIndex: 100
        })
      }}
      className={className}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '0.75rem'
        }}
      >
        <i className="bx-calendar" />
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

  // Mobile Bottom Sheet Content - КОМПАКТНЫЙ С SWIPE-TO-DISMISS
  const bottomSheetContent = (
    <Box
      sx={{
        height: '75vh',
        maxHeight: '650px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        borderRadius: '24px 24px 0 0',
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: `0 -8px 32px ${alpha(theme.palette.common.black, 0.12)}`
      }}
    >
      {/* Swipe Handle - улучшенный для swipe gesture */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: 2,
          pb: 1.5,
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          }
        }}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY
          const handleTouchMove = (moveEvent: TouchEvent) => {
            const currentY = moveEvent.touches[0].clientY
            const diff = currentY - startY
            if (diff > 50) { // Swipe down threshold
              handleClose()
              document.removeEventListener('touchmove', handleTouchMove)
            }
          }
          document.addEventListener('touchmove', handleTouchMove, { passive: true })
          document.addEventListener('touchend', () => {
            document.removeEventListener('touchmove', handleTouchMove)
          }, { once: true })
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.text.primary, 0.2),
            background: `linear-gradient(90deg, ${alpha(theme.palette.text.primary, 0.15)} 0%, ${alpha(theme.palette.text.primary, 0.25)} 50%, ${alpha(theme.palette.text.primary, 0.15)} 100%)`
          }}
        />
      </Box>

      {/* Header - улучшенный с иконкой календаря слева */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            <i className="bx-calendar" style={{ fontSize: '1.125rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600} letterSpacing="-0.01em">
              Выбор периода
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ fontSize: '0.8125rem', mt: 0.25 }}
            >
              Выберите диапазон для анализа
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={handleClose}
          sx={{
            color: 'text.secondary',
            bgcolor: alpha(theme.palette.action.hover, 0.5),
            '&:hover': { 
              bgcolor: 'action.hover',
              transform: 'scale(1.05)'
            }
          }}
        >
          <i className="bx-x" />
        </IconButton>
      </Box>

      {/* Step Navigation - ЭТАП 1 и ЭТАП 2 */}
      <Box
        sx={{
          display: 'flex',
          px: 3,
          py: 2.5,
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`
        }}
      >
        <Chip
          label="🚀 Этап 1: Быстрый выбор"
          variant={activeStep === 'quick' ? 'filled' : 'outlined'}
          onClick={() => handleStepChange('quick')}
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            px: 1,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(activeStep === 'quick' && {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '& .MuiChip-label': { color: 'white' },
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }),
            '&:hover': {
              transform: 'translateY(-1px)'
            }
          }}
        />
        <Chip
          label="📅 Этап 2: Календарь"
          variant={activeStep === 'calendar' ? 'filled' : 'outlined'}
          onClick={() => handleStepChange('calendar')}
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            px: 1,
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            ...(activeStep === 'calendar' && {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '& .MuiChip-label': { color: 'white' },
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }),
            '&:hover': {
              transform: 'translateY(-1px)'
            }
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        <AnimatePresence mode="wait">
          {activeStep === 'quick' ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Box sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {quickPresets.map((preset, index) => {
                  const isSelected = preset.isSelected()
                  return (
                    <motion.div
                      key={preset.label}
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
                          minHeight: 72,
                          p: 2,
                          borderRadius: 3,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          textAlign: 'left',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          // СПОКОЙНЫЕ ПРИГЛУШЕННЫЕ ЦВЕТА ПО УМОЛЧАНИЮ
                          ...(isSelected ? {
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            boxShadow: `0 8px 32px ${alpha('#6366f1', 0.25)}`,
                            transform: 'translateY(-2px)',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: `0 12px 40px ${alpha('#6366f1', 0.3)}`
                            }
                          } : {
                            bgcolor: alpha(theme.palette.action.hover, 0.02),
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            color: 'text.primary',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.action.hover, 0.05),
                              transform: 'translateY(-1px) scale(1.01)',
                              boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`
                            }
                          }),
                          '&:active': {
                            transform: isSelected ? 'translateY(-1px) scale(0.98)' : 'translateY(0) scale(0.98)'
                          }
                        }}
                      >
                        {/* Icon Container */}
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            flexShrink: 0,
                            ...(isSelected ? {
                              bgcolor: alpha('white', 0.15),
                              color: 'white'
                            } : {
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.main
                            })
                          }}
                        >
                          {preset.icon}
                        </Box>

                        {/* Text Content */}
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: '1.125rem',
                              fontWeight: 600,
                              lineHeight: 1.2,
                              mb: 0.5,
                              color: isSelected ? 'white' : 'text.primary'
                            }}
                          >
                            {preset.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.875rem',
                              lineHeight: 1.3,
                              color: isSelected ? alpha('white', 0.8) : 'text.secondary'
                            }}
                          >
                            {preset.description}
                          </Typography>
                        </Box>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: alpha('white', 0.2),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}
                          >
                            ✓
                          </Box>
                        )}
                      </ButtonBase>
                    </motion.div>
                  )
                })}
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  pt: 2,
                  px: 1,
                  // СОВРЕМЕННЫЙ КАЛЕНДАРЬ - BEST PRACTICES
                  '& .react-datepicker': {
                    border: 'none',
                    bgcolor: 'transparent',
                    fontFamily: theme.typography.fontFamily,
                    borderRadius: 4,
                    width: '100%'
                  },
                  // HEADER С НАВИГАЦИЕЙ
                  '& .react-datepicker__header': {
                    bgcolor: 'transparent',
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    pb: 3,
                    mb: 2,
                    position: 'relative'
                  },
                  // НАЗВАНИЕ МЕСЯЦА И ГОДА
                  '& .react-datepicker__current-month': {
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 3,
                    letterSpacing: '-0.01em',
                    textAlign: 'center'
                  },
                  // КНОПКИ НАВИГАЦИИ
                  '& .react-datepicker__navigation': {
                    top: '16px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.action.hover, 0.05),
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'scale(1.05)'
                    },
                    '&::before': {
                      borderColor: theme.palette.text.secondary,
                      borderWidth: '2px 2px 0 0',
                      width: '8px',
                      height: '8px'
                    }
                  },
                  '& .react-datepicker__navigation--previous': {
                    left: '20px'
                  },
                  '& .react-datepicker__navigation--next': {
                    right: '20px'
                  },
                  // ДНИ НЕДЕЛИ
                  '& .react-datepicker__day-names': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1
                  },
                  '& .react-datepicker__day-name': {
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: theme.palette.text.secondary,
                    width: '44px',
                    height: '32px',
                    lineHeight: '32px',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  },
                  // СТРОКИ С ДАТАМИ
                  '& .react-datepicker__week': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5
                  },
                  // ДНИ КАЛЕНДАРЯ
                  '& .react-datepicker__day': {
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '1px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    cursor: 'pointer',
                    // ОБЫЧНОЕ СОСТОЯНИЕ
                    color: theme.palette.text.primary,
                    bgcolor: 'transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'scale(1.1)',
                      zIndex: 2,
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`
                    }
                  },
                  // ВЫБРАННАЯ ДАТА
                  '& .react-datepicker__day--selected': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white !important',
                    fontWeight: 700,
                    boxShadow: `0 4px 16px ${alpha('#6366f1', 0.3)}`,
                    transform: 'scale(1.05)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5855d6 0%, #7c3aed 100%)',
                      transform: 'scale(1.1)',
                      boxShadow: `0 6px 20px ${alpha('#6366f1', 0.4)}`
                    }
                  },
                  // ДИАПАЗОН ДАТ
                  '& .react-datepicker__day--in-range': {
                    bgcolor: alpha('#6366f1', 0.12),
                    color: '#6366f1',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: alpha('#6366f1', 0.18),
                      transform: 'scale(1.05)'
                    }
                  },
                  // НАЧАЛО И КОНЕЦ ДИАПАЗОНА
                  '& .react-datepicker__day--range-start, & .react-datepicker__day--range-end': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    color: 'white !important',
                    fontWeight: 700,
                    boxShadow: `0 4px 16px ${alpha('#6366f1', 0.3)}`
                  },
                  // СЕГОДНЯ
                  '& .react-datepicker__day--today': {
                    fontWeight: 700,
                    color: '#6366f1',
                    bgcolor: alpha('#6366f1', 0.05),
                    border: `2px solid #6366f1`,
                    '&:hover': {
                      bgcolor: alpha('#6366f1', 0.1),
                      transform: 'scale(1.1)'
                    }
                  },
                  // ОТКЛЮЧЕННЫЕ ДАТЫ
                  '& .react-datepicker__day--disabled': {
                    color: theme.palette.action.disabled,
                    cursor: 'not-allowed',
                    '&:hover': {
                      bgcolor: 'transparent',
                      transform: 'none'
                    }
                  },
                  // ДАТЫ ИЗ ДРУГИХ МЕСЯЦЕВ
                  '& .react-datepicker__day--outside-month': {
                    color: alpha(theme.palette.text.secondary, 0.4),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.action.hover, 0.05)
                    }
                  }
                }}
              >
                <AppReactDatepicker
                  selectsRange
                  startDate={range.start ?? undefined}
                  endDate={range.end ?? undefined}
                  onChange={(dates: [Date | null, Date | null]) =>
                    setRange({ start: dates[0], end: dates[1] })
                  }
                  inline
                  monthsShown={1}
                  dateFormat="dd.MM.yyyy"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                  calendarStartDay={1}
                  locale="ru"
                  fixedHeight
                  shouldCloseOnSelect={false}
                />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Bottom Action Bar - ФИКСИРОВАННАЯ НИЖНЯЯ ПАНЕЛЬ */}
      <AnimatePresence>
        {(range.start || range.end) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
          >
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                zIndex: 1400
              }}
            >
              {/* Selected Range Display - СПЕЦИФИКАЦИЯ ДИЗАЙНЕРА */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`
                }}
              >
                <Box sx={{ fontSize: '1.25rem' }}>✅</Box>
                <Typography
                  variant="body1"
                  sx={{ 
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Период: <strong style={{ color: theme.palette.primary.main }}>{formatDateRange()}</strong>
                </Typography>
              </Box>

              {/* Apply Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleClose}
                disabled={!range.start || !range.end}
                sx={{
                  py: 2,
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: `0 4px 12px ${alpha('#6366f1', 0.3)}`,
                  minHeight: 56,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5855d6 0%, #7c3aed 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha('#6366f1', 0.4)}`
                  },
                  '&:active': {
                    transform: 'translateY(0)'
                  },
                  '&:disabled': {
                    background: alpha(theme.palette.action.disabled, 0.12),
                    color: theme.palette.action.disabled
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

  // Desktop Popover Content - упрощенный
  const desktopContent = (
    <ClickAwayListener onClickAway={handleClose}>
      <Paper
        elevation={12}
        sx={{
          minWidth: 360,
          maxWidth: 480,
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: `0 12px 48px ${alpha(theme.palette.common.black, 0.15)}`
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`
          }}
        >
          <Typography variant="h6" fontWeight={700} letterSpacing="-0.01em">
            Выбор периода
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.8125rem', mt: 0.5 }}
          >
            Выберите диапазон дат для анализа
          </Typography>
        </Box>

        {/* Quick Presets */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {quickPresets.map((preset) => (
              <Grid item xs={6} key={preset.label}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={preset.action}
                  startIcon={<i className={preset.icon} />}
                  sx={{
                    py: 1.5,
                    fontSize: '0.8125rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 3,
                    borderColor: alpha(theme.palette.divider, 0.12),
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.25),
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                    }
                  }}
                >
                  {preset.label}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Current Selection */}
          {(range.start || range.end) && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.8125rem', mb: 0.75, fontWeight: 500 }}
              >
                Выбранный период:
              </Typography>
              <Typography
                variant="body1"
                color="primary"
                fontWeight={700}
                letterSpacing="-0.01em"
                sx={{ fontSize: '1.0625rem' }}
              >
                {formatDateRange()}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </ClickAwayListener>
  )

  return (
    <>
      {triggerButton}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={isOpen}
          onClose={handleClose}
          onOpen={handleOpen}
          disableSwipeToOpen={true}
          PaperProps={{
            sx: {
              bgcolor: 'transparent',
              boxShadow: 'none'
            }
          }}
          ModalProps={{
            sx: {
              backdropFilter: 'blur(12px)',
              bgcolor: alpha(theme.palette.common.black, 0.4)
            }
          }}
        >
          {bottomSheetContent}
        </SwipeableDrawer>
      )}

      {/* Desktop Popover */}
      {!isMobile && (
        <Popper
          open={isOpen}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          sx={{ zIndex: 1300 }}
        >
          {desktopContent}
        </Popper>
      )}
    </>
  )
}

export default PremiumDateRangePicker 