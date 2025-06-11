'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

// Third-party Imports
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'

// Component Imports
import ModeDropdown from '@components/layout/shared/ModeDropdown'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useApiStatus } from '@/hooks/useApiStatus'
import { useProfileStore } from '@/stores/profileStore'

type DockButtonProps = {
  children: React.ReactNode
  tooltip: string
  onClick?: () => void
  isLoading?: boolean
  badge?: boolean
  className?: string
}

const DockButton = ({ children, tooltip, onClick, badge = false, className }: DockButtonProps) => {
  const theme = useTheme()
  const [hovered, setHovered] = useState(false)

  return (
    <Tooltip
      title={tooltip}
      placement="top"
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
            }
          }
        }
      }}
    >
      <Box
        component="div"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        className={className}
        sx={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 3, // 12px
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          backgroundColor: 'transparent',
          border: `1px solid transparent`,
          ...(hovered && {
            transform: 'scale(1.1)',
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
          }),

          // Badge indicator
          ...(badge && {
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 8,
              right: 8,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: theme.palette.error.main,
              zIndex: 1,
            }
          })
        }}
      >
        {children}
      </Box>
    </Tooltip>
  )
}

const SidebarFooter = () => {
  const theme = useTheme()
  const router = useRouter()
  const { isCollapsed, isHovered, isBreakpointReached } = useVerticalNav()
  const { status: apiStatus } = useApiStatus()
  const { data: session } = useSession()
  const { getDisplayName, getAvatarUrl } = useProfileStore()

  // Determine if sidebar is in expanded mode
  const isExpanded = !isCollapsed || (isCollapsed && isHovered) || isBreakpointReached

  // Handle profile navigation
  const handleProfileClick = () => {
    router.push('/pages/account-settings')
  }

  // Get user data
  const displayName = getDisplayName() || session?.user?.name || 'Пользователь'
  const avatarUrl = getAvatarUrl() || session?.user?.image || '/images/avatars/default.svg'

  // API Status indicator config
  const getApiStatusConfig = () => {
    switch (apiStatus) {
      case 'connected':
        return {
          color: theme.palette.success.main,
          text: 'API: Подключено',
          icon: '🟢',
          pulse: false
        }
      case 'disconnected':
        return {
          color: theme.palette.error.main,
          text: 'API: Нет связи',
          icon: '🔴',
          pulse: true
        }
      case 'checking':
        return {
          color: theme.palette.warning.main,
          text: 'API: Проверка...',
          icon: '🟡',
          pulse: true
        }
    }
  }

  const statusConfig = getApiStatusConfig()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          mx: 2,
          mb: 2,
          p: 2,
          borderRadius: 4, // 16px
          background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
          backdropFilter: 'blur(24px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            // Expanded layout
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.1
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >

              {/* Profile Section */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  pt: 1,
                  cursor: 'pointer',
                  borderRadius: 2,
                  p: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.action.hover, 0.5),
                    transform: 'translateY(-1px)'
                  }
                }}
                onClick={handleProfileClick}
              >
                <Avatar
                  src={avatarUrl}
                  alt={displayName}
                  sx={{
                    width: 32,
                    height: 32,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: '0.875rem'
                    }}
                  >
                    {displayName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem'
                    }}
                  >
                    Администратор
                  </Typography>
                </Box>
                <i className="bx-chevron-right" style={{ fontSize: '16px', color: theme.palette.text.secondary }} />
              </Box>

              {/* Controls Section */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Left: Theme Toggle */}
                <Box sx={{
                  backgroundColor: alpha(theme.palette.divider, 0.1),
                  borderRadius: 2,
                  p: 0.5,
                  display: 'flex'
                }}>
                  <ModeDropdown />
                </Box>

                {/* Right: API Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <motion.div
                    animate={statusConfig.pulse ? {
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: statusConfig.pulse ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: statusConfig.color,
                        boxShadow: `0 0 8px ${alpha(statusConfig.color, 0.4)}`
                      }}
                    />
                  </motion.div>
                  <Typography
                    variant="caption"
                    sx={{
                      color: statusConfig.color,
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}
                  >
                    {statusConfig.text}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          ) : (
            // Collapsed layout - только кнопка темы
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {/* Theme toggle only */}
              <DockButton
                tooltip="Сменить тему"
              >
                <ModeDropdown />
              </DockButton>

              {/* Small API status indicator */}
              <motion.div
                animate={statusConfig.pulse ? {
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: statusConfig.pulse ? Infinity : 0,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: statusConfig.color,
                  zIndex: 1,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </motion.div>
  )
}

export default SidebarFooter
