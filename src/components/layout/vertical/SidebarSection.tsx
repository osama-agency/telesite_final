'use client'

// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import { Typography, Box } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'

// Third-party Imports
import { motion } from 'framer-motion'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

type SidebarSectionProps = {
  title: string
  children: ReactNode
  className?: string
}

const SidebarSection = ({ title, children, className }: SidebarSectionProps) => {
  const theme = useTheme()
  const { isCollapsed, isHovered, isBreakpointReached } = useVerticalNav()

  // Определяем состояние расширения
  const isExpanded = !isCollapsed || (isCollapsed && isHovered) || isBreakpointReached

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={className}
      sx={{
        mb: 2.5,
        '&:last-child': {
          mb: 0
        }
      }}
    >
      {/* Заголовок секции - показывается только в развернутом состоянии */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              px: 3,
              py: 1,
              mb: 1,
              fontSize: '0.6875rem', // 11px
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: alpha(theme.palette.text.secondary, 0.6),
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>
        </motion.div>
      )}

      {/* Разделитель в свернутом состоянии */}
      {!isExpanded && (
        <Box
          sx={{
            height: '1px',
            mx: 2,
            mb: 1.5,
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.2)}, transparent)`
          }}
        />
      )}

      {/* Контент секции */}
      <Box
        component={motion.div}
        variants={{
          expanded: {
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.15
            }
          },
          collapsed: {
            transition: {
              staggerChildren: 0.02
            }
          }
        }}
        animate={isExpanded ? 'expanded' : 'collapsed'}
      >
        {children}
      </Box>
    </Box>
  )
}

export default SidebarSection
