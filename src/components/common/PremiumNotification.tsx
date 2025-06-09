'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, Typography, IconButton, alpha, useTheme } from '@mui/material'
import { CheckCircle, Warning, Error, Info, Close } from '@mui/icons-material'

interface NotificationProps {
  open: boolean
  onClose: () => void
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message?: string
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
}

const PremiumNotification: React.FC<NotificationProps> = ({
  open,
  onClose,
  type,
  title,
  message,
  duration = 5000,
  position = 'top-right'
}) => {
  const theme = useTheme()
  const [isVisible, setIsVisible] = useState(open)

  useEffect(() => {
    setIsVisible(open)
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [open, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 24 }} />
      case 'warning':
        return <Warning sx={{ fontSize: 24 }} />
      case 'error':
        return <Error sx={{ fontSize: 24 }} />
      case 'info':
        return <Info sx={{ fontSize: 24 }} />
      default:
        return <Info sx={{ fontSize: 24 }} />
    }
  }

  const getColors = () => {
    const isDark = theme.palette.mode === 'dark'
    switch (type) {
      case 'success':
        return {
          bg: isDark ? alpha('#4ade80', 0.15) : alpha('#10b981', 0.1),
          border: isDark ? '#4ade80' : '#10b981',
          icon: isDark ? '#4ade80' : '#10b981',
          text: isDark ? '#f0fdf4' : '#064e3b'
        }
      case 'warning':
        return {
          bg: isDark ? alpha('#fbbf24', 0.15) : alpha('#f59e0b', 0.1),
          border: isDark ? '#fbbf24' : '#f59e0b',
          icon: isDark ? '#fbbf24' : '#f59e0b',
          text: isDark ? '#fefce8' : '#78350f'
        }
      case 'error':
        return {
          bg: isDark ? alpha('#f87171', 0.15) : alpha('#ef4444', 0.1),
          border: isDark ? '#f87171' : '#ef4444',
          icon: isDark ? '#f87171' : '#ef4444',
          text: isDark ? '#fef2f2' : '#7f1d1d'
        }
      case 'info':
        return {
          bg: isDark ? alpha('#60a5fa', 0.15) : alpha('#3b82f6', 0.1),
          border: isDark ? '#60a5fa' : '#3b82f6',
          icon: isDark ? '#60a5fa' : '#3b82f6',
          text: isDark ? '#eff6ff' : '#1e3a8a'
        }
      default:
        return {
          bg: isDark ? alpha('#60a5fa', 0.15) : alpha('#3b82f6', 0.1),
          border: isDark ? '#60a5fa' : '#3b82f6',
          icon: isDark ? '#60a5fa' : '#3b82f6',
          text: isDark ? '#eff6ff' : '#1e3a8a'
        }
    }
  }

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      maxWidth: 400,
      minWidth: 320
    }

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 24, right: 24 }
      case 'top-left':
        return { ...baseStyles, top: 24, left: 24 }
      case 'bottom-right':
        return { ...baseStyles, bottom: 24, right: 24 }
      case 'bottom-left':
        return { ...baseStyles, bottom: 24, left: 24 }
      case 'top-center':
        return { ...baseStyles, top: 24, left: '50%', transform: 'translateX(-50%)' }
      default:
        return { ...baseStyles, top: 24, right: 24 }
    }
  }

  const colors = getColors()

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            mass: 0.8
          }}
          style={getPositionStyles()}
        >
          <Box
            sx={{
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${colors.bg} 0%, ${alpha(colors.bg, 0.8)} 100%)`
                : `linear-gradient(135deg, ${colors.bg} 0%, ${alpha(colors.bg, 0.6)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(colors.border, 0.3)}`,
              borderRadius: '16px',
              p: 3,
              boxShadow: theme.palette.mode === 'dark'
                ? `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px ${alpha(colors.border, 0.2)}`
                : `0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px ${alpha(colors.border, 0.1)}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(45deg, ${alpha(colors.border, 0.05)} 0%, transparent 50%, ${alpha(colors.border, 0.05)} 100%)`,
                animation: 'shimmer 3s ease-in-out infinite',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, position: 'relative' }}>
              <Box
                sx={{
                  color: colors.icon,
                  mt: 0.5,
                  animation: type === 'success' ? 'bounce 0.6s ease-in-out' : 'none',
                  '@keyframes bounce': {
                    '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
                    '40%, 43%': { transform: 'translateY(-8px)' },
                    '70%': { transform: 'translateY(-4px)' },
                    '90%': { transform: 'translateY(-2px)' }
                  }
                }}
              >
                {getIcon()}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: colors.text,
                    mb: message ? 0.5 : 0,
                    fontFamily: 'Inter, -apple-system, sans-serif',
                    letterSpacing: '-0.025em'
                  }}
                >
                  {title}
                </Typography>
                {message && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: alpha(colors.text, 0.8),
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      fontFamily: 'Inter, -apple-system, sans-serif'
                    }}
                  >
                    {message}
                  </Typography>
                )}
              </Box>

              <IconButton
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                size="small"
                sx={{
                  color: alpha(colors.text, 0.7),
                  '&:hover': {
                    color: colors.text,
                    backgroundColor: alpha(colors.border, 0.1)
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Close sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {duration > 0 && (
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: 2,
                  backgroundColor: colors.border,
                  borderRadius: '0 0 16px 16px'
                }}
              />
            )}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PremiumNotification
