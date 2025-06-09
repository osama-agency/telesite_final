'use client'

// React Imports
import type { ReactNode } from 'react'
import { useState } from 'react'

// Third-party Imports
import { motion } from 'framer-motion'

// Component Imports
import { MenuItem as BaseMenuItem } from '@menu/vertical-menu'
import type { MenuItemProps } from '@menu/vertical-menu'
import LottieIcon from './LottieIcon'

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
  const [isItemHovered, setIsItemHovered] = useState(false)

  // Определяем текущее состояние
  const isExpanded = isCollapsed && isHovered
  const currentVariant = isCollapsed && !isExpanded ? 'collapsed' : 'expanded'

  // Клонируем иконку и добавляем пропсы состояния если это LottieIcon
  const enhancedIcon = icon && typeof icon === 'object' && 'type' in icon.props
    ? { ...icon, props: { ...icon.props, isHovered: isItemHovered } }
    : icon

  return (
    <div
      onMouseEnter={() => setIsItemHovered(true)}
      onMouseLeave={() => setIsItemHovered(false)}
    >
      <BaseMenuItem
        {...props}
        icon={
          enhancedIcon ? (
            <motion.div
              variants={iconVariants}
              initial={currentVariant}
              animate={currentVariant}
              className="flex items-center justify-center"
            >
              {enhancedIcon}
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
    </div>
  )
}

export default AnimatedMenuItem
