'use client'

// React Imports
import { useState } from 'react'
import type { ReactNode } from 'react'

// Third-party Imports
import { motion } from 'framer-motion'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

type AnimatedSidebarProps = {
  children: ReactNode
}

// Варианты анимации для координации
const sidebarVariants = {
  collapsed: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0
    }
  },
  expanded: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
}

const contentVariants = {
  collapsed: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  },
  expanded: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

const AnimatedSidebar = ({ children }: AnimatedSidebarProps) => {
  // Состояние для отслеживания hover
  const [isLocalHovered, setIsLocalHovered] = useState(false)

  // Хуки
  const { isCollapsed, isHovered, isBreakpointReached } = useVerticalNav()

  // Определяем текущее состояние
  const isExpanded = isCollapsed && (isHovered || isLocalHovered)
  const currentVariant = isCollapsed && !isExpanded ? 'collapsed' : 'expanded'

  return (
    <motion.div
      className="relative"
      variants={sidebarVariants}
      initial={currentVariant}
      animate={currentVariant}
      onHoverStart={() => {
        if (isCollapsed && !isBreakpointReached) {
          setIsLocalHovered(true)
        }
      }}
      onHoverEnd={() => {
        if (isCollapsed) {
          setIsLocalHovered(false)
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Экспортируем также варианты для использования в дочерних компонентах
export { contentVariants }
export default AnimatedSidebar
