import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, Skeleton, useTheme, alpha } from '@mui/material'

// Skeleton for table rows
export const TableRowSkeleton = ({ columns = 6 }: { columns?: number }) => {
  const theme = useTheme()

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} style={{ padding: '16px' }}>
          <Skeleton
            variant="rectangular"
            height={24}
            sx={{
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              '&::after': {
                background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.08)}, transparent)`,
              }
            }}
          />
        </td>
      ))}
    </motion.tr>
  )
}

// Card skeleton for mobile views
export const CardSkeleton = () => {
  const theme = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Box>

        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    </motion.div>
  )
}

// Metrics card skeleton
export const MetricCardSkeleton = () => {
  const theme = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1.5 }} />
          <Skeleton variant="text" width="70%" height={18} />
        </Box>

        <Skeleton variant="text" width="50%" height={36} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={14} />
      </Box>
    </motion.div>
  )
}

// Staggered loading animation
export const StaggeredLoader = ({
  children,
  staggerDelay = 0.1
}: {
  children: React.ReactNode[]
  staggerDelay?: number
}) => {
  return (
    <AnimatePresence>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.4,
            delay: index * staggerDelay,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {child}
        </motion.div>
      ))}
    </AnimatePresence>
  )
}

// Pulse loading indicator
export const PulseLoader = ({ size = 40 }: { size?: number }) => {
  const theme = useTheme()

  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: alpha(theme.palette.primary.main, 0.3),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        animate={{
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
        }}
      />
    </motion.div>
  )
}

// Shimmer effect for loading content
export const ShimmerBox = ({
  width = '100%',
  height = 20,
  borderRadius = 1
}: {
  width?: string | number
  height?: number
  borderRadius?: number
}) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg,
          ${alpha(theme.palette.primary.main, 0.05)} 25%,
          ${alpha(theme.palette.primary.main, 0.1)} 50%,
          ${alpha(theme.palette.primary.main, 0.05)} 75%
        )`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite ease-in-out',
        '@keyframes shimmer': {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
      }}
    />
  )
}
