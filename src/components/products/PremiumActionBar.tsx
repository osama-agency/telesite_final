'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Badge from '@mui/material/Badge'
import Paper from '@mui/material/Paper'
import { alpha, useTheme } from '@mui/material/styles'

interface PremiumActionBarProps {
  selectedCount: number
  totalCritical: number
  onBulkPurchase: () => void
  onExportCritical: () => void
  onExportAll: () => void
  onRefresh: () => void
  isRefreshing?: boolean
}

const PremiumActionBar = ({
  selectedCount,
  totalCritical,
  onBulkPurchase,
  onExportCritical,
  onExportAll,
  onRefresh,
  isRefreshing = false
}: PremiumActionBarProps) => {
  const theme = useTheme()
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget)
  }

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null)
  }

  const handleExportCritical = () => {
    onExportCritical()
    handleExportMenuClose()
  }

  const handleExportAll = () => {
    onExportAll()
    handleExportMenuClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Левая часть - Статистика */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Выбрано товаров
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedCount}
            </Typography>
          </Box>

          {totalCritical > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge
                  badgeContent={totalCritical}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' }
                      }
                    }
                  }}
                >
                  <Chip
                    icon={<i className='bx-error' />}
                    label="Критичные"
                    color="error"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Badge>
              </Box>
            </motion.div>
          )}
        </Box>

        {/* Правая часть - Действия */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Массовая закупка */}
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Button
                variant="contained"
                startIcon={<i className='bx-cart-add' />}
                onClick={onBulkPurchase}
                sx={{
                  background: 'linear-gradient(135deg, #2AC769 0%, #27AE60 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #229954 0%, #1E8449 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(42, 199, 105, 0.3)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Массовая закупка ({selectedCount})
              </Button>
            </motion.div>
          )}

          {/* Кнопка экспорта */}
          <Tooltip title="Экспорт данных">
            <IconButton
              onClick={handleExportMenuOpen}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <i className='bx-download' />
            </IconButton>
          </Tooltip>

          {/* Кнопка обновления */}
          <Tooltip title="Обновить данные">
            <IconButton
              onClick={onRefresh}
              disabled={isRefreshing}
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                '&:hover': {
                  bgcolor: alpha(theme.palette.info.main, 0.2),
                  transform: 'rotate(180deg)'
                },
                transition: 'all 0.3s ease-in-out',
                '&.Mui-disabled': {
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }
              }}
            >
              <i className='bx-refresh' />
            </IconButton>
          </Tooltip>

          {/* Настройки */}
          <Tooltip title="Настройки аналитики">
            <IconButton
              sx={{
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: alpha(theme.palette.grey[500], 0.2),
                  color: 'text.primary',
                  transform: 'rotate(90deg)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <i className='bx-cog' />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Меню экспорта */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={handleExportMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              minWidth: 220
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleExportCritical} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <i className='bx-error' style={{ color: '#FF4B4B' }} />
            </ListItemIcon>
            <ListItemText
              primary="Критичные товары"
              secondary={`${totalCritical} позиций`}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>

          <MenuItem onClick={handleExportAll} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <i className='bx-package' style={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <ListItemText
              primary="Все товары"
              secondary="Полный каталог"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>

          <MenuItem onClick={handleExportMenuClose} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <i className='bx-filter' style={{ color: theme.palette.warning.main }} />
            </ListItemIcon>
            <ListItemText
              primary="Отфильтрованные"
              secondary="По текущим фильтрам"
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </MenuItem>
        </Menu>
      </Paper>
    </motion.div>
  )
}

export default PremiumActionBar
