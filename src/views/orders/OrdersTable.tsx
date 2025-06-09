'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Drawer from '@mui/material/Drawer'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Popover from '@mui/material/Popover'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'

import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

// Utils
import { declOfNum } from '@/utils/i18n'

// Component Imports
import { useDateRangeStore } from '@/store/dateRangeStore'
import { useOrdersFilterStore } from '@/store/ordersFilterStore'
import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

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

type Order = 'asc' | 'desc'

const OrdersTable = () => {
  // States
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [productsPopover, setProductsPopover] = useState<{
    anchorEl: HTMLElement | null
    order: OrderData | null
    isLazyLoaded: boolean
  }>({ anchorEl: null, order: null, isLazyLoaded: false })

  const [productsDialog, setProductsDialog] = useState<{
    open: boolean
    order: OrderData | null
  }>({ open: false, order: null })

  // Mobile-specific states
  const [filtersBottomSheet, setFiltersBottomSheet] = useState(false)
  const [orderDetailsDrawer, setOrderDetailsDrawer] = useState(false)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderData | null>(null)
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState(false)
  const [pullToRefreshTriggered, setPullToRefreshTriggered] = useState(false)

  // Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  // Sorting states
  const [orderBy, setOrderBy] = useState<keyof OrderData>('orderDate')
  const [orderDirection, setOrderDirection] = useState<Order>('desc')

  // Hooks
  const { range } = useDateRangeStore()
  const { filters, setFilter, resetFilters } = useOrdersFilterStore()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))



  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)

      // Используем локальный API вместо прямого обращения к внешнему
      const response = await fetch('/api/orders')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Обрабатываем данные от локального API
      if (data.success && data.data && Array.isArray(data.data.orders)) {
        // Преобразуем данные в нужный формат
        const transformedOrders = data.data.orders.map((order: any) => ({
          id: order.id?.toString() || Math.random().toString(),
          externalId: order.id?.toString() || order.order_id || 'N/A',
          customerName: order.user?.name || order.customer_name || 'Не указан',
          customerEmail: order.user?.email || order.customer_email || null,
          customerPhone: order.user?.phone || order.customer_phone || null,
          status: mapOrderStatus(order.status),
          total: order.total?.toString() || order.amount?.toString() || '0',
          currency: order.currency || 'RUB',
          orderDate: order.created_at || order.order_date || new Date().toISOString(),
          createdAt: order.created_at || new Date().toISOString(),
          updatedAt: order.updated_at || new Date().toISOString(),
          items: order.items?.map((item: any, index: number) => ({
            id: item.id?.toString() || index.toString(),
            orderId: order.id?.toString() || Math.random().toString(),
            productId: item.product_id?.toString() || null,
            name: item.name || item.product_name || `Товар ${index + 1}`,
            quantity: item.quantity || 1,
            price: item.price?.toString() || '0',
            total: item.total?.toString() || (item.price * item.quantity)?.toString() || '0',
            createdAt: order.created_at || new Date().toISOString(),
            updatedAt: order.updated_at || new Date().toISOString()
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
    } finally {
      setLoading(false)
    }
  }, [])

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

  // Sync orders (refresh data from external API)
  const handleSyncOrders = useCallback(async () => {
    try {
      setSyncing(true)
      await fetchOrders()
      setSnackbar({
        open: true,
        message: 'Данные обновлены',
        severity: 'success'
      })
    } catch (err) {
      console.error('Error syncing orders:', err)
      setSnackbar({
        open: true,
        message: 'Ошибка обновления данных',
        severity: 'error'
      })
    } finally {
      setSyncing(false)
    }
  }, [fetchOrders])

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const statusMatch = filters.status === 'all' || order.status === filters.status
      const customerMatch = !filters.customer ||
        (order.customerName && order.customerName.toLowerCase().includes(filters.customer.toLowerCase()))

      return statusMatch && customerMatch
    })
  }, [orders, filters])

  // Sort orders
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      let aValue: any = a[orderBy]
      let bValue: any = b[orderBy]

      if (orderBy === 'orderDate' || orderBy === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (orderBy === 'total') {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (orderDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [filteredOrders, orderBy, orderDirection])

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = page * rowsPerPage
    return sortedOrders.slice(startIndex, startIndex + rowsPerPage)
  }, [sortedOrders, page, rowsPerPage])

  // Format currency
  const formatCurrency = useCallback((amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }, [])

  // Get status chip props
  const getStatusChipProps = useCallback((status: string, isMobileStyle = false) => {
    const baseStyles = isMobileStyle ? {
      bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.1)',
      borderColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.5)',
      color: 'rgba(var(--mui-palette-primary-mainChannel) / 0.8)',
      '& .MuiChip-label': {
        fontWeight: 500
      }
    } : {}

    switch (status) {
      case 'shipped':
        return {
          label: 'Отправлен',
          color: 'success' as const,
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: isMobileStyle ? baseStyles : undefined
        }
      case 'cancelled':
        return {
          label: 'Отменен',
          color: 'error' as const,
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: isMobileStyle ? baseStyles : undefined
        }
      case 'overdue':
        return {
          label: 'Просрочен',
          color: 'warning' as const,
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: isMobileStyle ? baseStyles : {
            color: theme.palette.warning.main,
            borderColor: theme.palette.warning.main,
            bgcolor: theme.palette.warning.main,
            '& .MuiChip-label': { color: '#fff' }
          }
        }
      case 'processing':
        return {
          label: 'Обрабатывается',
          color: 'info' as const,
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: isMobileStyle ? baseStyles : undefined
        }
      case 'unpaid':
        return {
          label: 'Не оплачен',
          color: 'default' as const,
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: isMobileStyle ? baseStyles : undefined
        }
      default:
        return {
          label: status,
          color: 'default' as const,
          variant: 'outlined' as const,
          size: 'small' as const,
          sx: isMobileStyle ? baseStyles : undefined
        }
    }
  }, [theme.palette.warning.main])

  // Handle products interactions
  const handleProductsClick = useCallback((event: React.MouseEvent<HTMLElement>, order: OrderData) => {
    event.stopPropagation()

    if (order.items.length <= 1) return

    if (isMobile) {
      setProductsDialog({ open: true, order })
    } else {
      setProductsPopover({
        anchorEl: event.currentTarget,
        order,
        isLazyLoaded: true
      })
    }
  }, [isMobile])

  const handleProductsKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>, order: OrderData) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()

      if (order.items.length <= 1) return

      if (isMobile) {
        setProductsDialog({ open: true, order })
      } else {
        setProductsPopover({
          anchorEl: event.currentTarget,
          order,
          isLazyLoaded: true
        })
      }
    }
  }, [isMobile])

  const handleProductsClose = useCallback(() => {
    setProductsPopover({ anchorEl: null, order: null, isLazyLoaded: false })
  }, [])

  const handleProductsDialogClose = useCallback(() => {
    setProductsDialog({ open: false, order: null })
  }, [])

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleProductsClose()
      handleProductsDialogClose()
    }
  }, [handleProductsClose, handleProductsDialogClose])

  // Add escape key listener
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [handleEscapeKey])

  // Handle order details
  const handleViewOrder = useCallback((order: OrderData) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
    setSelectedOrder(null)
  }, [])

  // Mobile handlers
  const handleOrderCardClick = useCallback(async (order: OrderData) => {
    setOrderDetailsLoading(true)
    setSelectedOrderDetails(null)
    setExpandedProducts(false)
    setOrderDetailsDrawer(true)

    // Имитация загрузки деталей заказа
    await new Promise(resolve => setTimeout(resolve, 800))

    setSelectedOrderDetails(order)
    setOrderDetailsLoading(false)
  }, [])

  const handleFiltersChipClick = useCallback(() => {
    setFiltersBottomSheet(true)
  }, [])

  const handlePullToRefresh = useCallback(async () => {
    if (pullToRefreshTriggered) return

    setPullToRefreshTriggered(true)
    try {
      await handleSyncOrders()
      setSnackbar({
        open: true,
        message: `Обновлено ${orders.length} заказов`,
        severity: 'success'
      })
    } finally {
      setPullToRefreshTriggered(false)
    }
  }, [pullToRefreshTriggered, handleSyncOrders, orders.length])

  // Handle sorting
  const handleRequestSort = useCallback((property: keyof OrderData) => {
    const isAsc = orderBy === property && orderDirection === 'asc'
    setOrderDirection(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }, [orderBy, orderDirection])

  // Handle pagination
  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  // Render products cell component
  const renderProductsCell = useCallback((order: OrderData) => {
    const hasMultipleItems = order.items.length > 1
    const firstItem = order.items[0]?.name || 'Товары'

    if (!hasMultipleItems) {
      // Single item - show full name without interactions
      return (
        <Typography
          variant="body2"
          className="line-clamp-1"
          sx={{ flex: 1, opacity: 0.8 }}
        >
          {firstItem}
        </Typography>
      )
    }

    // Multiple items - interactive cell with badge
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%',
          cursor: 'pointer',
          '&:hover': {
            color: 'primary.main',
            '& .products-badge': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
            borderRadius: 1
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-label={`Показать ${order.items.length} товаров в заказе`}
        onClick={(e) => handleProductsClick(e, order)}
        onKeyDown={(e) => handleProductsKeyDown(e, order)}
      >
        <Typography
          variant="body2"
          className="line-clamp-1"
          sx={{ flex: 1, opacity: 0.8 }}
        >
          {firstItem}
        </Typography>
        <Box
          className="products-badge"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 24,
            height: 20,
            px: 0.75,
            borderRadius: 2,
            bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.3)',
            color: 'primary.main',
            fontSize: '0.75rem',
            fontWeight: 500,
            flexShrink: 0,
            transition: theme.transitions.create(['background-color', 'color'], {
              duration: theme.transitions.duration.short
            })
          }}
        >
          +{order.items.length - 1}
        </Box>
      </Box>
    )
  }, [handleProductsClick, handleProductsKeyDown, theme.transitions])

  // Render products list component
  const renderProductsList = useCallback((order: OrderData) => {
    const itemsToShow = order.items.slice(0, 3)
    const hasMoreItems = order.items.length > 3

    return (
      <Box>
        <List
          dense
          sx={{
            py: 0,
            maxHeight: hasMoreItems ? 260 : 'auto',
            overflowY: hasMoreItems ? 'auto' : 'visible'
          }}
        >
          {order.items.map((item) => (
            <ListItem key={item.id} disableGutters sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={500}>
                    {item.name}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {item.quantity} шт. × {formatCurrency(item.price)} = {formatCurrency(item.total)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    )
  }, [])

  // Effects
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Lock body scroll when bottom sheet is open
  useEffect(() => {
    if (filtersBottomSheet) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [filtersBottomSheet])

  // Reset filters
  const handleResetFilters = useCallback(() => {
    resetFilters()
    setPage(0)
  }, [resetFilters])



  // Get status text
  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'shipped':
        return 'Отправлен'
      case 'cancelled':
        return 'Отменен'
      case 'overdue':
        return 'Просрочен'
      case 'processing':
        return 'Обрабатывается'
      case 'unpaid':
        return 'Не оплачен'
      default:
        return status
    }
  }, [])

  // Get status color styles for cards and filters
  const getStatusStyles = useCallback((status: string, type: 'card' | 'menu' = 'card') => {
    const styles = {
      all: {
        card: 'bg-gray-100/10 border-gray-400/30 text-gray-200',
        menu: 'text-gray-200'
      },
      shipped: {
        card: 'bg-success/15 border-success/50 text-success',
        menu: 'bg-success/20 text-success border-success/50'
      },
      cancelled: {
        card: 'bg-error/15 border-error/50 text-error',
        menu: 'bg-error/20 text-error border-error/50'
      },
      overdue: {
        card: 'bg-warning/15 border-warning/50 text-warning',
        menu: 'bg-warning/20 text-warning border-warning/50'
      },
      processing: {
        card: 'bg-info/15 border-info/50 text-info',
        menu: 'bg-info/20 text-info border-info/50'
      },
      unpaid: {
        card: 'bg-yellow-400/15 border-yellow-400/50 text-yellow-400',
        menu: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/50'
      }
    }

    return styles[status as keyof typeof styles]?.[type] || styles.all[type]
  }, [])

  // Get status badge component for order details
  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      shipped: {
        label: 'Отправлен',
        className: 'bg-success/15 border-success/50 text-success'
      },
      cancelled: {
        label: 'Отменен',
        className: 'bg-error/15 border-error/50 text-error'
      },
      overdue: {
        label: 'Просрочен',
        className: 'bg-warning/15 border-warning/50 text-warning'
      },
      processing: {
        label: 'Обрабатывается',
        className: 'bg-info/15 border-info/50 text-info'
      },
      unpaid: {
        label: 'Не оплачен',
        className: 'bg-yellow-400/15 border-yellow-400/50 text-yellow-400'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100/10 border-gray-400/30 text-gray-200'
    }

    return (
      <Box
        component="span"
        className={`${config.className} text-xs px-3 py-0.5 rounded-full border`}
        sx={{ fontWeight: 500 }}
      >
        {config.label}
      </Box>
    )
  }, [])

  // Render mobile cards
  const renderMobileCards = () => (
    <Box className="lg:hidden" sx={{ mt: 2 }}>
      {/* Pull to refresh container */}
      <Box
        sx={{
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 200px)',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(156, 163, 175, 0.7)',
            borderRadius: 3,
          }
        }}
        className="scrollbar-none"
      >
        {paginatedOrders.length === 0 ? (
          <Paper
            className="bg-level-2 rounded-2xl shadow-md/10 p-4 mb-5"
            sx={{
              textAlign: 'center'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '2rem', mb: 1 }}>📭</Typography>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                Нет заказов
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Нет заказов по выбранным параметрам
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Box>
            {paginatedOrders.map((order) => (
            <Paper
              key={order.id}
              className="bg-level-2 rounded-2xl shadow-md/10 p-4 mb-5 hover:bg-level-3/30 active:bg-level-3/60 transition-colors duration-100"
              sx={{
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => handleOrderCardClick(order)}
            >
              <Box>
                {/* Header: ID with new indicator and Date */}
                <Box sx={{ mb: 1 }}>
                  <Box className="flex items-center">
                    {order.status === 'new' && (
                      <Box className="w-2 h-2 bg-primary mr-2 rounded-full" />
                    )}
                    <Typography className="text-sm font-medium text-white/90">
                      #{order.externalId}
                    </Typography>
                  </Box>
                  <Typography className="text-xs text-gray-400">
                    {new Date(order.orderDate).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Typography>
                </Box>

                {/* Customer name */}
                <Typography className="text-base font-semibold text-white mt-1" sx={{ mb: 1 }}>
                  {order.customerName || 'Не указан'}
                </Typography>

                {/* Products */}
                <Typography className="text-sm text-gray-300" sx={{ mb: 2 }}>
                  {(() => {
                    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0)

                    // Если только 1 товар по 1 штуке - показываем название
                    if (totalQty === 1 && order.items.length === 1) {
                      const itemName = order.items[0].name

                      // Проверяем помещается ли название в одну строку
                      if (itemName.length <= 30) {
                        return itemName
                      }
                    }

                    // Иначе показываем количество
                    return `${totalQty} ${declOfNum(totalQty, ['товар', 'товара', 'товаров'])}`
                  })()}
                </Typography>

                {/* Bottom row: Status, Amount, Eye icon */}
                <Box className="flex justify-between items-center">
                  <Chip
                    label={getStatusText(order.status)}
                    size="small"
                    className={`${getStatusStyles(order.status, 'card')} text-xs font-medium px-3 py-0.5 rounded-full hover:scale-105 transition-all duration-150 ease-out`}
                    sx={{
                      border: '1px solid',
                      '& .MuiChip-label': {
                        px: 1.5,
                        py: 0.5,
                        fontWeight: 500
                      }
                    }}
                  />
                  <Box className="flex items-center">
                    <Typography className="text-lg font-semibold text-white tabular-nums">
                      {formatCurrency(order.total)}
                    </Typography>
                    <IconButton
                      size="small"
                      color="secondary"
                      className="opacity-60 hover:opacity-80 ml-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOrderCardClick(order)
                      }}
                    >
                      <i className="bx-show text-base" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Paper>
            ))}
          </Box>
        )}

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={sortedOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          sx={{ mt: 2 }}
        />
      </Box>
    </Box>
  )

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

      {/* Simplified Filter Bar */}
      <Box
        className="bg-level-2 shadow-sm/10 rounded-md p-3 mb-4"
        sx={{
          position: 'sticky',
          top: 64,
          zIndex: 9,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box className="flex items-center gap-3">
          {/* Desktop Filters - visible on xl+ screens */}
          <Box className="hidden xl:flex items-center gap-3 flex-1">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={filters.status}
                displayEmpty
                onChange={(e) => setFilter('status', e.target.value)}
                sx={{
                  height: 36,
                  '& .MuiOutlinedInput-input': {
                    px: 3,
                    py: 1
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
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
                    return <Typography className="text-gray-400 text-sm">Все статусы</Typography>
                  }
                  return getStatusText(selected)
                }}
              >
                <MenuItem value="all">Все статусы</MenuItem>
                <MenuItem value="shipped">Отправлен</MenuItem>
                <MenuItem value="cancelled">Отменен</MenuItem>
                <MenuItem value="overdue">Просрочен</MenuItem>
                <MenuItem value="processing">Обрабатывается</MenuItem>
                <MenuItem value="unpaid">Не оплачен</MenuItem>
              </Select>
            </FormControl>

            <CustomTextField
              size="small"
              placeholder="Поиск клиента..."
              value={filters.customer}
              onChange={(e) => setFilter('customer', e.target.value)}
              sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  height: 36,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
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
                  px: 3,
                  py: 1
                }
              }}
              InputProps={{
                startAdornment: <i className="bx-search text-lg text-gray-400 mr-2" />
              }}
            />
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
              onClick={handleFiltersChipClick}
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

        {/* Reset filters button */}
        {(filters.status !== 'all' || filters.customer !== '') && (
          <Box className="hidden xl:block mt-3">
            <Button
              size="small"
              onClick={handleResetFilters}
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
          </Box>
        )}
             </Box>

      {/* Main Content Card */}
      <Card>
        {/* Data Table/Cards */}
        {loading ? (
          <Box className="lg:hidden" sx={{ mt: 2 }}>
            {/* Mobile Skeleton Cards */}
            <Box>
              {Array.from({ length: 3 }).map((_, index) => (
                <Paper
                  key={index}
                  className="bg-level-2 rounded-2xl shadow-md/10 p-4 mb-5 animate-pulse"
                >
                  <Box sx={{ mb: 1 }}>
                    <Skeleton variant="text" width="30%" height={20} />
                    <Skeleton variant="text" width="20%" height={16} />
                  </Box>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
                  <Box className="flex justify-between items-center">
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Box className="flex items-center">
                      <Skeleton variant="text" width={80} height={28} />
                      <Skeleton variant="circular" width={32} height={32} sx={{ ml: 1 }} />
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        ) : filteredOrders.length === 0 ? (
                    <Box
                      sx={{
              py: 6,
              textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
              gap: 2
                      }}
                    >
            <i className="bx-box" style={{ fontSize: '4rem', color: theme.palette.text.disabled }} />
            <Typography variant="h6" color="text.secondary">
              Заказы не найдены
                      </Typography>
            <Button variant="outlined" onClick={handleResetFilters}>
              Сбросить фильтры
                      </Button>
                    </Box>
        ) : (
          <>
            {/* Mobile Cards */}
            {isMobile && renderMobileCards()}

            {/* Desktop Table */}
            <Box className="hidden lg:block">
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
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-head': { borderBottom: `1px solid ${theme.palette.divider}` } }}>
                      <TableCell width={90} align="right" sx={{ px: 2 }}>
                        <TableSortLabel
                          active={orderBy === 'externalId'}
                          direction={orderBy === 'externalId' ? orderDirection : 'asc'}
                          onClick={() => handleRequestSort('externalId')}
                          sx={{ fontWeight: 600 }}
                        >
                          №
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ px: 2 }}>
                        <TableSortLabel
                          active={orderBy === 'customerName'}
                          direction={orderBy === 'customerName' ? orderDirection : 'asc'}
                          onClick={() => handleRequestSort('customerName')}
                          sx={{ fontWeight: 600 }}
                        >
                          Клиент
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ px: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Товары
                      </Typography>
                    </TableCell>
                      <TableCell width={120} sx={{ px: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          Статус
                      </Typography>
                    </TableCell>
                      <TableCell width={120} align="right" sx={{ px: 2 }}>
                        <TableSortLabel
                          active={orderBy === 'total'}
                          direction={orderBy === 'total' ? orderDirection : 'asc'}
                          onClick={() => handleRequestSort('total')}
                          sx={{ fontWeight: 600 }}
                        >
                          Сумма
                        </TableSortLabel>
                      </TableCell>
                      <TableCell width={120} sx={{ px: 2 }}>
                        <TableSortLabel
                          active={orderBy === 'orderDate'}
                          direction={orderBy === 'orderDate' ? orderDirection : 'asc'}
                          onClick={() => handleRequestSort('orderDate')}
                          sx={{ fontWeight: 600 }}
                        >
                          Дата
                        </TableSortLabel>
                      </TableCell>
                      <TableCell width={60} align="center" sx={{ px: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          ⚙️
                      </Typography>
                    </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        hover
                        sx={{
                          cursor: 'pointer',
                          '& .MuiTableCell-root': {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            py: 1.5,
                            px: 2
                          },
                          '&:hover': {
                            bgcolor: theme.palette.action.hover
                          }
                        }}
                        onClick={() => handleViewOrder(order)}
                      >
                        {/* Order Number */}
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              fontVariantNumeric: 'tabular-nums'
                            }}
                          >
                            #{order.externalId}
                      </Typography>
                    </TableCell>

                        {/* Customer */}
                    <TableCell>
                          <Typography variant="body2" className="line-clamp-1">
                            {order.customerName || 'Не указан'}
                      </Typography>
                          {order.customerEmail && (
                            <Typography variant="caption" color="text.secondary" className="line-clamp-1">
                              {order.customerEmail}
                      </Typography>
                          )}
                    </TableCell>

                        {/* Products */}
                    <TableCell>
                          {renderProductsCell(order)}
                    </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Chip {...getStatusChipProps(order.status)} />
                        </TableCell>

                        {/* Total */}
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              fontVariantNumeric: 'tabular-nums'
                            }}
                          >
                            {formatCurrency(order.total)}
                      </Typography>
                    </TableCell>

                        {/* Date */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {new Date(order.orderDate).toLocaleDateString('ru-RU')}
                      </Typography>
                    </TableCell>

                        {/* Actions */}
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewOrder(order)
                            }}
                            sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                          >
                            <i className="bx-show text-base" />
                          </IconButton>
                        </TableCell>
                  </TableRow>
                    ))}
            </TableBody>
          </Table>
        </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={sortedOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Строк на странице:"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
                sx={{ mt: 2 }}
              />
            </Box>
          </>
        )}
    </Card>

      {/* Mobile Filters Bottom Sheet */}
      <SwipeableDrawer
        anchor="bottom"
        open={filtersBottomSheet}
        onClose={() => setFiltersBottomSheet(false)}
        onOpen={() => setFiltersBottomSheet(true)}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true,
          sx: {
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }
          }
        }}
        PaperProps={{
          className: "bg-level-2 rounded-t-2xl shadow-lg/10 transition-all duration-200 ease-out",
          sx: {
            height: '40vh',
            backgroundImage: 'none'
          }
        }}
      >
        <Box>
          {/* Handle bar */}
          <Box className="w-10 h-1 bg-muted/20 rounded-full mx-auto mt-3" />

                    <Box className="pt-2 pb-4 px-4" sx={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Header with close button */}
            <Box className="flex items-center justify-between mt-1 mb-2">
              <Typography className="text-lg font-medium text-gray-200">
                Фильтры
              </Typography>
              <IconButton
                size="small"
                onClick={() => setFiltersBottomSheet(false)}
                className="opacity-70 hover:opacity-100"
                sx={{ p: 0 }}
              >
                <i className="bx-x text-xl" />
              </IconButton>
            </Box>

            {/* Swipe hint */}
            <Typography className="text-xs text-muted-foreground text-center mb-4">
              Свайп вниз, чтобы закрыть
            </Typography>

            <Stack spacing={4} className="space-y-4">
              <FormControl fullWidth>
                <Select
                  value={filters.status}
                  displayEmpty
                  onChange={(e) => setFilter('status', e.target.value)}
                  className="bg-level-3 border border-muted/20 rounded-md text-muted-foreground"
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      py: 2,
                      px: 3,
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }}
                  renderValue={(selected) => {
                    if (!selected || selected === 'all') {
                      return <Typography className="text-gray-400">Выберите статус</Typography>
                    }
                    const statusLabels: Record<string, string> = {
                      'shipped': 'Статус: Отправлен',
                      'cancelled': 'Статус: Отменен',
                      'overdue': 'Статус: Просрочен',
                      'processing': 'Статус: Обрабатывается',
                      'unpaid': 'Статус: Не оплачен'
                    }
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: selected === 'shipped' ? 'success.main' :
                                    selected === 'cancelled' ? 'error.main' :
                                    selected === 'overdue' ? 'warning.main' :
                                    selected === 'processing' ? 'info.main' :
                                    selected === 'unpaid' ? '#FACC15' : 'transparent'
                          }}
                        />
                        {statusLabels[selected] || selected}
                      </Box>
                    )
                  }}
                >
                  <MenuItem
                    value="all"
                    sx={{
                      minHeight: '40px',
                      color: 'text.secondary',
                      transition: 'all 150ms ease-out',
                      '&:hover': {
                        bgcolor: 'rgba(156, 163, 175, 0.1)'
                      },
                      '&.Mui-selected': {
                        bgcolor: 'action.selected',
                        fontWeight: 600
                      }
                    }}
                  >
                    Все статусы
                  </MenuItem>
                  <MenuItem
                    value="shipped"
                    sx={{
                      minHeight: '40px',
                      color: 'success.main',
                      transition: 'all 150ms ease-out',
                      '&:hover': {
                        bgcolor: 'success.main',
                        color: 'success.contrastText',
                        '& .mobile-status-indicator': {
                          bgcolor: 'success.contrastText'
                        }
                      },
                      '&.Mui-selected': {
                        bgcolor: 'success.main',
                        color: 'success.contrastText',
                        fontWeight: 600,
                        '& .mobile-status-indicator': {
                          bgcolor: 'success.contrastText'
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        className="mobile-status-indicator"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'success.main'
                        }}
                      />
                      Отправлен
                    </Box>
                  </MenuItem>
                  <MenuItem
                    value="cancelled"
                    sx={{
                      minHeight: '40px',
                      color: 'error.main',
                      transition: 'all 150ms ease-out',
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        '& .mobile-status-indicator': {
                          bgcolor: 'error.contrastText'
                        }
                      },
                      '&.Mui-selected': {
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        fontWeight: 600,
                        '& .mobile-status-indicator': {
                          bgcolor: 'error.contrastText'
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        className="mobile-status-indicator"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'error.main'
                        }}
                      />
                      Отменен
                    </Box>
                  </MenuItem>
                  <MenuItem
                    value="overdue"
                    sx={{
                      minHeight: '40px',
                      color: 'warning.main',
                      transition: 'all 150ms ease-out',
                      '&:hover': {
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText',
                        '& .mobile-status-indicator': {
                          bgcolor: 'warning.contrastText'
                        }
                      },
                      '&.Mui-selected': {
                        bgcolor: 'warning.main',
                        color: 'warning.contrastText',
                        fontWeight: 600,
                        '& .mobile-status-indicator': {
                          bgcolor: 'warning.contrastText'
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        className="mobile-status-indicator"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'warning.main'
                        }}
                      />
                      Просрочен
                    </Box>
                  </MenuItem>
                  <MenuItem
                    value="processing"
                    sx={{
                      minHeight: '40px',
                      color: 'info.main',
                      transition: 'all 150ms ease-out',
                      '&:hover': {
                        bgcolor: 'info.main',
                        color: 'info.contrastText',
                        '& .mobile-status-indicator': {
                          bgcolor: 'info.contrastText'
                        }
                      },
                      '&.Mui-selected': {
                        bgcolor: 'info.main',
                        color: 'info.contrastText',
                        fontWeight: 600,
                        '& .mobile-status-indicator': {
                          bgcolor: 'info.contrastText'
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        className="mobile-status-indicator"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'info.main'
                        }}
                      />
                      Обрабатывается
                    </Box>
                  </MenuItem>
                  <MenuItem
                    value="unpaid"
                    sx={{
                      minHeight: '40px',
                      color: '#FACC15',
                      transition: 'all 150ms ease-out',
                      '&:hover': {
                        bgcolor: '#FACC15',
                        color: '#000',
                        '& .mobile-status-indicator': {
                          bgcolor: '#000'
                        }
                      },
                      '&.Mui-selected': {
                        bgcolor: '#FACC15',
                        color: '#000',
                        fontWeight: 600,
                        '& .mobile-status-indicator': {
                          bgcolor: '#000'
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        className="mobile-status-indicator"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#FACC15'
                        }}
                      />
                      Не оплачен
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                placeholder="Искать по ФИО клиента"
                value={filters.customer}
                onChange={(e) => setFilter('customer', e.target.value)}
                className="bg-level-3 border border-muted/20 rounded-md text-muted-foreground"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent'
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main'
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    py: 2,
                    px: 3
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgb(156 163 175)',
                    opacity: 1
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1.5, color: 'text.secondary', display: 'flex', opacity: 0.7 }}>
                      <i className="bx-search-alt text-xl" />
                    </Box>
                  )
                }}
              />

              {/* Reset button - показывается только если есть активные фильтры */}
              {(filters.status !== 'all' || filters.customer !== '') && (
                <Button
                  variant="text"
                  fullWidth
                  onClick={() => {
                    resetFilters()
                  }}
                  className="py-2 text-muted-foreground hover:text-primary transition-colors duration-150"
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  Сбросить фильтры
                </Button>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={() => setFiltersBottomSheet(false)}
                className="w-full min-h-[48px] rounded-full bg-primary text-white font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors duration-150"
                sx={{
                  mt: 4,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none'
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  },
                  '&:focus': {
                    outline: 'none'
                  }
                }}
              >
                Применить
              </Button>
            </Stack>
          </Box>
        </Box>
      </SwipeableDrawer>

      {/* Order Details Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={orderDetailsDrawer}
        onClose={() => setOrderDetailsDrawer(false)}
        onOpen={() => setOrderDetailsDrawer(true)}
        disableSwipeToOpen
        ModalProps={{
          keepMounted: true,
          sx: {
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }}
        PaperProps={{
          className: "bg-level-2 rounded-t-2xl shadow-lg/10",
          sx: {
            maxHeight: '70vh',
            overflow: 'auto',
            transition: 'all 200ms ease-out'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {/* Handle bar */}
          <Box className="w-10 h-1 bg-muted/20 rounded-full mx-auto mt-3" />

          {/* Close Button - Absolute positioned */}
          <IconButton
            size="small"
            onClick={() => setOrderDetailsDrawer(false)}
            aria-label="Закрыть"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              opacity: 0.7,
              '&:hover': { opacity: 1 }
            }}
          >
            <i className="bx-x text-xl" />
          </IconButton>

          <Box sx={{ px: 4, pt: 2, pb: 4 }}>
            {orderDetailsLoading ? (
              // Skeleton Loading State
              <Box>
                {/* Header Skeleton */}
                <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                <Box className="border-b border-muted/20 mb-4" />

                {/* Info Skeleton */}
                <Box sx={{ mb: 4 }}>
                  <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Box key={index} className="flex justify-between items-center border-b border-muted/20 py-2">
                      <Skeleton variant="text" width="25%" height={16} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </Box>
                  ))}
                </Box>

                {/* Product Skeleton */}
                <Box>
                  <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />
                  <Box className="bg-level-3 rounded-lg p-3 mb-2 shadow-xs/20">
                    <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={14} />
                  </Box>
                </Box>
              </Box>
            ) : selectedOrderDetails ? (
              // Content
              <Box>
                {/* Header */}
                <Typography className="text-lg font-semibold text-white" sx={{ mb: 2 }}>
                  Заказ #{selectedOrderDetails.externalId}
                </Typography>
                <Box className="border-b border-muted/20 mb-4" />

                {/* Order Information */}
                <Box sx={{ mb: 4 }}>
                  <Typography className="text-base font-semibold text-white" sx={{ mb: 2 }}>
                    Информация о заказе
                  </Typography>

                  {/* Client */}
                  <Box className="flex justify-between items-center border-b border-muted/20 py-2">
                    <Typography className="text-sm text-gray-400">Клиент:</Typography>
                    <Typography className="text-base font-medium text-white">
                      {selectedOrderDetails.customerName || 'Не указан'}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box className="flex justify-between items-center border-b border-muted/20 py-2">
                    <Typography className="text-sm text-gray-400">Статус:</Typography>
                    {getStatusBadge(selectedOrderDetails.status)}
                  </Box>

                  {/* Date */}
                  <Box className="flex justify-between items-center border-b border-muted/20 py-2">
                    <Typography className="text-sm text-gray-400">Дата:</Typography>
                    <Typography className="text-base font-medium text-white">
                      {new Date(selectedOrderDetails.orderDate).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>

                  {/* Amount */}
                  <Box className="flex justify-between items-center py-2">
                    <Typography className="text-sm text-gray-400">Сумма:</Typography>
                    <Typography className="text-base font-medium text-white tabular-nums">
                      {formatCurrency(selectedOrderDetails.total)}
                    </Typography>
                  </Box>
                </Box>

                {/* Products */}
                <Box sx={{ mb: 4 }}>
                  <Typography className="text-base font-semibold text-white" sx={{ mb: 2 }}>
                    Товары ({selectedOrderDetails.items.length})
                  </Typography>

                  {selectedOrderDetails.items.length === 1 ? (
                    // Single product
                    <Box className="bg-level-3 rounded-lg p-3 mb-2 shadow-xs/20">
                      <Typography className="text-sm text-white" sx={{ mb: 1 }}>
                        {selectedOrderDetails.items[0].name}
                      </Typography>
                      <Typography className="text-sm text-gray-400">
                        {selectedOrderDetails.items[0].quantity} шт. × {formatCurrency(selectedOrderDetails.items[0].price)} = {formatCurrency(selectedOrderDetails.items[0].total)}
                      </Typography>
                    </Box>
                  ) : (
                    // Multiple products
                    <Box>
                      <Box className="bg-level-3 rounded-lg p-3 mb-2 shadow-xs/20">
                        <Typography className="text-sm text-white" sx={{ mb: 1 }}>
                          {selectedOrderDetails.items[0].name}
                        </Typography>
                        <Box className="flex justify-between items-center">
                          <Typography className="text-sm text-primary/60">
                            и ещё {selectedOrderDetails.items.length - 1} {declOfNum(selectedOrderDetails.items.length - 1, ['товар', 'товара', 'товаров'])}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => setExpandedProducts(!expandedProducts)}
                            className="text-xs text-primary hover:text-primary/80"
                            sx={{
                              minWidth: 'auto',
                              p: 0.5,
                              textTransform: 'none',
                              fontWeight: 500
                            }}
                          >
                            {expandedProducts ? 'Свернуть' : 'Развернуть'}
                          </Button>
                        </Box>
                      </Box>

                      {/* Expanded products list */}
                      {expandedProducts && (
                        <Box>
                          {selectedOrderDetails.items.slice(1).map((item) => (
                            <Box key={item.id} className="bg-level-3 rounded-lg p-3 mb-2 shadow-xs/20">
                              <Typography className="text-sm text-white" sx={{ mb: 1 }}>
                                {item.name}
                              </Typography>
                              <Typography className="text-sm text-gray-400">
                                {item.quantity} шт. × {formatCurrency(item.price)} = {formatCurrency(item.total)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                <Box>
                  <Button
                    variant="contained"
                    fullWidth
                    className="w-full py-3 bg-primary rounded-full text-white font-medium mb-2 active:scale-95 transition-all duration-100"
                    sx={{
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: 'none',
                        bgcolor: 'primary.dark'
                      },
                      '&:focus': {
                        outline: 'none'
                      }
                    }}
                  >
                    Редактировать заказ
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setOrderDetailsDrawer(false)}
                    className="w-full py-3 bg-muted/20 rounded-full text-white mb-4 active:scale-95 transition-all duration-100"
                    sx={{
                      textTransform: 'none',
                      fontSize: '1rem',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      },
                      '&:focus': {
                        outline: 'none'
                      }
                    }}
                  >
                    Закрыть
                  </Button>
                </Box>
              </Box>
            ) : null}
          </Box>
        </Box>
      </SwipeableDrawer>

      {/* Products Popover */}
      <Popover
        open={Boolean(productsPopover.anchorEl)}
        anchorEl={productsPopover.anchorEl}
        onClose={handleProductsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          sx: {
            maxWidth: 400,
            maxHeight: 300,
            overflow: 'auto'
          }
        }}
      >
        {productsPopover.order && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Товары в заказе #{productsPopover.order.externalId}
            </Typography>
            {renderProductsList(productsPopover.order)}
          </Box>
        )}
      </Popover>

      {/* Products Dialog */}
      <Dialog
        open={productsDialog.open}
        onClose={handleProductsDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          Товары в заказе #{productsDialog.order?.externalId}
        </DialogTitle>
        <DialogContent>
          {productsDialog.order && renderProductsList(productsDialog.order)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProductsDialogClose}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Drawer (Desktop) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 480 },
            maxWidth: '100vw'
          }
        }}
      >
        {selectedOrder && (
          <Box sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                Заказ #{selectedOrder.externalId}
              </Typography>
              <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                <i className="bx-x" />
              </IconButton>
            </Box>

            <Stack spacing={3}>
              {/* Customer Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Информация о клиенте
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedOrder.customerName || 'Не указан'}
                </Typography>
                {selectedOrder.customerEmail && (
                  <Typography variant="body2" color="text.secondary">
                    📧 {selectedOrder.customerEmail}
                  </Typography>
                )}
                {selectedOrder.customerPhone && (
                  <Typography variant="body2" color="text.secondary">
                    📞 {selectedOrder.customerPhone}
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Order Details */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Детали заказа
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Номер заказа:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      #{selectedOrder.externalId}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Статус:</Typography>
                    <Chip {...getStatusChipProps(selectedOrder.status)} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Дата заказа:</Typography>
                    <Typography variant="body2">
                      {new Date(selectedOrder.orderDate).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Общая сумма:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(selectedOrder.total)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Divider />

              {/* Products List */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Список товаров ({selectedOrder.items.length})
                </Typography>
                {renderProductsList(selectedOrder)}
              </Box>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default OrdersTable
