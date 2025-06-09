'use client'

// React Imports
import { useEffect, useState, useCallback, useMemo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'

import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'

import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'

import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Fade from '@mui/material/Fade'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Stack from '@mui/material/Stack'

// Third-party Imports
import { useShallow } from 'zustand/react/shallow'
import { motion, AnimatePresence } from 'framer-motion'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import OrderDetailsDrawer from '@/components/orders/OrderDetailsDrawer'

// Store Import
import { useOrdersFilterStore } from '@/store/ordersFilterStore'
import { useDateRangeStore } from '@/store/dateRangeStore'

// Enhanced Toast Import
import { showSuccessToast, showErrorToast } from '@/utils/enhancedToast'



// Premium Sneat Filter Button Styles
const filterButtonStyles = `
  .filter-button {
    background: rgba(38, 37, 51, 0.6) !important;
    border: 2px solid #696CFF !important;
    border-radius: 8px !important;
    color: #696CFF !important;
    padding: 8px 16px !important;
    display: inline-flex !important;
    align-items: center !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    font-family: inherit !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    min-height: 36px !important;
    position: relative !important;
    overflow: hidden !important;
  }

  .filter-button:hover {
    background: #696CFF !important;
    color: #FFFFFF !important;
    transform: scale(1.03) !important;
    box-shadow: 0 0 0 3px rgba(105, 108, 255, 0.25) !important;
  }

  .filter-button:active {
    transform: scale(0.97) !important;
  }

  .filter-button .icon {
    margin-right: 8px !important;
  }

  @media (max-width: 480px) {
    .filter-button {
      width: 100% !important;
      margin: 0 16px !important;
      padding: 10px 0 !important;
      text-align: center !important;
      font-size: 14px !important;
      justify-content: center !important;
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = filterButtonStyles
  document.head.appendChild(styleElement)
}

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

  const { range } = useDateRangeStore()

  // MUI Theme
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  // Local State
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [orderBy, setOrderBy] = useState<keyof OrderData>('orderDate')
  const [orderDirection, setOrderDirection] = useState<Order>('desc')

  const [filtersBottomSheet, setFiltersBottomSheet] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'info' | 'warning' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

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

  // API response interface
  interface ApiResponse {
    success: boolean
    data: {
      orders: OrderData[]
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }
    message?: string
  }

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue])

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true)

      // Используем относительный путь к локальному API
      const response = await fetch('/api/orders')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Обрабатываем данные из нашего локального API
      if (data.success && data.data && Array.isArray(data.data.orders)) {
        // Преобразуем данные в нужный формат
        const transformedOrders = data.data.orders.map((order: any) => ({
          id: order.id?.toString() || Math.random().toString(),
          externalId: order.externalId?.toString() || order.id?.toString() || 'N/A',
          customerName: order.customerName || 'Не указан',
          customerEmail: order.customerEmail || null,
          customerPhone: order.customerPhone || null,
          status: mapOrderStatus(order.status),
          total: order.total?.toString() || '0',
          currency: order.currency || 'RUB',
          orderDate: order.orderDate || order.createdAt || new Date().toISOString(),
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: order.updatedAt || new Date().toISOString(),
          items: order.items?.map((item: any, index: number) => ({
            id: item.id?.toString() || index.toString(),
            orderId: order.id?.toString() || Math.random().toString(),
            productId: item.productId?.toString() || null,
            name: item.name || `Товар ${index + 1}`,
            quantity: item.quantity || 1,
            price: item.price?.toString() || '0',
            total: item.total?.toString() || '0',
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || new Date().toISOString()
          })) || []
        }))

        setOrders(transformedOrders)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setSnackbar({
        open: true,
        message: 'Ошибка загрузки заказов',
        severity: 'error'
      })
      setOrders([]) // Fallback to empty array
    } finally {
      setLoading(false)
    }
  }

  // Helper function to map order status
  const mapOrderStatus = (status: any): string => {
    if (!status) return 'processing'

    const statusStr = status.toString().toLowerCase()

    // Маппинг статусов
    if (statusStr.includes('paid') || statusStr.includes('оплач')) return 'shipped'
    if (statusStr.includes('cancel') || statusStr.includes('отмен')) return 'cancelled'
    if (statusStr.includes('ship') || statusStr.includes('доставк')) return 'shipped'
    if (statusStr.includes('pending') || statusStr.includes('ожид')) return 'processing'
    if (statusStr.includes('unpaid') || statusStr.includes('неоплач')) return 'unpaid'

    return 'processing' // default
  }


  // Load data effect
  useEffect(() => {
    fetchOrders()
  }, [page, rowsPerPage, orderBy, orderDirection, debouncedSearch, range])

  // Update search filter when debounced value changes
  useEffect(() => {
    setFilter('customer', debouncedSearch)
    setPage(0) // Reset to first page when search changes
  }, [debouncedSearch, setFilter])

  // Utility functions
  const formatCurrency = useCallback((amount: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(Number(amount))
  }, [])

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return 'Дата не указана'

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Некорректная дата'

    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }, [])

  // Status configuration with enhanced colors
  const getStatusConfig = useCallback((status: string) => {
    const configs = {
      shipped: {
        label: 'Отправлен',
        color: '#2AC769',
        bgColor: 'rgba(42, 199, 105, 0.1)',
        borderColor: '#2AC769'
      },
      cancelled: {
        label: 'Отменён',
        color: '#FF4B4B',
        bgColor: 'rgba(255, 75, 75, 0.1)',
        borderColor: '#FF4B4B'
      },
      overdue: {
        label: 'Просрочен',
        color: '#FFC732',
        bgColor: 'rgba(255, 199, 50, 0.1)',
        borderColor: '#FFC732'
      },
      processing: {
        label: 'Обрабатывается',
        color: '#5AC8FA',
        bgColor: 'rgba(90, 200, 250, 0.1)',
        borderColor: '#5AC8FA'
      },
      unpaid: {
        label: 'Не оплачен',
        color: '#F5A623',
        bgColor: 'rgba(245, 166, 35, 0.1)',
        borderColor: '#F5A623'
      }
    }

    return configs[status as keyof typeof configs] || {
      label: status,
      color: '#9CA3AF',
      bgColor: 'rgba(156, 163, 175, 0.1)',
      borderColor: '#9CA3AF'
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
      let aValue: any = a[orderBy]
      let bValue: any = b[orderBy]

      // Handle null values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Special handling for different data types
      if (orderBy === 'orderDate' || orderBy === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (orderBy === 'total') {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue?.toLowerCase() || ''
      }

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
        const result = sortedOrders.slice(startIndex, startIndex + rowsPerPage)

    return result
  }, [sortedOrders, page, rowsPerPage, orders.length, filteredOrders.length, filters.customer, filters.status])

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

  const handleFiltersChipClick = useCallback(() => {
    setFiltersBottomSheet(true)
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

  // Copy amount handler with enhanced feedback
  const handleCopyAmount = useCallback(async (amount: string, event: React.MouseEvent) => {
    event.stopPropagation()

    try {
      await navigator.clipboard.writeText(amount)

      // Enhanced success feedback
      setSnackbar({
        open: true,
        message: `💰 Сумма ${amount} скопирована!`,
        severity: 'success'
      })

      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: '❌ Не удалось скопировать сумму',
        severity: 'error'
      })
    }
  }, [])

  // Column Settings handlers
  const handleColumnToggle = useCallback((columnId: string, visible: boolean) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnId]: visible
    }))
  }, [])

  // Close snackbar handler
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }))
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

  // Group orders by date for mobile cards
  const groupOrdersByDate = useMemo(() => {
    const groups: { [date: string]: OrderData[] } = {}

    paginatedOrders.forEach(order => {
      const date = new Date(order.orderDate).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).replace(' г.', '')

      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(order)
    })

    return groups
  }, [paginatedOrders])

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

  // Render mobile cards - Aviasales × Notion × Linear style
  const renderMobileCards = () => (
    <Box className="lg:hidden">


      {/* Cards Container */}
      <Box
        sx={{
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 240px)',
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        {paginatedOrders.length === 0 ? (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
              bgcolor: 'background.paper',
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography sx={{ fontSize: '2rem', mb: 1.5 }}>📭</Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 500, mb: 0.5, color: 'text.primary' }}
            >
              Нет заказов
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Нет заказов по выбранным параметрам
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {Object.entries(groupOrdersByDate).map(([date, orders]) => (
              <Box key={date}>
                {/* Date Header */}
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  📅 {date}
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: 'text.secondary',
                      ml: 0.5
                    }}
                  >
                    ({orders.length} {orders.length === 1 ? 'заказ' : orders.length < 5 ? 'заказа' : 'заказов'})
                  </Typography>
                </Typography>

                {/* Orders for this date */}
                <Stack spacing={1.5}>
                  {orders.map((order, index) => {
              // Get status chip props for modern styling
              const getChipProps = (status: string) => {
                const statusMap = {
                  processing: { color: 'primary' as const, label: 'Обрабатывается' },
                  shipped: { color: 'success' as const, label: 'Отправлен' },
                  unpaid: { color: 'warning' as const, label: 'Не оплачен' },
                  cancelled: { color: 'error' as const, label: 'Отменён' },
                  overdue: { color: 'warning' as const, label: 'Просрочен' }
                }
                return statusMap[status as keyof typeof statusMap] || { color: 'default' as const, label: status }
              }

              // Get products display with improved multi-item handling
              const getProductsDisplay = () => {
                const totalItems = order.items.length

                if (totalItems === 1) {
                  // Single product - show name as before
                  const name = order.items[0].name
                  return {
                    mainText: name.length > 35 ? `${name.substring(0, 35)}...` : name,
                    previewText: null
                  }
                } else {
                  // Multiple products - show count and preview
                  const productNames = order.items.map(item => item.name).join(', ')
                  const preview = productNames.length > 30 ? `${productNames.substring(0, 30)}...` : productNames

                  // Правильное склонение слова "товар"
                  const getProductWord = (count: number) => {
                    if (count % 10 === 1 && count % 100 !== 11) return 'товар'
                    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'товара'
                    return 'товаров'
                  }

                  return {
                    mainText: `${totalItems} ${getProductWord(totalItems)}`,
                    previewText: preview
                  }
                }
              }

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{
                    y: -2,
                    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <Box
                    onClick={() => handleOrderClick(order.id)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 4,
                      bgcolor: 'background.paper',
                      p: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      mb: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, rgba(105, 108, 255, 0.3), transparent)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.6s ease',
                      },
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 8px 32px rgba(105, 108, 255, 0.12)',
                        '&::before': {
                          transform: 'translateX(100%)',
                        }
                      },
                      '&:active': {
                        transform: 'scale(0.995)'
                      }
                    }}
                  >
                    {/* Header: Order info + Amount */}
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2
                    }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '12px',
                          color: 'text.secondary',
                          fontWeight: 400
                        }}
                      >
                        #{order.externalId} · {formatDate(order.orderDate).replace(' г.', '')}
                      </Typography>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Typography
                          variant="body2"
                          onClick={(e) => handleCopyAmount(order.total, e)}
                          sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'text.primary',
                            fontFamily: 'system-ui',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: 1,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              color: 'primary.main',
                              backgroundColor: 'rgba(105, 108, 255, 0.08)',
                            }
                          }}
                          title="Нажмите, чтобы скопировать"
                        >
                          {formatCurrency(order.total)}
                        </Typography>
                      </motion.div>
                    </Box>

                    {/* Customer Name - Main Focus */}
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'text.primary',
                        lineHeight: 1.4,
                        mb: 1
                      }}
                    >
                      {order.customerName || 'Клиент не указан'}
                    </Typography>

                    {/* Products - Secondary */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '13px',
                        color: 'text.secondary',
                        lineHeight: 1.3,
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {getProductsDisplay().mainText}
                    </Typography>

                    {/* Status Badge - Subtle */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      {(() => {
                        const statusConfig = getStatusConfig(order.status)
                        const isSuccess = order.status === 'shipped'
                        const isWarning = order.status === 'unpaid' || order.status === 'overdue'
                        const isError = order.status === 'cancelled'

                        return (
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              px: 2,
                              py: 0.75,
                              borderRadius: 2,
                              fontSize: '12px',
                              fontWeight: 500,
                              border: '1px solid',
                              bgcolor: isSuccess ? 'rgba(34, 197, 94, 0.08)' :
                                      isWarning ? 'rgba(245, 158, 11, 0.08)' :
                                      isError ? 'rgba(239, 68, 68, 0.08)' :
                                      'rgba(59, 130, 246, 0.08)',
                              borderColor: isSuccess ? 'rgba(34, 197, 94, 0.2)' :
                                          isWarning ? 'rgba(245, 158, 11, 0.2)' :
                                          isError ? 'rgba(239, 68, 68, 0.2)' :
                                          'rgba(59, 130, 246, 0.2)',
                              color: isSuccess ? '#059669' :
                                     isWarning ? '#d97706' :
                                     isError ? '#dc2626' :
                                     '#2563eb'
                            }}
                          >
                            {statusConfig.label}
                          </Box>
                        )
                      })()}
                    </Box>
                  </Box>
                </motion.div>
              )
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        {/* Mobile Pagination */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 3,
          gap: 2
        }}>
          <IconButton
            size="small"
            disabled={page === 0}
            onClick={() => handleChangePage(null, page - 1)}
            sx={{
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { borderColor: 'primary.main' },
              '&:disabled': { opacity: 0.3 }
            }}
          >
            <i className="bx-chevron-left" />
          </IconButton>

          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
            {page + 1} из {Math.ceil(filteredOrders.length / rowsPerPage)}
          </Typography>

          <IconButton
            size="small"
            disabled={page >= Math.ceil(filteredOrders.length / rowsPerPage) - 1}
            onClick={() => handleChangePage(null, page + 1)}
            sx={{
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': { borderColor: 'primary.main' },
              '&:disabled': { opacity: 0.3 }
            }}
          >
            <i className="bx-chevron-right" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{
      bgcolor: 'background.default',
      pt: 2,
      pb: 3
    }}>
      {/* Header Section */}
      <Box sx={{
        mb: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            fontSize: '20px',
            color: 'text.primary',
            mb: 0,
            pb: 2
          }}
        >
          Заказы ({filteredOrders.length})
        </Typography>

        {/* Filters Button - Mobile Only */}
        <Box sx={{ display: { xs: 'block', lg: 'none' }, pb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<i className="bx-cog" style={{ fontSize: '14px' }} />}
            onClick={handleFiltersChipClick}
            sx={{
              minWidth: 'auto',
              px: 2,
              py: 0.75,
              borderRadius: 3,
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'none',
              border: '1px solid #ECECEC',
              bgcolor: 'background.paper',
              color: 'text.primary',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              },
              '&:active': {
                transform: 'scale(0.995)',
                borderColor: 'primary.dark'
              }
            }}
          >
            Фильтры
            {(() => {
              let activeCount = 0
              if (filters.status !== 'all') activeCount++
              if (searchValue !== '') activeCount++
              return activeCount > 0 ? (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 0.75,
                    py: 0.25,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    fontSize: '10px',
                    fontWeight: 600,
                    minWidth: 16,
                    height: 16,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {activeCount}
                </Box>
              ) : null
            })()}
          </Button>
        </Box>
      </Box>

      {/* Desktop Status Filter */}
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        alignItems: 'center',
        gap: 2,
        mb: 3
      }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'text.primary',
            minWidth: 'auto'
          }}
        >
          Статус:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={filters.status}
            displayEmpty
            onChange={(e) => {
              setFilter('status', e.target.value)
              setPage(0) // Reset to first page when status filter changes
            }}
            aria-label="Статус заказа"
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'text.secondary'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main'
              },
              '& .MuiSelect-select': {
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                py: 1
              },
              '& .MuiSelect-icon': {
                color: 'text.secondary'
              }
            }}
            renderValue={(selected) => {
              if (!selected || selected === 'all') {
                return (
                  <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
                    Все статусы
                  </Typography>
                )
              }
              const config = getStatusConfig(selected)
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: config.color
                    }}
                  />
                  <Typography sx={{ fontSize: '14px' }}>{config.label}</Typography>
                </Box>
              )
            }}
          >
            <MenuItem value="all">
              <Typography sx={{ color: 'text.secondary', fontSize: '14px' }}>
                Все статусы
              </Typography>
            </MenuItem>
            {['processing', 'shipped', 'unpaid', 'cancelled'].map((status) => {
              const config = getStatusConfig(status)
              return (
                <MenuItem
                  key={status}
                  value={status}
                  sx={{ color: config.color }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: config.color
                      }}
                    />
                    <Typography sx={{ fontSize: '14px' }}>{config.label}</Typography>
                  </Box>
                </MenuItem>
              )
            })}
          </Select>
                </FormControl>

        {/* Search Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'text.primary',
              minWidth: 'auto'
            }}
          >
            Поиск:
          </Typography>
          <CustomTextField
            size="small"
            placeholder="Поиск клиента..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Поиск клиента"
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'divider'
                },
                '&:hover fieldset': {
                  borderColor: 'text.secondary'
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main'
                }
              },
              '& .MuiOutlinedInput-input': {
                color: 'text.primary',
                fontSize: '14px',
                '&::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.7
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i
                    className="bx-search"
                    style={{
                      color: theme.palette.text.secondary,
                      fontSize: '16px'
                    }}
                  />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Reset Filter Button */}
        {(filters.status !== 'all' || searchValue !== '') && (
          <Button
            variant="text"
            size="small"
            onClick={() => {
              setFilter('status', 'all')
              setSearchValue('')
              setPage(0) // Reset to first page when filters reset
              setSnackbar({
                open: true,
                message: 'Фильтры сброшены',
                severity: 'info'
              })
            }}
            sx={{
              color: 'text.secondary',
              fontSize: '13px',
              textTransform: 'none',
              minWidth: 'auto',
              px: 1.5,
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            Сбросить фильтры
          </Button>
        )}
      </Box>

      {/* Mobile Cards */}
      {isMobile && renderMobileCards()}

      {/* Desktop Table */}
      <Box className="hidden lg:block">
        <Paper
          elevation={1}
          sx={{
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <TableContainer
            sx={{
              maxHeight: 'calc(100vh - 350px)',
              minHeight: 400
            }}
          >
            <Table stickyHeader>
              {/* Enhanced Header */}
              <TableHead>
                <TableRow
                  sx={{
                    '& .MuiTableCell-head': {
                      backgroundColor: 'background.paper',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 2,
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }
                  }}
                >
                  {/* № */}
                  <TableCell sx={{ width: 80, textAlign: 'center' }}>
                    №
                  </TableCell>

                  {/* Дата */}
                  <TableCell sx={{ width: 120 }}>
                    <TableSortLabel
                      active={orderBy === 'orderDate'}
                      direction={orderBy === 'orderDate' ? orderDirection : 'asc'}
                      onClick={() => handleRequestSort('orderDate')}
                      sx={{
                        fontSize: '12px',
                        fontWeight: 600,
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
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'customerName'}
                      direction={orderBy === 'customerName' ? orderDirection : 'asc'}
                      onClick={() => handleRequestSort('customerName')}
                      sx={{
                        fontSize: '12px',
                        fontWeight: 600,
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
                  <TableCell>
                    Товары
                  </TableCell>

                  {/* Статус */}
                  <TableCell sx={{ width: 140, textAlign: 'center' }}>
                    Статус
                  </TableCell>

                  {/* Сумма */}
                  <TableCell sx={{ width: 120, textAlign: 'right' }}>
                    <TableSortLabel
                      active={orderBy === 'total'}
                      direction={orderBy === 'total' ? orderDirection : 'asc'}
                      onClick={() => handleRequestSort('total')}
                      sx={{
                        fontSize: '12px',
                        fontWeight: 600,
                        '&:hover': {
                          color: 'primary.main'
                        },
                        '&.Mui-active': {
                          color: 'primary.main'
                        }
                      }}
                    >
                      Сумма
                    </TableSortLabel>
                  </TableCell>

                  {/* Действие */}
                  <TableCell sx={{ width: 60, textAlign: 'center' }}>
                    <IconButton
                      size="small"
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      aria-label="Настройки таблицы"
                    >
                      <i className="bx-cog text-base" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>

            {/* Enhanced Table Body with modern styling */}
            <TableBody>
              <AnimatePresence>
                {loading ? (
                  renderSkeletonRows()
                ) : paginatedOrders.length === 0 ? (
                  renderEmptyState()
                ) : (
                  paginatedOrders.map((order, index) => {
                    // Получаем статус для MUI Chip
                    const getChipProps = (status: string) => {
                      const statusMap = {
                        processing: { color: 'primary' as const, label: 'Обрабатывается' },
                        shipped: { color: 'success' as const, label: 'Отправлен' },
                        unpaid: { color: 'warning' as const, label: 'Не оплачен' },
                        cancelled: { color: 'error' as const, label: 'Отменён' },
                        overdue: { color: 'warning' as const, label: 'Просрочен' }
                      }
                      return statusMap[status as keyof typeof statusMap] || { color: 'default' as const, label: status }
                    }

                    return (
                      <TableRow
                        key={order.id}
                        component={motion.tr}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.02 }}
                        onClick={() => handleOrderClick(order.id)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: index % 2 === 0 ? 'background.default' : 'background.paper',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          },
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        {/* № */}
                        <TableCell sx={{ py: 2.5, textAlign: 'center' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color: 'primary.main',
                              fontSize: '14px'
                            }}
                          >
                            #{order.externalId}
                          </Typography>
                        </TableCell>

                        {/* Дата */}
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '14px',
                              color: 'text.secondary'
                            }}
                          >
                            {formatDate(order.orderDate)}
                          </Typography>
                        </TableCell>

                        {/* Клиент */}
                        <TableCell sx={{ py: 2.5, maxWidth: 200 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                fontSize: '14px',
                                color: 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {order.customerName || 'Не указан'}
                            </Typography>
                            {order.customerEmail && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '12px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block'
                                }}
                              >
                                {order.customerEmail}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Товары */}
                        <TableCell sx={{ py: 2.5, maxWidth: 300 }}>
                          {order.items.length === 1 ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: '14px',
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {order.items[0].name.length > 30
                                ? `${order.items[0].name.substring(0, 30)}...`
                                : order.items[0].name
                              }
                            </Typography>
                          ) : (
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  color: 'text.primary',
                                  lineHeight: 1.2
                                }}
                              >
                                                                 {order.items.length} {(() => {
                                   const count = order.items.length
                                   if (count % 10 === 1 && count % 100 !== 11) return 'товар'
                                   if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'товара'
                                   return 'товаров'
                                 })()}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '12px',
                                  color: 'text.secondary',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                  lineHeight: 1.3
                                }}
                              >
                                {(() => {
                                  const productNames = order.items.map(item => item.name).join(', ')
                                  return productNames.length > 35 ? `${productNames.substring(0, 35)}...` : productNames
                                })()}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>

                        {/* Статус */}
                        <TableCell sx={{ py: 2.5, textAlign: 'center' }}>
                          <Chip
                            label={getChipProps(order.status).label}
                            color={getChipProps(order.status).color}
                            variant="outlined"
                            size="small"
                            sx={{
                              fontSize: '12px',
                              fontWeight: 500,
                              height: 24
                            }}
                          />
                        </TableCell>

                        {/* Сумма */}
                        <TableCell sx={{ py: 2.5, textAlign: 'right' }}>
                          <Typography
                            variant="body2"
                            onClick={(e) => handleCopyAmount(order.total, e)}
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: 'text.primary',
                              cursor: 'pointer',
                              '&:hover': {
                                color: 'primary.main'
                              },
                              transition: 'color 0.15s ease'
                            }}
                            title="Нажмите, чтобы скопировать"
                          >
                            {formatCurrency(order.total)}
                          </Typography>
                        </TableCell>

                        {/* Действие */}
                        <TableCell sx={{ py: 2.5, textAlign: 'center' }}>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.15 }}
                          >
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOrderClick(order.id)
                              }}
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                  color: 'primary.main'
                                }
                              }}
                              aria-label={`Открыть детали заказа #${order.externalId}`}
                            >
                              <i className="bx-show text-base" />
                            </IconButton>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </AnimatePresence>
                          </TableBody>
            </Table>
          </TableContainer>

        {/* Enhanced Pagination */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          {/* Left: Rows per page */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Строк на странице:
            </Typography>
            <FormControl size="small">
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                sx={{
                  minWidth: 70,
                  '& .MuiSelect-select': {
                    py: 0.5,
                    px: 1.5,
                    fontSize: '14px'
                  }
                }}
              >
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Right: Pagination info and controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {`${page * rowsPerPage + 1}—${Math.min((page + 1) * rowsPerPage, filteredOrders.length)} из ${filteredOrders.length}`}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                disabled={page === 0}
                onClick={() => handleChangePage(null, page - 1)}
                sx={{
                  color: 'text.secondary',
                  opacity: page === 0 ? 0.5 : 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  '&:disabled': {
                    opacity: 0.3
                  }
                }}
              >
                <i className="bx-chevron-left text-lg" />
              </IconButton>

              <IconButton
                size="small"
                disabled={page >= Math.ceil(filteredOrders.length / rowsPerPage) - 1}
                onClick={() => handleChangePage(null, page + 1)}
                sx={{
                  color: 'text.secondary',
                  opacity: page >= Math.ceil(filteredOrders.length / rowsPerPage) - 1 ? 0.5 : 1,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  '&:disabled': {
                    opacity: 0.3
                  }
                }}
              >
                <i className="bx-chevron-right text-lg" />
              </IconButton>
            </Box>
          </Box>
        </Box>
        </Paper>
      </Box>

      {/* Premium Mobile Filters Bottom Sheet */}
      <SwipeableDrawer
        anchor="bottom"
        open={filtersBottomSheet}
        onClose={() => setFiltersBottomSheet(false)}
        onOpen={() => setFiltersBottomSheet(true)}
        disableSwipeToOpen={false}
        swipeAreaWidth={20}
        role="dialog"
        aria-label="Фильтры заказов"
        aria-modal="true"
        ModalProps={{
          keepMounted: true,
          sx: {
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(4px)'
            }
          }
        }}
        PaperProps={{
          sx: {
            maxHeight: { xs: '50vh', md: '40vh' },
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundColor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: theme.palette.mode === 'dark'
              ? '0px -8px 24px rgba(0, 0, 0, 0.6)'
              : '0px -8px 24px rgba(0, 0, 0, 0.15)',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden'
          }
        }}
        SwipeAreaProps={{
          style: { top: 'unset' }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'auto' }}>
          {/* Enhanced Drag Handle */}
          <Box
            sx={{
              width: 60,
              height: 6,
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.12)'
                : 'rgba(0, 0, 0, 0.12)',
              borderRadius: 4,
              mx: 'auto',
              mt: 1
            }}
            aria-hidden="true"
          />

          {/* Premium Header */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              backdropFilter: 'blur(8px)',
              borderBottom: '1px solid',
              borderBottomColor: 'divider',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              px: 3,
              py: 2.5
            }}
          >
            <Box className="flex items-center justify-between">
              {/* Title */}
              <Typography
                variant="h6"
                sx={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'text.primary',
                  flex: 1
                }}
              >
                Фильтры
              </Typography>

              {/* Close Button */}
              <IconButton
                size="small"
                onClick={() => setFiltersBottomSheet(false)}
                aria-label="Закрыть фильтры"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderRadius: '50%'
                  }
                }}
              >
                <i className="bx-x text-xl" />
              </IconButton>
            </Box>

            {/* Swipe Hint */}
            <Box className="flex items-center justify-center mt-2">
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  opacity: 0.7,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <i className="bx-chevron-down text-sm" />
                Потяните вниз или тапните вне окна
              </Typography>
            </Box>
          </Box>

                    {/* Scrollable Content */}
          <Box sx={{
            overflowY: 'auto',
            px: 3,
            py: 2,
            pb: 'calc(env(safe-area-inset-bottom) + 12px)',
            maxHeight: 'calc(100% - 120px)' // Резервируем место для header и handle
                      }}>
              <Stack spacing={2.5}>
                              {/* Status Filter Card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                >
                  <Box
                    sx={{
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2.5,
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 1px 3px rgba(0,0,0,0.3)'
                        : '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'text.primary',
                      mb: 2
                    }}
                  >
                    Выберите статус
                  </Typography>
                  <Select
                    fullWidth
                    value={filters.status}
                    displayEmpty
                    onChange={(e) => setFilter('status', e.target.value)}
                    aria-label="Статус заказа"
                    sx={{
                      height: 44,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'divider'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'text.secondary'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      },
                      '& .MuiSelect-select': {
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center'
                      },
                      '& .MuiSelect-icon': {
                        color: 'text.secondary'
                      }
                    }}
                    renderValue={(selected) => {
                      if (!selected || selected === 'all') {
                        return <Typography sx={{ color: 'text.secondary' }}>Все статусы</Typography>
                      }
                      const config = getStatusConfig(selected)
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: config.color
                            }}
                          />
                          {config.label}
                        </Box>
                      )
                    }}
                  >
                    <MenuItem value="all">
                      <Typography sx={{ color: 'text.secondary' }}>Все статусы</Typography>
                    </MenuItem>
                    {['shipped', 'cancelled', 'overdue', 'processing', 'unpaid'].map((status) => {
                      const config = getStatusConfig(status)
                      return (
                        <MenuItem
                          key={status}
                          value={status}
                          sx={{ color: config.color }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: config.color
                              }}
                            />
                            {config.label}
                          </Box>
                        </MenuItem>
                      )
                    })}
                  </Select>
                </Box>
              </motion.div>

                              {/* Customer Search Card */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 }}
                >
                  <Box
                    sx={{
                      background: 'background.paper',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 2,
                      p: 2.5,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'text.primary',
                      mb: 2
                    }}
                  >
                    Поиск клиента
                  </Typography>
                  <CustomTextField
                    fullWidth
                    placeholder="Введите имя клиента"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    aria-label="Поиск клиента"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i className="bx-search" style={{ color: 'rgba(0,0,0,0.54)', fontSize: '1.2rem' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        height: 44,
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.12)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.25)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#696CFF'
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        color: 'text.primary',
                        '&::placeholder': {
                          color: 'text.secondary',
                          opacity: 0.7
                        }
                      }
                    }}
                  />
                </Box>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.3 }}
              >
                <Box className="flex gap-3 pt-2">
                  {/* Reset Button */}
                  {(filters.status !== 'all' || searchValue !== '') && (
                    <Button
                      variant="text"
                      onClick={() => {
                        resetFilters()
                        setSearchValue('')
                        setSnackbar({
                          open: true,
                          message: 'Фильтры сброшены',
                          severity: 'info'
                        })
                      }}
                      sx={{
                        color: '#FF4B4B',
                        fontSize: '14px',
                        fontWeight: 500,
                        textTransform: 'none',
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'rgba(255, 75, 75, 0.1)'
                        }
                      }}
                      aria-disabled={filters.status === 'all' && searchValue === ''}
                    >
                      Сбросить
                    </Button>
                  )}

                  {/* Apply Button */}
                                      <Button
                      variant="contained"
                      onClick={() => {
                        setFiltersBottomSheet(false)
                        setSnackbar({
                          open: true,
                          message: 'Фильтры применены',
                          severity: 'success'
                        })
                      }}
                      disabled={filters.status === 'all' && searchValue === ''}
                      sx={{
                        flex: 1,
                        height: 48,
                        background: filters.status === 'all' && searchValue === ''
                          ? 'rgba(0, 0, 0, 0.12)'
                          : '#696CFF',
                        color: filters.status === 'all' && searchValue === ''
                          ? 'rgba(0, 0, 0, 0.38)'
                          : '#FFFFFF',
                        fontSize: '16px',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 6,
                        '&:hover': {
                          background: filters.status === 'all' && searchValue === ''
                            ? 'rgba(0, 0, 0, 0.12)'
                            : 'rgba(105, 108, 255, 0.9)',
                          transform: filters.status !== 'all' || searchValue !== '' ? 'translateY(-1px)' : 'none',
                          boxShadow: filters.status !== 'all' || searchValue !== ''
                            ? '0 4px 12px rgba(105, 108, 255, 0.3)'
                            : 'none'
                        },
                        '&:disabled': {
                          background: 'rgba(0, 0, 0, 0.12)',
                          color: 'rgba(0, 0, 0, 0.38)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    aria-disabled={filters.status === 'all' && searchValue === ''}
                  >
                    Применить
                  </Button>
                </Box>
              </motion.div>
            </Stack>
          </Box>
        </Box>
      </SwipeableDrawer>



      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        open={detailsDrawerOpen}
        onClose={handleDetailsClose}
        orderId={selectedOrderId || undefined}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AviasalesOrdersTable
