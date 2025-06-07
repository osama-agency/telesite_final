import React from 'react'
import { motion, MotionProps } from 'framer-motion'
import {
  Button,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Fab,
  FabProps,
  useTheme,
  alpha,
  CircularProgress,
  Box
} from '@mui/material'

// Enhanced Button with micro-interactions
interface EnhancedButtonProps extends Omit<ButtonProps, 'onClick'> {
  loading?: boolean
  rippleEffect?: boolean
  scaleOnHover?: boolean
  glowEffect?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
}

export const EnhancedButton = ({
  children,
  loading = false,
  rippleEffect = true,
  scaleOnHover = true,
  glowEffect = false,
  onClick,
  disabled,
  variant = 'contained',
  ...props
}: EnhancedButtonProps) => {
  const theme = useTheme()
  const isDisabled = disabled || loading

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick || isDisabled) return

    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    await onClick(event)
  }

  return (
    <motion.div
      whileHover={!isDisabled && scaleOnHover ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
    >
      <Button
        {...props}
        variant={variant}
        disabled={isDisabled}
        onClick={handleClick}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

          // Glow effect
          ...(glowEffect && !isDisabled && {
            boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 0 30px ${alpha(theme.palette.primary.main, 0.5)}`,
            }
          }),

          // Enhanced hover effects
          '&:hover:not(:disabled)': {
            transform: scaleOnHover ? 'translateY(-1px)' : 'none',
            boxShadow: theme.shadows[4],
          },

          // Loading state styles
          ...(loading && {
            color: 'transparent',
          }),

          ...props.sx,
        }}
      >
        {loading && (
          <CircularProgress
            size={20}
            sx={{
              position: 'absolute',
              color: variant === 'contained' ? 'white' : theme.palette.primary.main,
            }}
          />
        )}
        {children}
      </Button>
    </motion.div>
  )
}

// Enhanced Icon Button
interface EnhancedIconButtonProps extends Omit<IconButtonProps, 'onClick'> {
  loading?: boolean
  pulseEffect?: boolean
  rotateOnHover?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
}

export const EnhancedIconButton = ({
  children,
  loading = false,
  pulseEffect = false,
  rotateOnHover = false,
  onClick,
  disabled,
  ...props
}: EnhancedIconButtonProps) => {
  const theme = useTheme()
  const isDisabled = disabled || loading

  return (
    <motion.div
      whileHover={!isDisabled ? {
        scale: 1.1,
        rotate: rotateOnHover ? 90 : 0
      } : {}}
      whileTap={!isDisabled ? { scale: 0.9 } : {}}
      animate={pulseEffect ? {
        scale: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
        repeat: pulseEffect ? Infinity : 0,
        repeatType: 'reverse'
      }}
    >
      <IconButton
        {...props}
        disabled={isDisabled}
        onClick={onClick}
        sx={{
          position: 'relative',
          borderRadius: 2,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

          '&:hover:not(:disabled)': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
          },

          ...props.sx,
        }}
      >
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          children
        )}
      </IconButton>
    </motion.div>
  )
}

// Floating Action Button with enhanced animations
interface EnhancedFabProps extends Omit<FabProps, 'onClick'> {
  loading?: boolean
  bounceOnMount?: boolean
  glowEffect?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
}

export const EnhancedFab = ({
  children,
  loading = false,
  bounceOnMount = true,
  glowEffect = true,
  onClick,
  disabled,
  ...props
}: EnhancedFabProps) => {
  const theme = useTheme()
  const isDisabled = disabled || loading

  return (
    <motion.div
      initial={bounceOnMount ? { scale: 0, rotate: 180 } : {}}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <Fab
        {...props}
        disabled={isDisabled}
        onClick={onClick}
        sx={{
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

          // Enhanced shadow and glow
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,

          ...(glowEffect && !isDisabled && {
            '&:hover': {
              boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
            }
          }),

          // Loading state
          ...(loading && {
            color: 'transparent',
          }),

          ...props.sx,
        }}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : (
          children
        )}
      </Fab>
    </motion.div>
  )
}

// Ripple Effect Button
export const RippleButton = ({
  children,
  onClick,
  ...props
}: ButtonProps) => {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newRipple = {
      id: Date.now(),
      x,
      y,
    }

    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)

    onClick?.(event)
  }

  return (
    <Button
      {...props}
      onClick={handleClick}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        ...props.sx,
      }}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: 'absolute',
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </Button>
  )
}

// Success Button with checkmark animation
export const SuccessButton = ({
  success = false,
  children,
  ...props
}: ButtonProps & { success?: boolean }) => {
  const theme = useTheme()

  return (
    <EnhancedButton
      {...props}
      sx={{
        backgroundColor: success ? theme.palette.success.main : undefined,
        color: success ? 'white' : undefined,
        '&:hover': {
          backgroundColor: success ? theme.palette.success.dark : undefined,
        },
        ...props.sx,
      }}
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            ✓
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </EnhancedButton>
  )
}
