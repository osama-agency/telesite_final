'use client'

import React from 'react'

import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Store,
  Wallet
} from 'lucide-react'

interface LottieIconProps {
  iconType: 'dashboard' | 'orders' | 'products' | 'procurement' | 'expenses'
  isActive?: boolean
  isHovered?: boolean
  size?: number
}

// Современные Lucide иконки
const modernIcons = {
  dashboard: LayoutDashboard,
  orders: ShoppingCart,
  products: Package,
  procurement: Store,
  expenses: Wallet
}

const LottieIcon: React.FC<LottieIconProps> = ({
  iconType,
  isActive = false,
  isHovered = false,
  size = 18
}) => {
  const IconComponent = modernIcons[iconType]

  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size
      }}
      animate={{
        scale: isHovered ? 1.1 : 1,
        rotate: isHovered ? [0, -2, 2, 0] : 0
      }}
      transition={{
        duration: 0.2,
        ease: 'easeOut'
      }}
    >
      <IconComponent
        size={size}
        strokeWidth={isActive ? 2.5 : 2}
        style={{
          color: 'currentColor',
          filter: isActive
            ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))'
            : isHovered
              ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              : 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </motion.div>
  )
}

export default LottieIcon
