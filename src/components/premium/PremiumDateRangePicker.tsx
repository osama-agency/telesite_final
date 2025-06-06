'use client'

// React Imports
import React, { useState, useCallback, useRef, useEffect } from 'react'

// MUI Imports
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isYesterday } from 'date-fns'
import { ru } from 'date-fns/locale'

// Third-party Imports
import { motion, AnimatePresence } from 'framer-motion'

// Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Store Imports
import { useDateRangeStore } from '@/store/dateRangeStore'

// Styles
import '@/styles/premium-calendar.css'

// Types
interface DateRangePreset {
  key: string
  label: string
  icon: string
  getRange: () => { start: Date; end: Date }
}

interface PremiumDateRangePickerProps {
  className?: string
  sticky?: boolean
  stickyTop?: number
}

const PremiumDateRangePicker: React.FC<PremiumDateRangePickerProps> = ({
  className = '',
  sticky = true,
  stickyTop = 64
}) => {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const { range, setRange } = useDateRangeStore()

  // States
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomCalendar, setShowCustomCalendar] = useState(false)
  const [tempRange, setTempRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })

  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Quick presets with proper Russian formatting
  const presets: DateRangePreset[] = [
    {
      key: 'today',
      label: 'Сегодня',
      icon: '📅',
      getRange: () => ({ start: new Date(), end: new Date() })
    },
    {
      key: 'yesterday',
      label: 'Вчера',
      icon: '⏪',
      getRange: () => {
        const date = subDays(new Date(), 1)
        return { start: date, end: date }
      }
    },
    {
      key: 'week',
      label: 'Неделя',
      icon: '📊',
      getRange: () => ({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: endOfWeek(new Date(), { weekStartsOn: 1 })
      })
    },
    {
      key: 'month',
      label: 'Месяц',
      icon: '🗓️',
      getRange: () => ({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
      })
    },
    {
      key: 'quarter',
      label: 'Квартал',
      icon: '📈',
      getRange: () => {
        const now = new Date()
        const quarter = Math.floor(now.getMonth() / 3)
        return {
          start: new Date(now.getFullYear(), quarter * 3, 1),
          end: new Date(now.getFullYear(), quarter * 3 + 3, 0)
        }
      }
    }
  ]

  // Format date range for display
  const formatDateRange = useCallback(() => {
    if (!range.start || !range.end) return 'Выберите период'

    // Special formatting for common presets
    if (range.start.getTime() === range.end.getTime()) {
      if (isToday(range.start)) return 'Сегодня'
      if (isYesterday(range.start)) return 'Вчера'
    }

    // Standard range formatting
    const formatDate = (date: Date) => format(date, 'dd MMM', { locale: ru })
    const year = range.end.getFullYear() !== new Date().getFullYear() ? ` ${range.end.getFullYear()}` : ''

    return `${formatDate(range.start)} – ${formatDate(range.end)}${year}`
  }, [range])

  // Get active preset key
  const getActivePreset = useCallback(() => {
    if (!range.start || !range.end) return null

    return presets.find(preset => {
      const presetRange = preset.getRange()
      return presetRange.start.toDateString() === range.start?.toDateString() &&
             presetRange.end.toDateString() === range.end?.toDateString()
    })?.key || null
  }, [range, presets])

  // Apply preset
  const applyPreset = useCallback((preset: DateRangePreset) => {
    const presetRange = preset.getRange()
    setRange({ start: presetRange.start, end: presetRange.end })
    setIsOpen(false)
    setShowCustomCalendar(false)
  }, [setRange])

  // Handle custom range selection
  const handleCustomRangeChange = useCallback((dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    setTempRange({ start, end })

    if (start && end) {
      // Auto-swap if end is before start
      if (start > end) {
        setTempRange({ start: end, end: start })
      }
    }
  }, [])

  // Apply custom range
  const applyCustomRange = useCallback(() => {
    if (tempRange.start && tempRange.end) {
      const start = tempRange.start
      const end = tempRange.end

      // Ensure proper order
      setRange({
        start: start <= end ? start : end,
        end: start <= end ? end : start
      })
      setIsOpen(false)
      setShowCustomCalendar(false)
      setTempRange({ start: null, end: null })
    }
  }, [tempRange, setRange])

  // Reset range
  const resetRange = useCallback(() => {
    setRange({ start: null, end: null })
    setTempRange({ start: null, end: null })
    setIsOpen(false)
    setShowCustomCalendar(false)
  }, [setRange])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setShowCustomCalendar(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const activePreset = getActivePreset()
  const isRangeSelected = range.start && range.end
  const hasValidTempRange = tempRange.start && tempRange.end

  return (
    <Box
      className={className}
      sx={{
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? stickyTop : 'auto',
        zIndex: 100,
        ...(isDesktop && {
          minWidth: 280,
          maxWidth: 400
        })
      }}
    >
      {/* Main Button */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      >
        <Button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          variant="outlined"
          size={isDesktop ? 'medium' : 'small'}
          startIcon={
            <Box
              component="i"
              className="bx-calendar"
              sx={{
                fontSize: '1.2rem',
                color: 'primary.main',
                filter: 'drop-shadow(0 0 4px rgba(var(--mui-palette-primary-mainChannel) / 0.3))'
              }}
            />
          }
          endIcon={
            isRangeSelected && (
              <Tooltip title="Сбросить период">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    resetRange()
                  }}
                  sx={{
                    p: 0.5,
                    ml: 0.5,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Box component="i" className="bx-x" sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            )
          }
          sx={{
            minWidth: isDesktop ? 200 : 150,
            px: 2.5,
            py: 1.5,
            bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
            backdropFilter: 'blur(8px)',
            border: '1px solid',
            borderColor: activePreset ? 'primary.main' : 'rgba(var(--mui-palette-primary-mainChannel) / 0.5)',
            borderRadius: 2,
            background: activePreset
              ? 'linear-gradient(135deg, rgba(var(--mui-palette-primary-mainChannel) / 0.15) 0%, rgba(var(--mui-palette-primary-mainChannel) / 0.08) 100%)'
              : 'rgba(var(--mui-palette-background-paper) / 0.8)',
            boxShadow: activePreset
              ? '0 2px 8px rgba(var(--mui-palette-primary-mainChannel) / 0.25)'
              : '0 1px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.12)',
              borderColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.7)',
              boxShadow: '0 4px 12px rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'translateY(0px)'
            }
          }}
        >
          <Typography
            variant={isDesktop ? 'body2' : 'caption'}
            sx={{
              fontWeight: 600,
              color: isRangeSelected ? 'text.primary' : 'text.secondary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {formatDateRange()}
          </Typography>
        </Button>
      </motion.div>

      {/* Premium Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
              scale: { duration: 0.15 }
            }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: isDesktop ? 'auto' : 0,
              marginTop: theme.spacing(1),
              zIndex: 1300
            }}
          >
            <Paper
              elevation={16}
              sx={{
                width: isDesktop ? 420 : '100%',
                maxWidth: '100vw',
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                backdropFilter: 'blur(20px)',
                border: '1px solid',
                borderColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.12)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 20px rgba(var(--mui-palette-primary-mainChannel) / 0.1)'
              }}
            >
              {/* Header */}
              <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Выберите период
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setIsOpen(false)}
                    sx={{
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <Box component="i" className="bx-x" />
                  </IconButton>
                </Box>

                {/* Current Period Indicator */}
                {isRangeSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        mb: 2,
                        px: 2,
                        py: 1,
                        bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
                        borderRadius: 1.5,
                        border: '1px solid rgba(var(--mui-palette-primary-mainChannel) / 0.2)'
                      }}
                    >
                      За период: {formatDateRange()}
                    </Typography>
                  </motion.div>
                )}

                {/* Quick Presets */}
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {presets.map((preset, index) => (
                    <motion.div
                      key={preset.key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        size="small"
                        variant={activePreset === preset.key ? 'contained' : 'outlined'}
                        onClick={() => applyPreset(preset)}
                        startIcon={<span style={{ fontSize: '0.9rem' }}>{preset.icon}</span>}
                        sx={{
                          minWidth: 'auto',
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease',
                          ...(activePreset === preset.key ? {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            boxShadow: '0 2px 8px rgba(var(--mui-palette-primary-mainChannel) / 0.4)'
                          } : {
                            borderColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
                            '&:hover': {
                              bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
                              borderColor: 'primary.main'
                            }
                          })
                        }}
                      >
                        {preset.label}
                      </Button>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: presets.length * 0.05 }}
                  >
                    <Button
                      size="small"
                      variant={showCustomCalendar ? 'contained' : 'outlined'}
                      onClick={() => setShowCustomCalendar(!showCustomCalendar)}
                      startIcon={<Box component="i" className="bx-calendar-edit" />}
                      sx={{
                        minWidth: 'auto',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        borderColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      Свой диапазон
                    </Button>
                  </motion.div>
                </Stack>
              </Box>

              {/* Custom Calendar */}
              <AnimatePresence>
                {showCustomCalendar && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Divider />
                    <Box sx={{ p: 3 }}>
                                            <AppReactDatepicker
                        selectsRange
                        startDate={tempRange.start || range.start || undefined}
                        endDate={tempRange.end || range.end || undefined}
                        onChange={handleCustomRangeChange}
                        monthsShown={isDesktop ? 2 : 1}
                        inline
                        locale={ru}
                        dateFormat="dd.MM.yyyy"
                        calendarClassName="premium-calendar"
                      />

                      {/* Action Buttons */}
                      {(tempRange.start || tempRange.end) && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={applyCustomRange}
                              disabled={!hasValidTempRange}
                              sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(var(--mui-palette-primary-mainChannel) / 0.4)',
                                '&:hover': {
                                  boxShadow: '0 6px 16px rgba(var(--mui-palette-primary-mainChannel) / 0.5)'
                                }
                              }}
                            >
                              Применить
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setTempRange({ start: null, end: null })
                                setShowCustomCalendar(false)
                              }}
                              sx={{
                                py: 1.5,
                                px: 3,
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                textTransform: 'none'
                              }}
                            >
                              Отмена
                            </Button>
                          </Stack>
                        </motion.div>
                      )}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset Option */}
              {isRangeSelected && !showCustomCalendar && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Divider />
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Button
                      size="small"
                      onClick={resetRange}
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        textDecoration: 'underline',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: 'transparent',
                          textDecoration: 'none',
                          color: 'error.main'
                        }
                      }}
                    >
                      Сбросить период
                    </Button>
                  </Box>
                </motion.div>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom styles for calendar */}
      <style jsx global>{`
        .premium-calendar .react-datepicker {
          border: none;
          box-shadow: none;
          background: transparent;
        }

        .premium-calendar .react-datepicker__header {
          background: transparent;
          border: none;
          padding-bottom: 16px;
        }

        .premium-calendar .react-datepicker__current-month {
          font-weight: 700;
          font-size: 1rem;
          color: var(--mui-palette-text-primary);
        }

        .premium-calendar-day {
          transition: all 0.2s ease;
        }

        .premium-calendar-day.in-hover-range {
          background-color: rgba(var(--mui-palette-primary-mainChannel) / 0.12) !important;
          color: var(--mui-palette-primary-main) !important;
        }

        .premium-calendar .react-datepicker__day:hover {
          background-color: rgba(var(--mui-palette-primary-mainChannel) / 0.1);
          transform: scale(1.05);
        }

        .premium-calendar .react-datepicker__day--selected {
          background-color: var(--mui-palette-primary-main) !important;
          color: white !important;
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(var(--mui-palette-primary-mainChannel) / 0.4);
        }

        .premium-calendar .react-datepicker__day--in-range {
          background-color: rgba(var(--mui-palette-primary-mainChannel) / 0.15) !important;
          color: var(--mui-palette-primary-main) !important;
        }

        .premium-calendar .react-datepicker__day--range-start,
        .premium-calendar .react-datepicker__day--range-end {
          background-color: var(--mui-palette-primary-main) !important;
          color: white !important;
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(var(--mui-palette-primary-mainChannel) / 0.4);
        }
      `}</style>
    </Box>
  )
}

export default PremiumDateRangePicker
