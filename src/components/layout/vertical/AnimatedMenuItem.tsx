'use client'

// React Imports
import type { ReactNode } from 'react'

// Third-party Imports
import { motion } from 'framer-motion'

// Component Imports
import { MenuItem as BaseMenuItem } from '@menu/vertical-menu'
import type { MenuItemProps } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Варианты анимации для текста (скрывается в collapsed)
const textVariants = {
  collapsed: {
    opacity: 0,
    x: -15,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
      delay: 0.15
    }
  }
}

// Варианты для иконок (всегда видны)
const iconVariants = {
  collapsed: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  expanded: {
    scale: 1.05,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
      delay: 0.05
    }
  }
}

type AnimatedMenuItemProps = MenuItemProps & {
  children: ReactNode
}

const AnimatedMenuItem = ({ children, icon, ...props }: AnimatedMenuItemProps) => {
  // Хуки
  const { isCollapsed, isHovered } = useVerticalNav()

  // Определяем текущее состояние
  const isExpanded = isCollapsed && isHovered
  const currentVariant = isCollapsed && !isExpanded ? 'collapsed' : 'expanded'

  return (
    <BaseMenuItem
      {...props}
      icon={
        icon ? (
          <motion.div
            variants={iconVariants}
            initial={currentVariant}
            animate={currentVariant}
            className="flex items-center justify-center"
          >
            {icon}
          </motion.div>
        ) : undefined
      }
    >
      <motion.span
        variants={textVariants}
        initial={currentVariant}
        animate={currentVariant}
        className="whitespace-nowrap"
      >
        {children}
      </motion.span>
    </BaseMenuItem>
  )
}

export default AnimatedMenuItem
