'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material'

// Types
interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  orderNumber?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  customerCity?: string
  bankCard?: string
  totalAmount?: number
  status?: string
  orderDate?: string
  paidAt?: string
  shippedAt?: string
  bonus?: number
  deliveryCost?: number
  items?: OrderItem[]
}

interface OrderDetailsDrawerProps {
  open: boolean
  onClose: () => void
  orderId?: string
}

// Улучшенные функции для статусов в стиле 2025
const getStatusConfig = (status: string) => {
  if (!status) return { color: '#888', bg: 'rgba(136, 136, 136, 0.1)', icon: '❓', label: 'Неизвестно' }

  switch (status.toLowerCase()) {
    case 'shipped':
      return { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', icon: '✈️', label: 'Отправлен' }
    case 'cancelled':
      return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', icon: '❌', label: 'Отменен' }
    case 'processing':
      return { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', icon: '⏳', label: 'В обработке' }
    case 'unpaid':
      return { color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', icon: '💳', label: 'Не оплачен' }
    default:
      return { color: '#888', bg: 'rgba(136, 136, 136, 0.1)', icon: '📋', label: status }
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(price)
}

// Современное форматирование дат (без "г." и "в")
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(' г.', '').replace(' в ', ', ')
}

const OrderDetailsDrawer = ({ open, onClose, orderId }: OrderDetailsDrawerProps) => {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Адаптивность: на мобильном снизу, на ПК справа
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    if (open && orderId) {
      setLoading(true)
      setError(null)

      fetch(`/api/orders/${orderId}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)

          return res.json()
        })
        .then(data => {
          const orderData = data.success ? data.data.order : data

          const transformedOrder = {
            ...orderData,
            orderNumber: orderData.externalId,
            totalAmount: parseFloat(orderData.total),
            bonus: parseFloat(orderData.bonus || 0),
            deliveryCost: parseFloat(orderData.deliveryCost || 0),
            items: orderData.items?.map((item: any) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: parseFloat(item.price)
            })) || []
          }

          setOrder(transformedOrder)
        })
        .catch(err => {
          console.error('Ошибка загрузки заказа:', err)
          setError('Ошибка загрузки данных заказа')
        })
        .finally(() => setLoading(false))
    }
  }, [open, orderId])

  if (!open) {
    return null
  }

  if (loading) {
    return (
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            ...(isMobile ? {
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16
            } : {
              width: { sm: 480, md: 560, lg: 640 },
              maxWidth: '40vw',
              height: 'auto',
              maxHeight: '90vh'
            })
          }
        }}
      >
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography color="text.secondary">Загрузка...</Typography>
        </Box>
      </Drawer>
    )
  }

  if (error || !order) {
    return (
      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            ...(isMobile ? {
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16
            } : {
              width: { sm: 480, md: 560, lg: 640 },
              maxWidth: '40vw',
              height: 'auto',
              maxHeight: '90vh'
            })
          }
        }}
      >
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography color="error">{error || 'Заказ не найден'}</Typography>
        </Box>
      </Drawer>
    )
  }

  const statusConfig = getStatusConfig(order.status || '')
  const itemsTotal = (order.totalAmount || 0) - (order.deliveryCost || 0)

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          ...(isMobile ? {
            width: '100%',
            height: 'auto',
            maxHeight: '90vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          } : {
            width: { sm: 480, md: 560, lg: 640 },
            maxWidth: '40vw',
            height: 'auto',
            maxHeight: '90vh'
          }),
          background: theme.palette.background.paper
        }
      }}
    >
      <Box sx={{
        height: 'auto',
        minHeight: 'fit-content',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',

        // Swipe handle для мобильного
        ...(isMobile && {
          pt: 4,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 40,
            height: 4,
            bgcolor: '#333',
            borderRadius: 2,
            zIndex: 1
          }
        })
      }}>
        {/* HEADER - Современный дизайн 2025 */}
        <Box sx={{
          p: isMobile ? 3 : 4,
          borderBottom: '1px solid',
          borderBottomColor: theme.palette.divider,
          background: theme.palette.background.paper
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                fontWeight={700}
                color="text.primary"
                mb={1}
              >
                Детали заказа
              </Typography>
              <Typography
                variant="h6"
                fontWeight={600}
                color="text.primary"
                mb={0.5}
              >
                Заказ #{order.orderNumber || order.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.orderDate ? formatDate(order.orderDate) : 'Дата не указана'}
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" gap={2}>
              {/* Статус справа */}
              <Chip
                icon={<span style={{ fontSize: 14 }}>{statusConfig.icon}</span>}
                label={statusConfig.label}
                size="medium"
                sx={{
                  bgcolor: statusConfig.bg,
                  color: statusConfig.color,
                  fontWeight: 600,
                  fontSize: '13px',
                  border: `1px solid ${statusConfig.color}40`,
                  '& .MuiChip-icon': {
                    color: statusConfig.color
                  }
                }}
              />

              <IconButton
                onClick={onClose}
                size="small"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? '#333' : '#f5f5f5',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? '#444' : '#e5e5e5'
                  }
                }}
              >
                ✕
              </IconButton>
            </Stack>
          </Stack>

          {/* Сумма заказа - крупно */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{
                color: statusConfig.color,
                lineHeight: 1
              }}
            >
              {formatPrice(order.totalAmount || 0)}
            </Typography>
          </Box>
        </Box>

        {/* BODY с секциями - максимально компактные отступы */}
        <Box sx={{
          pt: isMobile ? 3 : 4,
          px: isMobile ? 3 : 4,
          pb: isMobile ? 1 : 2, // Еще более компактный нижний отступ
          display: 'flex',
          flexDirection: 'column',
          gap: 4 // Уменьшили с 6 до 4
        }}>

          {/* Секция: ИНФОРМАЦИЯ О КЛИЕНТЕ */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '14px',
                color: '#888',
                borderBottom: '1px solid',
                borderBottomColor: theme.palette.divider,
                pb: 1,
                mb: 3
              }}
            >
              Информация о клиенте
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                  Имя
                </Typography>
                <Typography variant="body1" sx={{
                  color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                  fontWeight: 500,
                  textAlign: 'right',
                  maxWidth: '60%'
                }}>
                  {order.customerName || 'Не указано'}
                </Typography>
              </Stack>

              {order.customerEmail && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                    fontWeight: 500,
                    textAlign: 'right',
                    maxWidth: '60%'
                  }}>
                    {order.customerEmail}
                  </Typography>
                </Stack>
              )}

              {order.customerPhone && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                    Телефон
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                    fontWeight: 500,
                    textAlign: 'right',
                    maxWidth: '60%'
                  }}>
                    {order.customerPhone}
                  </Typography>
                </Stack>
              )}

              {(order.customerAddress || order.customerCity) && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                    Адрес
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                    fontWeight: 500,
                    textAlign: 'right',
                    maxWidth: '60%'
                  }}>
                    {order.customerAddress || order.customerCity}
                  </Typography>
                </Stack>
              )}

              {order.bankCard && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                    Банковская карта
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                    fontWeight: 500,
                    textAlign: 'right',
                    maxWidth: '60%'
                  }}>
                    {order.bankCard}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Секция: ТОВАРЫ */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '14px',
                color: '#888',
                borderBottom: '1px solid',
                borderBottomColor: theme.palette.divider,
                pb: 1,
                mb: 3
              }}
            >
              Товары ({(order.items || []).length})
            </Typography>

            <Stack spacing={3}>
              {(order.items || []).map((item, index) => (
                <Stack key={item.id || index} direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="text.primary"
                      mb={0.5}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#888' }}
                    >
                      {item.quantity} шт. × {formatPrice(item.price)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ textAlign: 'right' }}
                  >
                    {formatPrice(item.quantity * item.price)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {/* Секция: ИТОГО */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '14px',
                color: '#888',
                borderBottom: '1px solid',
                borderBottomColor: theme.palette.divider,
                pb: 1,
                mb: 3
              }}
            >
              Итого
            </Typography>

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1" color="text.secondary">
                  Сумма товаров
                </Typography>
                <Typography variant="body1" fontWeight={500} color="text.primary">
                  {formatPrice(itemsTotal)}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body1" color="text.secondary">
                  Доставка
                </Typography>
                <Typography variant="body1" fontWeight={500} color="text.primary">
                  {(order.deliveryCost || 0) > 0 ? formatPrice(order.deliveryCost || 0) : 'Бесплатно'}
                </Typography>
              </Stack>

              {(order.bonus || 0) > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" color="text.secondary">
                    Бонусы
                  </Typography>
                  <Typography variant="body1" fontWeight={500} color="success.main">
                    +{formatPrice(order.bonus || 0)}
                  </Typography>
                </Stack>
              )}

              <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0 }}>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  К оплате
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    color: '#4ade80',
                    lineHeight: 1
                  }}
                >
                  {formatPrice(order.totalAmount || 0)}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Секция: ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ */}
          {(order.paidAt || order.shippedAt) && (
            <Box sx={{ mb: 0 }}> {/* Убираем нижний отступ у последней секции */}
              <Typography
                variant="subtitle2"
                sx={{
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#888',
                  borderBottom: '1px solid',
                  borderBottomColor: theme.palette.divider,
                  pb: 1,
                  mb: 3
                }}
              >
                Дополнительная информация
              </Typography>

              <Stack spacing={2} sx={{ mb: 0 }}> {/* Убираем отступ у последнего элемента */}
                {order.paidAt && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                      Дата оплаты
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                      fontWeight: 500,
                      textAlign: 'right'
                    }}>
                      {formatDate(order.paidAt)}
                    </Typography>
                  </Stack>
                )}

                {order.shippedAt && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: '#888', fontWeight: 500 }}>
                      Дата отправки
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                      fontWeight: 500,
                      textAlign: 'right'
                    }}>
                      {formatDate(order.shippedAt)}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}

export default OrderDetailsDrawer
