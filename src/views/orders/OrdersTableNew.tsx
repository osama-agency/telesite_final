'use client'

// React Imports
import { useEffect, useState, useCallback, useMemo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Divider from '@mui/material/Divider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import { useShallow } from 'zustand/react/shallow'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import OrderDetailsDrawer from '@/components/orders/OrderDetailsDrawer'
import ColumnSettingsPopover from '@/components/orders/ColumnSettingsPopover'

// Store Import
import { useOrdersFilterStore } from '@/store/ordersFilterStore'

// Types
interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  name: string
  quantity: number
  price: string
  total: string
  createdAt: string
  updatedAt: string
}

interface OrderData {
  id: string
  externalId: string
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  status: string
  total: string
  currency: string
  orderDate: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

type Order = 'asc' | 'desc'

const AviasalesOrdersTable = () => {
  // Zustand Store
  const { filters, setFilter, resetFilters } = useOrdersFilterStore(
    useShallow(state => ({
      filters: state.filters,
      setFilter: state.setFilter,
      resetFilters: state.resetFilters
    }))
  )

  // MUI Theme
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  // Local State
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [orderBy, setOrderBy] = useState<keyof OrderData>('orderDate')
  const [orderDirection, setOrderDirection] = useState<Order>('desc')
  const [filtersPopover, setFiltersPopover] = useState<HTMLElement | null>(null)

  // Order Details Drawer State
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Column Settings State
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    orderDate: true,
    customerName: true,
    items: true,
    status: true,
    total: true,
    actions: true
  })

  // Mock data for demo
  const mockOrders: OrderData[] = useMemo(() => [
    {
      id: '1',
      externalId: '1192',
      customerName: 'Островский Данил Игоревич',
      customerEmail: 'danil@example.com',
      customerPhone: '+7 921 123 45 67',
      status: 'shipped',
      total: '6000',
      currency: 'RUB',
      orderDate: '2025-06-05',
      createdAt: '2025-06-05T10:00:00Z',
      updatedAt: '2025-06-05T10:00:00Z',
      items: [
        {
          id: '1',
          orderId: '1',
          productId: '1',
          name: 'Atomineх 25 mg',
          quantity: 1,
          price: '6000',
          total: '6000',
          createdAt: '2025-06-05T10:00:00Z',
          updatedAt: '2025-06-05T10:00:00Z'
        }
      ]
    },
    // Add more mock data...
  ], [])

  // Load data effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOrders(mockOrders)
      setLoading(false)
    }
    loadData()
  }, [mockOrders])

  // Utility functions
  const formatCurrency = useCallback((amount: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(Number(amount))
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString))
  }, [])

  // Status configuration
  const getStatusConfig = useCallback((status: string) => {
    const configs = {
      shipped: {
        label: 'Отправлен',
        className: 'bg-success/10 border-success/50 text-success',
        dotColor: 'success.main'
      },
      cancelled: {
        label: 'Отменен',
        className: 'bg-error/10 border-error/50 text-error',
        dotColor: 'error.main'
      },
      overdue: {
        label: 'Просрочен',
        className: 'bg-warning/10 border-warning/50 text-warning',
        dotColor: 'warning.main'
      },
      processing: {
        label: 'Обрабатывается',
        className: 'bg-info/10 border-info/50 text-info',
        dotColor: 'info.main'
      },
      unpaid: {
        label: 'Не оплачен',
        className: 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400',
        dotColor: '#FACC15'
      }
    }
    return configs[status as keyof typeof configs] || {
      label: status,
      className: 'bg-gray-400/10 border-gray-400/50 text-gray-400',
      dotColor: 'gray'
    }
  }, [])

  // Filter data
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filters.status !== 'all' && order.status !== filters.status) return false
      if (filters.customer && !order.customerName?.toLowerCase().includes(filters.customer.toLowerCase())) return false
      return true
    })
  }, [orders, filters])

  // Sort data
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const aValue = a[orderBy]
      const bValue = b[orderBy]

      if (aValue === null) return 1
      if (bValue === null) return -1

      if (orderDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [filteredOrders, orderBy, orderDirection])

  // Paginate data
  const paginatedOrders = useMemo(() => {
    const startIndex = page * rowsPerPage
    return sortedOrders.slice(startIndex, startIndex + rowsPerPage)
  }, [sortedOrders, page, rowsPerPage])

  // Handlers
  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: any) => {
    const value = typeof event.target.value === 'string' ? parseInt(event.target.value, 10) : event.target.value
    setRowsPerPage(value)
    setPage(0)
  }, [])

  const handleRequestSort = useCallback((property: keyof OrderData) => {
    const isAsc = orderBy === property && orderDirection === 'asc'
    setOrderDirection(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }, [orderBy, orderDirection])

  const handleFiltersClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFiltersPopover(event.currentTarget)
  }, [])

  const handleFiltersClose = useCallback(() => {
    setFiltersPopover(null)
  }, [])

  // Order Details handlers
  const handleOrderClick = useCallback((orderId: string) => {
    setSelectedOrderId(orderId)
    setDetailsDrawerOpen(true)
  }, [])

  const handleDetailsClose = useCallback(() => {
    setDetailsDrawerOpen(false)
    setSelectedOrderId(null)
  }, [])

  const handleDetailsOpen = useCallback(() => {
    // Required by SwipeableDrawer but we control opening via handleOrderClick
  }, [])

  // Column Settings handlers
  const handleColumnToggle = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: visible
    }))
  }, [])

  // Column configurations for settings
  const columnConfigs = useMemo(() => [
    { id: 'id', label: '№', visible: visibleColumns.id, required: true },
    { id: 'orderDate', label: 'Дата', visible: visibleColumns.orderDate },
    { id: 'customerName', label: 'Клиент', visible: visibleColumns.customerName, required: true },
    { id: 'items', label: 'Товары', visible: visibleColumns.items },
    { id: 'status', label: 'Статус', visible: visibleColumns.status },
    { id: 'total', label: 'Сумма', visible: visibleColumns.total },
    { id: 'actions', label: 'Действие', visible: visibleColumns.actions, required: true }
  ], [visibleColumns])

  // Render skeleton rows
  const renderSkeletonRows = useCallback(() => {
    return Array.from({ length: 5 }, (_, index) => (
      <TableRow key={index} className="min-h-[56px]">
        <TableCell className="w-[80px]">
          <Skeleton variant="text" width={60} height={20} />
        </TableCell>
        <TableCell className="w-[100px]">
          <Skeleton variant="text" width={80} height={20} />
        </TableCell>
        <TableCell className="flex-1">
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />
        </TableCell>
        <TableCell className="flex-1">
          <Skeleton variant="text" width="60%" height={20} />
        </TableCell>
        <TableCell className="w-[120px] text-center">
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 12, mx: 'auto' }} />
        </TableCell>
        <TableCell className="w-[100px] text-right">
          <Skeleton variant="text" width={70} height={20} sx={{ ml: 'auto' }} />
        </TableCell>
        <TableCell className="w-[48px] text-center">
          <Skeleton variant="circular" width={32} height={32} sx={{ mx: 'auto' }} />
        </TableCell>
      </TableRow>
    ))
  }, [])

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-6">
        <Typography className="text-2xl mb-2">📭</Typography>
        <Typography variant="h6" className="text-gray-500 mb-1">
          Нет заказов, соответствующих критериям
        </Typography>
        <Button
          variant="text"
          onClick={resetFilters}
          className="text-primary"
        >
          Сбросить фильтры
        </Button>
      </TableCell>
    </TableRow>
  ), [resetFilters])

  return (
    <Box>
      {/* Header with count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Заказы
        </Typography>
        <Typography className="text-sm text-gray-400">
          ({filteredOrders.length})
        </Typography>
      </Box>

      {/* Aviasales 2025 Filter Bar */}
      <Box
        className="bg-level-2 shadow-sm/10 rounded-md p-3 mb-4"
        sx={{
          position: 'sticky',
          top: 72,
          zIndex: 10,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box className="flex items-center justify-between gap-4">
          {/* Desktop Filters - visible on xl+ screens */}
          <Box className="hidden xl:flex items-center gap-4 flex-1">
            <FormControl size="small" sx={{ width: 150 }}>
              <Select
                value={filters.status}
                displayEmpty
                onChange={(e) => setFilter('status', e.target.value)}
                className="bg-level-2 border border-muted/20 rounded-md"
                sx={{
                  height: 36,
                  '& .MuiOutlinedInput-input': {
                    py: 1,
                    px: 3,
                    color: 'white'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    borderWidth: 1
                  }
                }}
                renderValue={(selected) => {
                  if (!selected || selected === 'all') {
                    return <Typography className="text-white/60 text-sm">Все статусы</Typography>
                  }
                  const config = getStatusConfig(selected)
                  return (
                    <Box className="flex items-center gap-2">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: config.dotColor
                        }}
                      />
                      <Typography className="text-white text-sm">
                        {config.label}
                      </Typography>
                    </Box>
                  )
                }}
              >
                <MenuItem value="all">
                  <Typography className="text-gray-400">Все статусы</Typography>
                </MenuItem>
                {['shipped', 'cancelled', 'overdue', 'processing', 'unpaid'].map((status) => {
                  const config = getStatusConfig(status)
                  return (
                    <MenuItem key={status} value={status}>
                      <Box className="flex items-center gap-2">
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: config.dotColor
                          }}
                        />
                        {config.label}
                      </Box>
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>

            <CustomTextField
              size="small"
              placeholder="Поиск клиента..."
              value={filters.customer}
              onChange={(e) => setFilter('customer', e.target.value)}
              className="bg-level-2 border border-muted/20 rounded-md"
              sx={{
                maxWidth: 360,
                '& .MuiOutlinedInput-root': {
                  height: 36,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 1
                  }
                },
                '& .MuiOutlinedInput-input': {
                  py: 1,
                  px: 3,
                  color: 'white'
                }
              }}
              InputProps={{
                startAdornment: <i className="bx-search text-lg text-gray-400 mr-2" />
              }}
            />

            {(filters.status !== 'all' || filters.customer !== '') && (
              <Button
                size="small"
                onClick={resetFilters}
                startIcon={<i className="bx-x text-sm" />}
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  p: 0.5,
                  minWidth: 'auto'
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </Box>

          {/* Compact Filter Button - visible on screens < xl */}
          <Box className="flex xl:hidden items-center justify-between w-full">
            <Box className="flex items-center gap-2">
              {(filters.status !== 'all' || filters.customer !== '') && (
                <Typography className="text-xs text-gray-400">
                  Активные фильтры
                </Typography>
              )}
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<i className="bx-tune text-lg" />}
              onClick={handleFiltersClick}
              sx={{
                height: 36,
                px: 3,
                borderRadius: 1.5,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: 'text.primary',
                fontWeight: 500,
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }
              }}
            >
              Фильтр
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content Card with improved spacing */}
      <Card sx={{ mt: 4, mb: 6 }}>
        <TableContainer
          component={Paper}
          variant="outlined"
          className="scrollbar-thin scrollbar-thumb-[#4c4c4c]/70"
          sx={{
            maxHeight: 'calc(100vh - 320px)',
            minHeight: 400,
            border: 'none'
          }}
        >
          <Table stickyHeader>
            {/* Aviasales 2025 Header */}
            <TableHead>
              <TableRow
                sx={{
                  '& .MuiTableCell-head': {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    position: 'sticky',
                    top: 0,
                    zIndex: 9
                  }
                }}
              >
                {/* № */}
                <TableCell
                  className="w-[80px] text-center"
                  sx={{ px: 2, py: 2 }}
                >
                  <Typography className="text-xs text-gray-400 uppercase font-medium">
                    №
                  </Typography>
                </TableCell>

                {/* Дата */}
                <TableCell
                  className="w-[100px]"
                  sx={{ px: 2, py: 2 }}
                >
                  <TableSortLabel
                    active={orderBy === 'orderDate'}
                    direction={orderBy === 'orderDate' ? orderDirection : 'asc'}
                    onClick={() => handleRequestSort('orderDate')}
                    className="text-xs text-gray-400 uppercase font-medium"
                    sx={{
                      '&:hover': {
                        color: 'primary.main'
                      },
                      '&.Mui-active': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    Дата
                  </TableSortLabel>
                </TableCell>

                {/* Клиент */}
                <TableCell
                  className="flex-1"
                  sx={{ px: 2, py: 2 }}
                >
                  <TableSortLabel
                    active={orderBy === 'customerName'}
                    direction={orderBy === 'customerName' ? orderDirection : 'asc'}
                    onClick={() => handleRequestSort('customerName')}
                    className="text-xs text-gray-400 uppercase font-medium"
                    sx={{
                      '&:hover': {
                        color: 'primary.main'
                      },
                      '&.Mui-active': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    Клиент
                  </TableSortLabel>
                </TableCell>

                {/* Товары */}
                <TableCell
                  className="flex-1"
                  sx={{ px: 2, py: 2 }}
                >
                  <Typography className="text-xs text-gray-400 uppercase font-medium">
                    Товары
                  </Typography>
                </TableCell>

                {/* Статус */}
                <TableCell
                  className="w-[120px] text-center"
                  sx={{ px: 2, py: 2 }}
                >
                  <Typography className="text-xs text-gray-400 uppercase font-medium">
                    Статус
                  </Typography>
                </TableCell>

                {/* Сумма */}
                <TableCell
                  className="w-[100px] text-right"
                  sx={{ px: 2, py: 2 }}
                >
                  <TableSortLabel
                    active={orderBy === 'total'}
                    direction={orderBy === 'total' ? orderDirection : 'asc'}
                    onClick={() => handleRequestSort('total')}
                    className="text-xs text-gray-400 uppercase font-medium"
                    sx={{
                      '&:hover': {
                        color: 'primary.main'
                      },
                      '&.Mui-active': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    Сумма ₽
                  </TableSortLabel>
                </TableCell>

                {/* Действие + Settings */}
                <TableCell
                  className="w-[48px] text-center"
                  sx={{ px: 1, py: 2 }}
                >
                  <ColumnSettingsPopover
                    columns={columnConfigs}
                    onColumnToggle={handleColumnToggle}
                  />
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body with Aviasales 2025 improvements */}
            <TableBody>
              {loading ? (
                renderSkeletonRows()
              ) : paginatedOrders.length === 0 ? (
                renderEmptyState()
              ) : (
                paginatedOrders.map((order, index) => (
                  <TableRow
                    key={order.id}
                    className={`min-h-[56px] cursor-pointer transition-colors duration-100 ${
                      index % 2 === 0 ? 'bg-level-1' : 'bg-level-2'
                    }`}
                    sx={{
                      lineHeight: 1.5,
                      '& .MuiTableCell-root': {
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        py: 2,
                        px: 2
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        '& .status-chip': {
                          bgcolor: 'rgba(var(--status-color), 0.2)'
                        },
                        '& .action-button': {
                          opacity: 0.9
                        }
                      }
                    }}
                  >
                    {/* № */}
                    <TableCell className="w-[80px] text-center">
                      <Typography className="text-sm text-gray-400 font-mono">
                        #{order.externalId}
                      </Typography>
                    </TableCell>

                    {/* Дата */}
                    <TableCell className="w-[100px]">
                      <Typography className="text-sm text-gray-400 text-right">
                        {formatDate(order.orderDate)}
                      </Typography>
                    </TableCell>

                    {/* Клиент */}
                    <TableCell className="flex-1">
                      <Typography className="text-sm font-medium text-white line-clamp-1">
                        {order.customerName || 'Не указан'}
                      </Typography>
                      {order.customerEmail && (
                        <Typography className="text-xs text-gray-400 line-clamp-1">
                          {order.customerEmail}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Товары */}
                    <TableCell className="flex-1">
                      <Typography className="text-sm text-gray-300 line-clamp-1">
                        {order.items.length === 1
                          ? order.items[0].name
                          : `${order.items[0].name} +${order.items.length - 1}`
                        }
                      </Typography>
                    </TableCell>

                    {/* Статус */}
                    <TableCell className="w-[120px] text-center">
                      {(() => {
                        const config = getStatusConfig(order.status)
                        return (
                          <Chip
                            label={config.label}
                            size="small"
                            className={`status-chip ${config.className} text-xs font-medium px-3 py-0.5 rounded-full border-2`}
                            sx={{
                              minHeight: 24,
                              '& .MuiChip-label': {
                                px: 1.5,
                                py: 0.25
                              }
                            }}
                          />
                        )
                      })()}
                    </TableCell>

                    {/* Сумма */}
                    <TableCell className="w-[100px] text-right">
                      <Typography className="text-sm font-semibold text-white font-mono">
                        {formatCurrency(order.total)}
                      </Typography>
                    </TableCell>

                    {/* Действие */}
                    <TableCell className="w-[48px] text-center">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleOrderClick(order.id)}
                        className="action-button opacity-60 hover:opacity-80 hover:bg-level-3/30 rounded-full"
                        sx={{ p: 1 }}
                        aria-label={`Открыть детали заказа #${order.externalId}`}
                      >
                        <i className="bx-show text-base" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Aviasales 2025 Pagination */}
        <Box className="flex items-center justify-between px-4 py-3 border-t border-muted/20">
          {/* Left: Rows per page */}
          <Box className="flex items-center gap-3">
            <Typography className="text-sm text-gray-400">
              Строк на странице:
            </Typography>
            <FormControl size="small">
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className="w-[80px] text-sm"
                sx={{
                  '& .MuiSelect-select': {
                    py: 0.5,
                    px: 1.5
                  }
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Right: Pagination info and controls */}
          <Box className="flex items-center gap-4">
            <Typography className="text-sm text-gray-400">
              {`${page * rowsPerPage + 1}—${Math.min((page + 1) * rowsPerPage, filteredOrders.length)} из ${filteredOrders.length}`}
            </Typography>

            <Box className="flex items-center gap-1">
              <IconButton
                size="small"
                disabled={page === 0}
                onClick={() => handleChangePage(null, page - 1)}
                className="hover:bg-level-2/30 rounded-full"
                sx={{ opacity: page === 0 ? 0.5 : 1 }}
              >
                <i className="bx-chevron-left text-lg" />
              </IconButton>

              <IconButton
                size="small"
                disabled={page >= Math.ceil(filteredOrders.length / rowsPerPage) - 1}
                onClick={() => handleChangePage(null, page + 1)}
                className="hover:bg-level-2/30 rounded-full"
                sx={{ opacity: page >= Math.ceil(filteredOrders.length / rowsPerPage) - 1 ? 0.5 : 1 }}
              >
                <i className="bx-chevron-right text-lg" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Mobile Filters Popover */}
      <Popover
        open={Boolean(filtersPopover)}
        anchorEl={filtersPopover}
        onClose={handleFiltersClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{
          className: "bg-level-2 rounded-lg shadow-lg",
          sx: {
            minWidth: 300,
            p: 3
          }
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Фильтры
        </Typography>

        <Box className="space-y-4">
          <FormControl fullWidth size="small">
            <Typography className="text-sm text-gray-400 mb-1">Статус</Typography>
            <Select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="bg-level-3 border border-muted/20 rounded-md"
            >
              <MenuItem value="all">Все статусы</MenuItem>
              {['shipped', 'cancelled', 'overdue', 'processing', 'unpaid'].map((status) => {
                const config = getStatusConfig(status)
                return (
                  <MenuItem key={status} value={status}>
                    <Box className="flex items-center gap-2">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: config.dotColor
                        }}
                      />
                      {config.label}
                    </Box>
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>

          <Box>
            <Typography className="text-sm text-gray-400 mb-1">Клиент</Typography>
            <CustomTextField
              fullWidth
              size="small"
              placeholder="Поиск клиента..."
              value={filters.customer}
              onChange={(e) => setFilter('customer', e.target.value)}
              className="bg-level-3 border border-muted/20 rounded-md"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box className="flex gap-2">
            {(filters.status !== 'all' || filters.customer !== '') && (
              <Button
                variant="text"
                onClick={resetFilters}
                className="flex-1"
              >
                Сбросить
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleFiltersClose}
              className="flex-1"
            >
              Применить
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        open={detailsDrawerOpen}
        onClose={handleDetailsClose}
        onOpen={handleDetailsOpen}
        orderId={selectedOrderId}
      />
    </Box>
  )
}

export default AviasalesOrdersTable
