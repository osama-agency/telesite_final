'use client'

// React Imports
import type { ReactNode } from 'react'
import { useState } from 'react'

// Next Imports
import { usePathname } from 'next/navigation'

// Third-party Imports
import { motion, AnimatePresence } from 'framer-motion'

// MUI Imports
import { styled, alpha, useTheme } from '@mui/material/styles'
import { Tooltip, Box } from '@mui/material'

// Component Imports
import { MenuItem as BaseMenuItem } from '@menu/vertical-menu'
import type { MenuItemProps } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Типы
type AnimatedMenuItemProps = {
  children: ReactNode
  icon?: ReactNode
  href?: string
  exactMatch?: boolean
  activeUrl?: string
} & Omit<MenuItemProps, 'children' | 'exactMatch' | 'activeUrl'>

// Styled components
const StyledMenuItem = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  marginInline: theme.spacing(1.5),
  marginBlockStart: theme.spacing(0.5),

  '&:first-of-type': {
    marginBlockStart: theme.spacing(1)
  },

  // Активный фон с современным градиентом
  '& .active-background': {
    position: 'absolute',
    inset: 0,
    borderRadius: theme.spacing(1.5), // 12px для более современного вида
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.85)} 100%)`,
    opacity: 0,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,

    // Glassmorphism overlay
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: theme.spacing(1.5),
      background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)`,
      backdropFilter: 'blur(8px)',
      border: `1px solid ${alpha('#FFFFFF', 0.1)}`
    }
  },

  // Wrapper для меню item
  '& .menu-item-wrapper': {
    position: 'relative',
    zIndex: 1,
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2, 2.5), // Оптимизированный padding
    gap: theme.spacing(2),
    cursor: 'pointer',
    overflow: 'hidden',
    textDecoration: 'none !important',
    minHeight: '44px', // Минимальная высота для лучшего UX

    // Hover эффекты для неактивного состояния
    '&:hover:not(.active)': {
      backgroundColor: alpha(theme.palette.action.hover, 0.06),
      transform: 'translateY(-1px)',
      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,

      '& .menu-icon': {
        transform: 'scale(1.08)',
        filter: 'brightness(1.15)'
      },

      '& .menu-text': {
        color: theme.palette.text.primary,
        transform: 'translateX(1px)'
      }
    },

    // Стили для обычного состояния
    '& .menu-icon': {
      fontSize: '18px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      color: alpha(theme.palette.text.primary, 0.7),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '18px',
      height: '18px'
    },

    '& .menu-text': {
      fontSize: '0.875rem', // 14px современная типографика
      fontWeight: 500,
      letterSpacing: '0.005em',
      color: alpha(theme.palette.text.primary, 0.85),
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      whiteSpace: 'nowrap',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }
  },

  // Активное состояние
  '&.active': {
    '& .active-background': {
      opacity: 1,
    },

    '& .menu-item-wrapper': {
      '& .menu-icon': {
        color: '#FFFFFF',
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))',
        transform: 'scale(1)',
      },

      '& .menu-text': {
        color: '#FFFFFF',
        fontWeight: 600,
        textShadow: '0 1px 2px rgba(0,0,0,0.15)'
      },

      '&:hover': {
        transform: 'none', // Убираем сдвиг для активного
        backgroundColor: 'transparent',
        boxShadow: 'none',

        '& .menu-icon': {
          transform: 'scale(1.05)',
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

const AnimatedMenuItem = ({
  children,
  icon,
  href,
  exactMatch = true,
  activeUrl,
  ...props
}: AnimatedMenuItemProps) => {
  // Хуки
  const theme = useTheme()
  const pathname = usePathname()
  const { isCollapsed, isHovered } = useVerticalNav()
  const [isItemHovered, setIsItemHovered] = useState(false)

  // Определяем состояния с проверкой на null
  const isActive = pathname
    ? (exactMatch ? pathname === href : (activeUrl ? pathname.includes(activeUrl) : pathname === href))
    : false

  const isExpanded = !isCollapsed || (isCollapsed && isHovered)

  // Клонируем иконку с дополнительными пропсами
  const enhancedIcon = icon && typeof icon === 'object' && 'props' in icon
    ? { ...icon, props: { ...icon.props, isHovered: isItemHovered, isActive } }
    : icon

  // Формируем правильные пропсы для BaseMenuItem
  const menuItemProps = exactMatch
    ? { exactMatch: true as const }
    : activeUrl
    ? { exactMatch: false as const, activeUrl }
    : {}

  // Для collapsed режима показываем tooltip
  if (isCollapsed && !isHovered) {
    return (
      <Tooltip
        title={children}
        placement="right"
        arrow
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 8],
                },
              },
            ],
          },
          tooltip: {
            sx: {
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              color: theme.palette.text.primary,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(12px)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              padding: theme.spacing(1.25, 1.75),
              borderRadius: theme.spacing(1.25)
            }
          },
          arrow: {
            sx: {
              color: alpha(theme.palette.background.paper, 0.95),
              '&::before': {
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              }
            }
          }
        }}
      >
        <StyledMenuItem
          className={isActive ? 'active' : ''}
          onMouseEnter={() => setIsItemHovered(true)}
          onMouseLeave={() => setIsItemHovered(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <AnimatePresence>
            {isActive && (
              <motion.div
                className="active-background"
                layoutId="activeMenuIndicator"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                  duration: 0.25,
                  ease: [0.4, 0, 0.2, 1],
                  layout: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }}
              />
            )}
          </AnimatePresence>

          <BaseMenuItem
            href={href}
            {...menuItemProps}
            className={`menu-item-wrapper ${isActive ? 'active' : ''}`}
            {...props}
          >
            <Box className="menu-icon">
              {enhancedIcon}
            </Box>
          </BaseMenuItem>
        </StyledMenuItem>
      </Tooltip>
    )
  }

  return (
    <StyledMenuItem
      className={isActive ? 'active' : ''}
      onMouseEnter={() => setIsItemHovered(true)}
      onMouseLeave={() => setIsItemHovered(false)}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="active-background"
            layoutId="activeMenuIndicator"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1],
              layout: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          />
        )}
      </AnimatePresence>

      <BaseMenuItem
        href={href}
        {...menuItemProps}
        className={`menu-item-wrapper ${isActive ? 'active' : ''}`}
        {...props}
      >
        <Box className="menu-icon">
          {enhancedIcon}
        </Box>

        <AnimatePresence>
          {isExpanded && (
            <motion.span
              className="menu-text"
              variants={textVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </BaseMenuItem>
    </StyledMenuItem>
  )
}

export default AnimatedMenuItem
