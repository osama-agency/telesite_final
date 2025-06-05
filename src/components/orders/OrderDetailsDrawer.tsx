'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Badge from '@mui/material/Badge'

// Type Imports
interface OrderItem {
  id: string
  name: string
  quantity: number
  price: string
  total: string
}

interface Order {
  id: string
  externalId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: string
  total: string
  currency: string
  orderDate: string
  items: OrderItem[]
  shippingAddress?: string
  comment?: string
}

interface OrderDetailsDrawerProps {
  open: boolean
  onClose: () => void
  onOpen: () => void
  orderId: string | null
}

// Status badge helper
const getStatusBadge = (status: string) => {
  const statusConfig = {
    shipped: { label: 'Отправлен', color: 'bg-success/15 border-success/50 text-success' },
    cancelled: { label: 'Отменен', color: 'bg-error/15 border-error/50 text-error' },
    overdue: { label: 'Просрочен', color: 'bg-warning/15 border-warning/50 text-warning' },
    processing: { label: 'Обрабатывается', color: 'bg-info/15 border-info/50 text-info' },
    unpaid: { label: 'Не оплачен', color: 'bg-yellow-400/15 border-yellow-400/50 text-yellow-400' },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  )
}

const OrderDetailsDrawer = ({ open, onClose, onOpen, orderId }: OrderDetailsDrawerProps) => {
  const [orderDetails, setOrderDetails] = useState<Order | null>(null)
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState(false)

  // Mock data - replace with actual API call
  const mockOrderDetails: Order = {
    id: orderId || '1',
    externalId: '1192',
    customerName: 'Островский Данил Игоревич',
    customerEmail: 'danil@example.com',
    customerPhone: '+7 921 123 45 67',
    status: 'shipped',
    total: '6000',
    currency: 'RUB',
    orderDate: '2025-06-05',
    shippingAddress: 'г. Москва, ул. Ленина, д. 10, кв. 25',
    comment: 'Просьба доставить после 18:00. Домофон не работает, звонить по указанному телефону.',
    items: [
      {
        id: '1',
        name: 'Atomineх 25 mg',
        quantity: 1,
        price: '6000',
        total: '6000'
      },
      {
        id: '2',
        name: 'Витамин D3 2000 IU',
        quantity: 2,
        price: '850',
        total: '1700'
      }
    ]
  }

  // Simulate loading when opening
  useEffect(() => {
    if (open && orderId) {
      setOrderDetailsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setOrderDetails(mockOrderDetails)
        setOrderDetailsLoading(false)
      }, 800)
    }
  }, [open, orderId])

  const handleEdit = () => {
    // Implement edit functionality
    console.log('Edit order:', orderId)
  }

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          maxHeight: '70vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: 'visible'
        },
        className: 'bg-level-2 shadow-lg'
      }}
    >
      <Box className="overflow-auto">
        {/* Swipe Handle */}
        <Box className="w-10 h-1 bg-muted/20 rounded-full mx-auto mt-3 mb-2" />

        {/* Header */}
        <Box className="flex justify-between items-center px-4 pb-4 border-b border-muted/20 mb-4">
          {orderDetailsLoading ? (
            <Skeleton variant="text" width={120} height={28} className="bg-muted/20" />
          ) : (
            <Typography variant="h6" className="text-lg font-semibold text-white">
              Заказ #{orderDetails?.externalId}
            </Typography>
          )}
          <IconButton
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-muted/10"
            aria-label="Закрыть"
          >
            <i className="bx-x text-xl" />
          </IconButton>
        </Box>

        <Box className="px-4 pb-6">
          {orderDetailsLoading ? (
            <>
              {/* Skeleton for order info */}
              <Box className="space-y-4 mb-6">
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} variant="text" height={24} className="bg-muted/20" />
                ))}
              </Box>

              {/* Skeleton for products */}
              <Box className="mb-6">
                <Skeleton variant="text" width={100} height={24} className="bg-muted/20 mb-3" />
                <Box className="bg-level-3 rounded-lg p-3 shadow-xs">
                  <Skeleton variant="text" height={20} className="bg-muted/20 mb-2" />
                  <Skeleton variant="text" width="60%" height={16} className="bg-muted/20" />
                </Box>
              </Box>
            </>
          ) : orderDetails ? (
            <>
              {/* Order Info */}
              <Box className="space-y-4 mb-6">
                <Box className="flex justify-between items-center border-b border-muted/20 py-2">
                  <Typography className="text-sm text-gray-400">Статус</Typography>
                  {getStatusBadge(orderDetails.status)}
                </Box>

                <Box className="flex justify-between items-center border-b border-muted/20 py-2">
                  <Typography className="text-sm text-gray-400">Сумма</Typography>
                  <Typography className="text-base font-medium text-white">
                    {parseInt(orderDetails.total).toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>

                <Box className="flex justify-between items-center border-b border-muted/20 py-2">
                  <Typography className="text-sm text-gray-400">Дата заказа</Typography>
                  <Typography className="text-base font-medium text-white">
                    {new Date(orderDetails.orderDate).toLocaleDateString('ru-RU')}
                  </Typography>
                </Box>

                <Box className="flex justify-between items-center border-b border-muted/20 py-2">
                  <Typography className="text-sm text-gray-400">ID заказа</Typography>
                  <Typography className="text-base font-medium text-white">
                    #{orderDetails.externalId}
                  </Typography>
                </Box>
              </Box>

              {/* Customer Info */}
              <Box className="mb-6">
                <Typography className="text-base font-semibold text-white mb-3">Клиент</Typography>
                <Box className="space-y-2">
                  <Typography className="text-sm text-white/90">{orderDetails.customerName}</Typography>
                  <Typography className="text-sm text-gray-300">{orderDetails.customerEmail}</Typography>
                  <Typography className="text-sm text-gray-300">{orderDetails.customerPhone}</Typography>
                  {orderDetails.shippingAddress && (
                    <Typography className="text-sm text-gray-300">{orderDetails.shippingAddress}</Typography>
                  )}
                </Box>
              </Box>

              <Divider className="border-muted/20 mb-6" />

              {/* Products */}
              <Box className="mb-6">
                <Typography className="text-base font-semibold text-white mb-3">
                  Товары ({orderDetails.items.length})
                </Typography>
                <Box className="space-y-2">
                  {/* Show first product always */}
                  {orderDetails.items.slice(0, 1).map((item) => (
                    <Box key={item.id} className="bg-level-3 rounded-lg p-3 shadow-xs">
                      <Typography className="text-sm font-medium text-white mb-1">
                        {item.name}
                      </Typography>
                      <Typography className="text-xs text-gray-300">
                        {item.quantity} × {parseInt(item.price).toLocaleString('ru-RU')} ₽ = {parseInt(item.total).toLocaleString('ru-RU')} ₽
                      </Typography>
                    </Box>
                  ))}

                  {/* Show more products if expanded */}
                  {expandedProducts && orderDetails.items.slice(1).map((item) => (
                    <Box key={item.id} className="bg-level-3 rounded-lg p-3 shadow-xs">
                      <Typography className="text-sm font-medium text-white mb-1">
                        {item.name}
                      </Typography>
                      <Typography className="text-xs text-gray-300">
                        {item.quantity} × {parseInt(item.price).toLocaleString('ru-RU')} ₽ = {parseInt(item.total).toLocaleString('ru-RU')} ₽
                      </Typography>
                    </Box>
                  ))}

                  {/* Show more button if there are multiple products */}
                  {orderDetails.items.length > 1 && (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setExpandedProducts(!expandedProducts)}
                      className="text-primary hover:bg-primary/10 p-2 rounded-md text-xs"
                    >
                      {expandedProducts
                        ? 'Скрыть'
                        : `и ещё ${orderDetails.items.length - 1} товаров`
                      }
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Comment */}
              {orderDetails.comment && (
                <Box className="mb-6">
                  <Typography className="text-base font-semibold text-white mb-3">Комментарий</Typography>
                  <Box className="max-h-[100px] overflow-auto bg-level-3 rounded-lg p-3">
                    <Typography className="text-sm text-gray-300 leading-relaxed">
                      {orderDetails.comment}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Action Buttons */}
              <Box className="space-y-2">
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleEdit}
                  className="w-full py-3 bg-primary hover:bg-primary/90 rounded-full font-medium mb-2 active:scale-95 transition-all duration-100"
                  sx={{ textTransform: 'none', fontSize: '1rem' }}
                >
                  Редактировать
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={onClose}
                  className="w-full py-3 bg-muted/20 hover:bg-muted/30 border-muted/40 text-white rounded-full mb-4 active:scale-95 transition-all duration-100"
                  sx={{ textTransform: 'none', fontSize: '1rem' }}
                >
                  Закрыть
                </Button>
              </Box>
            </>
          ) : null}
        </Box>
      </Box>
    </SwipeableDrawer>
  )
}

export default OrderDetailsDrawer
