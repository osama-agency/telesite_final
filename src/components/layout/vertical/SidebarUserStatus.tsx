'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'

// Third-party Imports
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Bell,
  Globe,
  Moon,
  MoreHorizontal,
  User,
  LogOut
} from 'lucide-react'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

type SidebarUserStatusProps = {
  avatar?: string
  name?: string
  status?: 'online' | 'offline' | 'away'
  className?: string
}

const SidebarUserStatus = ({
  avatar = '/images/avatars/8.png',
  name = 'Eldar',
  status = 'online',
  className
}: SidebarUserStatusProps) => {
  const theme = useTheme()
  const { isCollapsed, isHovered, isBreakpointReached } = useVerticalNav()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const isExpanded = !isCollapsed || (isCollapsed && isHovered) || isBreakpointReached
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online': return '#4ade80'
      case 'away': return '#fbbf24'
      case 'offline': return '#6b7280'
      default: return '#4ade80'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'В сети'
      case 'away': return 'Отошел'
      case 'offline': return 'Не в сети'
      default: return 'В сети'
    }
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      style={{
        padding: theme.spacing(2),
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.06),
            transform: 'translateY(-1px)'
          }
        }}
        onClick={!isExpanded ? handleClick : undefined}
      >
        {/* Аватар с индикатором статуса */}
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: getStatusColor(),
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: `0 0 0 1px ${alpha(getStatusColor(), 0.3)}`
              }}
            />
          }
        >
          <Avatar
            src={avatar}
            alt={name}
            sx={{
              width: 36,
              height: 36,
              border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.05)',
                borderColor: alpha(theme.palette.primary.main, 0.3)
              }
            }}
          />
        </Badge>

        {/* Информация пользователя - показывается только в развернутом состоянии */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: theme.palette.text.primary,
                  lineHeight: 1.2,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              >
                {name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  color: alpha(theme.palette.text.secondary, 0.8),
                  lineHeight: 1.2,
                  display: 'block'
                }}
              >
                {getStatusText()}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопка дополнительных действий - показывается только в развернутом состоянии */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <IconButton
              size="small"
              onClick={handleClick}
              sx={{
                color: alpha(theme.palette.text.secondary, 0.7),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.08),
                  color: theme.palette.text.primary
                }
              }}
            >
              <MoreHorizontal size={16} />
            </IconButton>
          </motion.div>
        )}
      </Box>

      {/* Dropdown меню с дополнительными действиями */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: {
              mt: -1,
              ml: 1,
              minWidth: 220,
              backgroundColor: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              '& .MuiMenuItem-root': {
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.08)
                }
              }
            }
          }
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <User size={18} />
          </ListItemIcon>
          <ListItemText primary="Профиль" />
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Settings size={18} />
          </ListItemIcon>
          <ListItemText primary="Настройки" />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Globe size={18} />
          </ListItemIcon>
          <ListItemText primary="Язык" />
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Moon size={18} />
          </ListItemIcon>
          <ListItemText primary="Тема" />
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <Bell size={18} />
          </ListItemIcon>
          <ListItemText primary="Уведомления" />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LogOut size={18} />
          </ListItemIcon>
          <ListItemText primary="Выйти" />
        </MenuItem>
      </Menu>
    </motion.div>
  )
}

export default SidebarUserStatus
