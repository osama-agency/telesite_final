'use client'

// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import { Box } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'

// Third-party Imports
import { motion } from 'framer-motion'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

type ModernSidebarProps = {
  children: ReactNode
  className?: string
}

const ModernSidebar = ({ children, className }: ModernSidebarProps) => {
  const theme = useTheme()
  const { isCollapsed, isHovered, isBreakpointReached } = useVerticalNav()

  // Определяем состояние расширения
  const isExpanded = !isCollapsed || (isCollapsed && isHovered) || isBreakpointReached

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          position: 'relative',

          // Современная тень для глубины
          boxShadow: '0 0 24px rgba(0,0,0,0.04)',

          // Glassmorphism эффект
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            backdropFilter: 'blur(20px)',
            borderRadius: 'inherit',
            zIndex: -1
          },

          // Анимации перехода состояний
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

          // Адаптивные стили
          [theme.breakpoints.down('lg')]: {
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1300,
            transform: isExpanded ? 'translateX(0)' : 'translateX(-100%)',
            boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.24)' : 'none'
          }
        }}
      >
        {/* Контент сайдбара */}
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1
          }}
        >
          {children}
        </Box>
      </Box>
    </motion.div>
  )
}

export default ModernSidebar
