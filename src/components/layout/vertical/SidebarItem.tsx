'use client'

// React Imports

// Next Imports
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import { Box, Tooltip } from '@mui/material'
import { useTheme, alpha, styled } from '@mui/material/styles'

// Third-party Imports
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

type SidebarItemProps = {
  icon: LucideIcon
  label: string
  href: string
  exactMatch?: boolean
}

const StyledMenuItem = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  marginInline: theme.spacing(1.5),
  marginBlock: theme.spacing(0.25),

  // Фон активного пункта
  '& .active-background': {
    position: 'absolute',
    inset: 0,
    borderRadius: theme.spacing(1.5),
    backgroundColor: alpha(theme.palette.primary.main, 0.13),
    opacity: 0,
    transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1.5px solid ${alpha(theme.palette.primary.main, 0.18)}`,
    boxShadow: '0 4px 24px rgba(80, 80, 180, 0.10)',
    pointerEvents: 'none',
  },

  // Wrapper для пункта меню
  '& .menu-item-wrapper': {
    position: 'relative',
    zIndex: 1,
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2.25),
    gap: theme.spacing(1.5),
    cursor: 'pointer',
    overflow: 'hidden',
    textDecoration: 'none !important',
    minHeight: '48px',
    color: 'inherit',
    boxSizing: 'border-box',
    willChange: 'transform, box-shadow',

    // Hover эффекты для неактивного состояния
    '&:hover:not(.active)': {
      backgroundColor: alpha(theme.palette.action.hover, 0.09),
      transform: 'translateY(-1.5px) scale(1.012)',
      boxShadow: '0 2px 8px rgba(80,80,180,0.06)',

      '& .menu-icon': {
        transform: 'scale(1.10) rotate(-3deg)',
        color: theme.palette.primary.main,
        filter: 'drop-shadow(0 2px 8px rgba(80,80,180,0.10))',
      },

      '& .menu-text': {
        color: theme.palette.primary.main,
        letterSpacing: '0.02em',
      }
    },

    // Press эффект
    '&:active': {
      transform: 'scale(0.97)',
      boxShadow: '0 1px 4px rgba(80,80,180,0.08)',
    },

    // Стили для иконки
    '& .menu-icon': {
      fontSize: '20px',
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      color: alpha(theme.palette.text.primary, 0.7),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '20px',
      height: '20px',
      willChange: 'transform, filter',
    },

    // Стили для текста
    '& .menu-text': {
      fontSize: '0.93rem', // 15px
      fontWeight: 500,
      letterSpacing: '0.01em',
      color: alpha(theme.palette.text.primary, 0.87),
      transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
      whiteSpace: 'nowrap',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: 1.22,
      willChange: 'opacity, color, letter-spacing',
    }
  },

  // Активное состояние
  '&.active': {
    '& .active-background': {
      opacity: 1,
      boxShadow: '0 8px 32px rgba(80,80,180,0.13)',
    },

    '& .menu-item-wrapper': {
      boxShadow: '0 4px 16px rgba(80,80,180,0.10)',
      '& .menu-icon': {
        color: theme.palette.primary.main,
        transform: 'scale(1.08)',
        filter: 'drop-shadow(0 2px 8px rgba(80,80,180,0.13))',
      },

      '& .menu-text': {
        color: theme.palette.primary.main,
        fontWeight: 600,
        letterSpacing: '0.025em',
      },

      '&:hover': {
        transform: 'none',
        backgroundColor: 'transparent',
        boxShadow: '0 8px 32px rgba(80,80,180,0.13)',
        '& .menu-icon': {
          transform: 'scale(1.12) rotate(-2deg)',
        }
      }
    }
  }
}))

// Варианты анимации для текста
const textVariants = {
  collapsed: {
    opacity: 0,
    x: -8,
    transition: {
      duration: 0.15,
      ease: 'easeInOut'
    }
  },
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
      delay: 0.1
    }
  }
}

const SidebarItem = ({ icon: Icon, label, href, exactMatch = true }: SidebarItemProps) => {
  const theme = useTheme()
  const pathname = usePathname()
  const { isCollapsed, isHovered, isBreakpointReached } = useVerticalNav()

  // Определяем активное состояние
  const isActive = pathname
    ? (exactMatch ? pathname === href : pathname.startsWith(href))
    : false

  // Определяем состояние расширения
  const isExpanded = !isCollapsed || (isCollapsed && isHovered) || isBreakpointReached

  // В свернутом состоянии показываем только иконку в обводке
  if (!isExpanded) {
    return (
      <div className="flex items-center justify-center my-1">
        <div
          className={
            isActive
              ? 'w-11 h-11 flex items-center justify-center rounded-md border border-[#715bff]/50 bg-[#715bff]/5'
              : 'w-11 h-11 flex items-center justify-center rounded-md'
          }
        >
          <Icon
            className={isActive ? 'w-5 h-5 text-[#715bff]' : 'w-5 h-5 text-[#B0B0C3]'}
            strokeWidth={isActive ? 2.1 : 1.7}
            style={{ display: 'block', margin: 0, padding: 0, lineHeight: 1 }}
          />
        </div>
      </div>
    )
  }

  const MenuContent = (
    <StyledMenuItem
      className={isActive ? 'active' : ''}
      variants={{
        expanded: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.2,
            ease: 'easeOut'
          }
        },
        collapsed: {
          opacity: 1,
          x: 0
        }
      }}
    >
      {/* Фон активного пункта */}
      <motion.div
        className="active-background"
        initial={false}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1]
        }}
      />

      {/* Контент пункта меню */}
      <Box
        component={Link}
        href={href}
        className={`menu-item-wrapper ${isActive ? 'active' : ''}`}
      >
        {/* Иконка */}
        <Icon className="menu-icon" strokeWidth={1.5} />

        {/* Текст - показывается только в развернутом состоянии */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.span
              className="menu-text"
              variants={textVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Box>
    </StyledMenuItem>
  )

  // В свернутом состоянии показываем tooltip
  if (!isExpanded) {
    return (
      <Tooltip
        title={label}
        placement="right"
        arrow
        slotProps={{
          popper: {
            sx: {
              '& .MuiTooltip-tooltip': {
                backdropFilter: 'blur(12px)',
                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                color: theme.palette.text.primary,
                fontSize: '0.75rem',
                fontWeight: 500,
                padding: '8px 12px',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                marginLeft: '8px !important'
              }
            }
          }
        }}
      >
        <div>{MenuContent}</div>
      </Tooltip>
    )
  }

  return MenuContent
}

export default SidebarItem
