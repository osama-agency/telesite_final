'use client'

// React Imports
import React, { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

// Next Imports
import { usePathname } from 'next/navigation'

// MUI Imports
import classnames from 'classnames'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Slide from '@mui/material/Slide'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'
import { alpha } from '@mui/material/styles'

// Component Imports
import NavToggle from './NavToggle'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { Calendar, ChevronDown } from 'lucide-react'

// Dynamic import to prevent hydration issues
const PremiumDateRangePicker = dynamic(
  () => import('@/components/premium/PremiumDateRangePicker'),
  {
    ssr: false,
    loading: () => <div style={{ width: 160, height: 40 }} />
  }
)

// Store Imports
import { useDateRangeStore } from '@/store/dateRangeStore'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// -------- helper hook for mounted --------
const useMounted = () => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

// Transition component for bottom-up animation
const SlideTransition = React.forwardRef<unknown, TransitionProps & { children: React.ReactElement }>((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
))

const NavbarContent = () => {
  const theme = useTheme()
  const pathname = usePathname()
  const { range, setRange } = useDateRangeStore()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true })
  const isMobileCalendarWide = useMediaQuery('(min-width: 380px)', { noSsr: true })
  const mounted = useMounted()
  const [fullScreenDatePicker, setFullScreenDatePicker] = useState(false)

  // Hide date picker on account settings page
  const shouldHideDatePicker = pathname?.includes('/pages/account-settings')

  const handleDatePickerClick = () => {
    setFullScreenDatePicker(true)
  }

  const handleDatePickerClose = () => {
    setFullScreenDatePicker(false)
  }

  // Date formatting functions - предотвращаем hydration mismatch
  const formatDateRange = useCallback(() => {
    // Проверяем, что мы на клиенте, чтобы избежать hydration mismatch
    if (typeof window === 'undefined') {
      return 'Выберите период'
    }

    if (!range.start && !range.end) {
      return 'Выберите период'
    }

    if (range.start && !range.end) {
      return `С ${formatDate(range.start)}`
    }

    if (!range.start && range.end) {
      return `По ${formatDate(range.end)}`
    }

    if (range.start && range.end) {
      if (range.start.toDateString() === range.end.toDateString()) {
        return formatDate(range.start)
      }

      return `${formatDate(range.start)} - ${formatDate(range.end)}`
    }

    return 'Период не выбран'
  }, [range])

  const formatDate = (date: Date) => {
    // Проверяем, что мы на клиенте
    if (typeof window === 'undefined') {
      return ''
    }

    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
  }

  const formatExampleRange = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const formatDate = (date: Date) =>
      date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    return `${formatDate(yesterday)} - ${formatDate(today)}`
  }

  const formatSingleDate = (date: Date | null, prefix: string) => {
    if (!date) return `${prefix}: не выбрано`
    const formatted = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    return `${prefix}: ${formatted}`
  }

  // Quick range setters
  const setToday = () => {
    const today = new Date()
    setRange({ start: today, end: today })
  }

  const setQuickRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days + 1)
    setRange({ start, end })
  }

  const setQuarter = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const quarterStart = new Date(now.getFullYear(), Math.floor(currentMonth / 3) * 3, 1)
    const quarterEnd = new Date(now.getFullYear(), Math.floor(currentMonth / 3) * 3 + 3, 0)
    setRange({ start: quarterStart, end: quarterEnd })
  }

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-2 is-full')}>
      {/* Left: Nav Toggle only */}
      <div className='flex items-center gap-3'>
        <NavToggle />
      </div>

      {/* Right: Premium Date Range Picker */}
      <div className='flex items-center gap-3'>
        {/* Premium Date Range Picker - скрыть на странице настроек аккаунта */}
        {!shouldHideDatePicker && mounted && (
          <>
            {isDesktop ? (
              <Box suppressHydrationWarning>
                <PremiumDateRangePicker
                  sticky={true}
                  stickyTop={64}
                  className="premium-date-picker-desktop"
                />
              </Box>
            ) : (
              /* Mobile: Premium date picker button */
              <Box
                component="button"
                suppressHydrationWarning
                onClick={handleDatePickerClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 3,
                  py: 2,
                  border: 'none',
                  borderRadius: 1.5, // rounded-md
                  bgcolor: theme.palette.mode === 'dark' ? '#20202A' : alpha(theme.palette.action.hover, 0.02),
                  color: 'text.secondary',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '0.875rem', // text-sm
                  fontWeight: 500, // font-medium
                  minWidth: 160,
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha('#20202A', 0.8)
                      : alpha(theme.palette.action.hover, 0.06),
                    boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`, // ring-1 ring-primary/20
                    color: 'text.primary'
                  },
                  '&:focus-visible': {
                    outline: 'none',
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                {/* Lucide Calendar Icon */}
                <Calendar
                  size={16}
                  strokeWidth={1.5}
                  color={theme.palette.text.secondary}
                  style={{ flexShrink: 0 }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}
                  suppressHydrationWarning={true}
                >
                  {formatDateRange()}
                </Typography>

                {/* Lucide ChevronDown Icon */}
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  color={theme.palette.text.secondary}
                  style={{
                    flexShrink: 0,
                    opacity: 0.7,
                    transition: 'transform 0.2s ease'
                  }}
                />
              </Box>
            )}
          </>
        )}
      </div>

      {/* Mobile Full-Screen Date Picker */}
      {mounted && (
        <Dialog
          fullScreen
          open={fullScreenDatePicker}
          onClose={handleDatePickerClose}
          TransitionComponent={SlideTransition}
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: 'background.default'
            }
          }}
        >
          {/* Header */}
          <AppBar
            position="relative"
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
              backdropFilter: 'blur(20px)',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Toolbar sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 1,
              py: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <IconButton
                  edge="start"
                  onClick={handleDatePickerClose}
                  sx={{
                    color: 'text.primary',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    width: 40,
                    height: 40,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 4px 12px ${theme.palette.primary.main}25`
                    }
                  }}
                >
                  <i className="bx-x" style={{ fontSize: '20px' }} />
                </IconButton>
                <Typography
                  sx={{
                    ml: 2,
                    flex: 1,
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    letterSpacing: '-0.025em'
                  }}
                  variant="h6"
                  component="div"
                  color="text.primary"
                >
                  Выберите диапазон
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  ml: 7,
                  fontSize: '0.875rem',
                  opacity: 0.8
                }}
              >
                Пример: {formatExampleRange()}
              </Typography>
            </Toolbar>
          </AppBar>

          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: 3,
            pb: 0
          }}>
            {/* Quick Actions Grid 2x2 */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Быстрый выбор
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={setToday}
                    startIcon={<i className="bx-calendar-event" />}
                    sx={{
                      py: 1.5,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                        borderColor: 'primary.main',
                        bgcolor: `${theme.palette.primary.main}08`
                      }
                    }}
                  >
                    Сегодня
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setQuickRange(7)}
                    startIcon={<i className="bx-calendar-week" />}
                    sx={{
                      py: 1.5,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                        borderColor: 'primary.main',
                        bgcolor: `${theme.palette.primary.main}08`
                      }
                    }}
                  >
                    Неделя
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setQuickRange(30)}
                    startIcon={<i className="bx-calendar" />}
                    sx={{
                      py: 1.5,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                        borderColor: 'primary.main',
                        bgcolor: `${theme.palette.primary.main}08`
                      }
                    }}
                  >
                    30 дней
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={setQuarter}
                    startIcon={<i className="bx-calendar-alt" />}
                    sx={{
                      py: 1.5,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: 'divider',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                        borderColor: 'primary.main',
                        bgcolor: `${theme.palette.primary.main}08`
                      }
                    }}
                  >
                    Квартал
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {/* Calendar Container */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              mb: 3,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}03 0%, ${theme.palette.secondary.main}03 100%)`,
                borderRadius: 3,
                zIndex: 0
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <AppReactDatepicker
                  selectsRange
                  startDate={range.start ?? undefined}
                  endDate={range.end ?? undefined}
                  onChange={(dates: [Date | null, Date | null]) =>
                    setRange({ start: dates[0], end: dates[1] })
                  }
                  inline
                  monthsShown={isMobileCalendarWide ? 2 : 1}
                  dateFormat="dd.MM.yyyy"
                  calendarClassName="premium-mobile-calendar"
                />
              </Box>
            </Box>

            {/* Selected Range Display */}
            {(range.start || range.end) && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 3,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
                  border: `1px solid ${theme.palette.primary.main}15`,
                  backdropFilter: 'blur(10px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                  }
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 1.5,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Выбранный период
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        boxShadow: `0 0 8px ${theme.palette.primary.main}50`
                      }}
                    />
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                      {formatSingleDate(range.start, 'С')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'secondary.main',
                        boxShadow: `0 0 8px ${theme.palette.secondary.main}50`
                      }}
                    />
                    <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                      {formatSingleDate(range.end, 'По')}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, p: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleDatePickerClose}
                sx={{
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: 'divider',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'text.secondary',
                    transform: 'translateY(-1px)',
                    boxShadow: `0 2px 8px ${theme.palette.grey[400]}30`
                  }
                }}
              >
                Отменить
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleDatePickerClose}
                sx={{
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${theme.palette.primary.main}40`,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                  }
                }}
              >
                Применить
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}
    </div>
  )
}

export default NavbarContent
