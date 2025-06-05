'use client'

// React Imports
import React, { useState, useCallback } from 'react'

// MUI Imports
import classnames from 'classnames'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Popover from '@mui/material/Popover'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Slide from '@mui/material/Slide'
import { useTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'

// Type Imports
import type { NotificationsType } from '@components/layout/shared/NotificationsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Store Imports
import { useDateRangeStore } from '@/store/dateRangeStore'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Vars
const notifications: NotificationsType[] = [
  {
    avatarImage: '/images/avatars/8.png',
    title: 'Congratulations Flora 🎉',
    subtitle: 'Won the monthly bestseller gold badge',
    time: '1h ago',
    read: false
  },
  {
    title: 'Cecilia Becker',
    avatarColor: 'secondary',
    subtitle: 'Accepted your connection',
    time: '12h ago',
    read: false
  },
  {
    avatarImage: '/images/avatars/3.png',
    title: 'Bernard Woods',
    subtitle: 'You have new message from Bernard Woods',
    time: 'May 18, 8:26 AM',
    read: true
  },
  {
    avatarIcon: 'bx-bar-chart',
    title: 'Monthly report generated',
    subtitle: 'July month financial report is generated',
    avatarColor: 'info',
    time: 'Apr 24, 10:30 AM',
    read: true
  },
  {
    avatarText: 'MG',
    title: 'Application has been approved 🚀',
    subtitle: 'Your Meta Gadgets project application has been approved.',
    avatarColor: 'success',
    time: 'Feb 17, 12:17 PM',
    read: true
  },
  {
    avatarIcon: 'bx-envelope',
    title: 'New message from Harry',
    subtitle: 'You have new message from Harry',
    avatarColor: 'error',
    time: 'Jan 6, 1:48 PM',
    read: true
  }
]

// Transition component for bottom-up animation
const SlideTransition = React.forwardRef<unknown, TransitionProps & { children: React.ReactElement }>((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
))

const NavbarContent = () => {
  const { range, setRange } = useDateRangeStore()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  // States
  const [syncing, setSyncing] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(null)
  const [fullScreenDatePicker, setFullScreenDatePicker] = useState(false)

  // Format date range for badge
  const formatDateRange = useCallback(() => {
    if (!range.start || !range.end) return 'Выберите период'

    const formatDate = (date: Date) =>
      date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })

    return `${formatDate(range.start)} – ${formatDate(range.end)}`
  }, [range])

  // Format example date range
  const formatExampleRange = useCallback(() => {
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 6)

    const formatDate = (date: Date) =>
      date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

    return `${formatDate(today)} – ${formatDate(nextWeek)}`
  }, [])

  // Format single date for mobile display
  const formatSingleDate = useCallback((date: Date | null, label: string) => {
    if (!date) return `${label}: не выбрано`

    return `${label}: ${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`
  }, [])

  // Handle date picker
  const handleDatePickerClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (isDesktop) {
      setDatePickerAnchor(event.currentTarget)
    } else {
      setFullScreenDatePicker(true)
    }
  }, [isDesktop])

  const handleDatePickerClose = useCallback(() => {
    setDatePickerAnchor(null)
    setFullScreenDatePicker(false)
  }, [])

  // Quick date range helpers
  const setQuickRange = useCallback((days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days + 1)
    setRange({ start, end })
    handleDatePickerClose()
  }, [setRange, handleDatePickerClose])

  const setToday = useCallback(() => {
    const today = new Date()
    setRange({ start: today, end: today })
    handleDatePickerClose()
  }, [setRange, handleDatePickerClose])

  const setQuarter = useCallback(() => {
    const now = new Date()
    const quarter = Math.floor(now.getMonth() / 3)
    const start = new Date(now.getFullYear(), quarter * 3, 1)
    const end = new Date(now.getFullYear(), quarter * 3 + 3, 0)
    setRange({ start, end })
    handleDatePickerClose()
  }, [setRange, handleDatePickerClose])

  // Handle sync - will be called from current page context
  const handleSync = useCallback(async () => {
    setSyncing(true)

    try {
      // This will be implemented based on current page context
      // For now, just simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Global sync success notification can be added here
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }, [])

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-2 is-full')}>
      {/* Left: Nav Toggle + Date Range Picker */}
      <div className='flex items-center gap-3'>
        <NavToggle />

        {/* Date Range Picker */}
        {isDesktop ? (
          /* Desktop: Badge with text */
          <Box
            component="button"
            onClick={handleDatePickerClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1,
              height: 32,
              bgcolor: 'primary.main',
              background: 'rgba(var(--mui-palette-primary-mainChannel) / 0.1)',
              border: '1px solid',
              borderColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.4)',
              borderRadius: 1,
              cursor: 'pointer',
              transition: theme.transitions.create(['background-color', 'border-color'], {
                duration: theme.transitions.duration.short
              }),
              '&:hover': {
                bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.15)',
                borderColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.6)',
              }
            }}
          >
            <i className="bx-calendar text-lg" style={{ color: theme.palette.primary.main }} />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: range.start && range.end ? 'text.primary' : 'text.disabled',
                whiteSpace: 'nowrap'
              }}
            >
              {formatDateRange()}
            </Typography>
          </Box>
        ) : (
          /* Mobile: Icon + Period Text */
          <Box
            component="button"
            onClick={handleDatePickerClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 1,
              cursor: 'pointer',
              bgcolor: 'transparent',
              border: 'none',
              transition: theme.transitions.create(['background-color'], {
                duration: theme.transitions.duration.short
              }),
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <i className="bx-calendar text-xl" style={{ color: theme.palette.primary.main }} />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: range.start && range.end ? 'text.primary' : 'text.disabled',
                whiteSpace: 'nowrap',
                fontSize: '0.875rem'
              }}
            >
              {formatDateRange()}
            </Typography>
          </Box>
        )}
      </div>

      {/* Right: Sync + Global Icons */}
      <div className='flex items-center gap-1'>
        {/* Sync Button */}
        <IconButton
          size="small"
          onClick={handleSync}
          disabled={syncing}
          sx={{
            position: 'relative',
            color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          {syncing ? (
            <CircularProgress
              size={20}
              thickness={4}
              sx={{ color: 'primary.main' }}
            />
          ) : (
            <i className="bx-refresh text-xl" />
          )}
        </IconButton>

        {/* Global Icons */}
        <LanguageDropdown />
        <ModeDropdown />
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>

      {/* Desktop Date Picker Popover */}
      <Popover
        open={Boolean(datePickerAnchor)}
        anchorEl={datePickerAnchor}
        onClose={handleDatePickerClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            overflow: 'visible',
            p: 0
          }
        }}
      >
        <Paper sx={{ p: 3, minWidth: 400 }}>
          {/* Quick Actions */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Быстрый выбор
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={setToday}
              sx={{ minWidth: 'auto' }}
            >
              Сегодня
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setQuickRange(7)}
              sx={{ minWidth: 'auto' }}
            >
              Неделя
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setQuickRange(30)}
              sx={{ minWidth: 'auto' }}
            >
              30 дней
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={setQuarter}
              sx={{ minWidth: 'auto' }}
            >
              Квартал
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {/* Calendar */}
          <AppReactDatepicker
            selectsRange
            startDate={range.start ?? undefined}
            endDate={range.end ?? undefined}
            onChange={(dates: [Date | null, Date | null]) => {
              setRange({ start: dates[0], end: dates[1] })
              if (dates[0] && dates[1]) {
                handleDatePickerClose()
              }
            }}
            inline
            dateFormat="dd.MM.yyyy"
          />
        </Paper>
      </Popover>

      {/* Mobile Full-Screen Date Picker */}
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
        <AppBar position="relative" elevation={0} color="transparent">
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
                sx={{ color: 'text.primary' }}
              >
                <i className="bx-x" />
              </IconButton>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div" color="text.primary">
                Выберите диапазон
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                ml: 7,
                fontSize: '0.875rem'
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
                    textTransform: 'none'
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
                    textTransform: 'none'
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
                    textTransform: 'none'
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
                    textTransform: 'none'
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
            mb: 3
          }}>
            <AppReactDatepicker
              selectsRange
              startDate={range.start ?? undefined}
              endDate={range.end ?? undefined}
              onChange={(dates: [Date | null, Date | null]) =>
                setRange({ start: dates[0], end: dates[1] })
              }
              inline
              monthsShown={useMediaQuery('(min-width: 380px)') ? 2 : 1}
              dateFormat="dd.MM.yyyy"
              calendarClassName="modern-mobile-calendar"
            />
          </Box>

          {/* Selected Range Display */}
          {(range.start || range.end) && (
            <Paper
              elevation={1}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Выбранный период:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" color="text.primary">
                  👉 {formatSingleDate(range.start, 'С')}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  👉 {formatSingleDate(range.end, 'По')}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>

        {/* Sticky Bottom Action */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 3,
            width: '100%'
          }}
        >
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleDatePickerClose}
            disabled={!range.start || !range.end}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2
            }}
          >
            Применить
          </Button>
        </Box>
      </Dialog>
    </div>
  )
}

export default NavbarContent
