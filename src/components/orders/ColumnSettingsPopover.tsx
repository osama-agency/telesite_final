'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'

// Column definition type
interface Column {
  id: string
  label: string
  visible: boolean
  required?: boolean // Some columns cannot be hidden
}

interface ColumnSettingsPopoverProps {
  columns: Column[]
  onColumnToggle: (columnId: string, visible: boolean) => void
}

const ColumnSettingsPopover = ({ columns, onColumnToggle }: ColumnSettingsPopoverProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [localColumns, setLocalColumns] = useState<Column[]>(columns)

  // Update local state when props change
  useEffect(() => {
    setLocalColumns(columns)
  }, [columns])

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleToggle = (columnId: string, checked: boolean) => {
    // Update local state immediately for responsive UI
    setLocalColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: checked } : col
      )
    )

    // Save to localStorage
    const savedColumns = JSON.parse(localStorage.getItem('ordersTableColumns') || '{}')
    savedColumns[columnId] = checked
    localStorage.setItem('ordersTableColumns', JSON.stringify(savedColumns))

    // Notify parent component
    onColumnToggle(columnId, checked)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'column-settings-popover' : undefined

  return (
    <>
      <IconButton
        aria-describedby={id}
        onClick={handleOpen}
        className="text-gray-400 hover:text-white hover:bg-muted/10 transition-colors duration-150"
        size="small"
        title="Настройки колонок"
      >
        <i className="bx-cog text-lg" />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          className: 'bg-level-2 rounded-md shadow-md border border-muted/20',
          sx: {
            minWidth: 200,
            maxWidth: 280,
            mt: 1
          }
        }}
      >
        <Box className="p-4">
          {/* Header */}
          <Box className="flex items-center gap-2 mb-3">
            <i className="bx-columns text-primary text-lg" />
            <Typography className="text-sm font-semibold text-white">
              Настройки колонок
            </Typography>
          </Box>

          <Divider className="border-muted/20 mb-3" />

          {/* Column list */}
          <Box className="space-y-2">
            {localColumns.map((column) => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={column.visible}
                    onChange={(e) => handleToggle(column.id, e.target.checked)}
                    disabled={column.required}
                    size="small"
                    sx={{
                      color: 'var(--mui-palette-text-secondary)',
                      '&.Mui-checked': {
                        color: 'var(--mui-palette-primary-main)',
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5
                      }
                    }}
                  />
                }
                label={
                  <Typography
                    className={`text-sm transition-colors duration-150 ${
                      column.visible
                        ? 'text-white'
                        : 'text-gray-400'
                    } ${
                      column.required
                        ? 'opacity-50'
                        : 'hover:text-white'
                    }`}
                  >
                    {column.label}
                    {column.required && (
                      <Typography
                        component="span"
                        className="text-xs text-gray-500 ml-1"
                      >
                        (обязательная)
                      </Typography>
                    )}
                  </Typography>
                }
                className="w-full m-0 rounded-md hover:bg-muted/10 transition-colors duration-150 p-1"
                sx={{
                  '.MuiFormControlLabel-label': {
                    width: '100%'
                  }
                }}
              />
            ))}
          </Box>

          {/* Footer info */}
          <Divider className="border-muted/20 my-3" />

          <Typography className="text-xs text-gray-500 text-center">
            Настройки сохраняются автоматически
          </Typography>
        </Box>
      </Popover>
    </>
  )
}

export default ColumnSettingsPopover
