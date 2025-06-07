'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

// MUI Imports
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  alpha,
  useTheme,
  CircularProgress,
  Checkbox,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'

// Icons
import {
  Search,
  ShoppingCart,
  Warning,
  CheckCircle,
  Schedule,
  MoreVert,
  Visibility,
  Add,
  Close,
  Settings,
  Timeline,
  LocalShipping,
  Delete,
  ArrowBack
} from '@mui/icons-material'

// Form Components
import {
  FormControlLabel,
  Switch
} from '@mui/material'

// Hooks
import { useCurrencyApi } from '@/hooks/useCurrencyApi'
import { useDateRangeStore } from '@/store/dateRangeStore'

// Components
import CurrencyChart from '@/components/currency/CurrencyChart'


// Interfaces
interface Product {
  id: number
  name: string
  category: string
  stock: number
  daysToZero: number
  sold: number
  avgPerDay: number
  inTransit: number
  arrivalDate: string | null
  leadTime: number
  minStock: number
  toPurchase: number
  costTry: number
  costRub: number
  expenses: number
  totalCostRub: number
  retailPrice: number
  markup: number
  marginPercent: number
  marginRub: number
  profitability: number
  turnoverDays: number
  deliveryStatus: 'нужно_заказать' | 'в_пути' | 'оплачено' | 'на_складе' | 'в_закупке' | 'задержка'
  purchaseSum: number
  profit: number
  urgencyLevel: 'critical' | 'warning' | 'normal'
  isHidden?: boolean
}

const categories = ['Все категории', 'Электроника', 'Компьютеры', 'Аудио', 'Техника для дома']
const periods = [
  { value: 7, label: '7 дней' },
  { value: 14, label: '14 дней' },
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' }
]

// Utility function for currency formatting
const formatCurrency = (value: number | undefined, currency: 'RUB' | 'TRY' = 'RUB') => {
  if (value === undefined || value === null || isNaN(value)) {
    return currency === 'TRY' ? '0 ₺' : '0 ₽'
  }
  return currency === 'TRY'
    ? `${value.toLocaleString('tr-TR')} ₺`
    : `${value.toLocaleString('ru-RU')} ₽`
}



// Enhanced Delivery Lead Time Card
const DeliveryLeadTimeCard = ({ leadTime }: { leadTime: number }) => {
  const theme = useTheme()

  return (
    <Box sx={{
      p: 3,
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      borderRadius: 3,
      backgroundColor: theme.palette.background.paper,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: 'Inter, -apple-system, sans-serif',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 8px 24px rgba(0, 0, 0, 0.4)'
          : '0 8px 24px rgba(0, 0, 0, 0.08)',
        borderColor: alpha(theme.palette.primary.main, 0.3)
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{
          p: 0.75,
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          borderRadius: 1.5,
          display: 'flex'
        }}>
          <LocalShipping sx={{ fontSize: 18, color: theme.palette.info.main }} />
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: theme.palette.text.primary
          }}
        >
          Рукав доставки
        </Typography>
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 0.5,
          color: theme.palette.info.main,
          letterSpacing: '-0.02em'
        }}
      >
        {leadTime} дней
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
          letterSpacing: '0.01em'
        }}
      >
        Время до прибытия
      </Typography>
    </Box>
  )
}

// Premium Purchase Modal Component - Aviasales/Notion/Vercel style
const PremiumPurchaseModal = ({
  open,
  onClose,
  products,
  purchaseForm,
  setPurchaseForm,
  onConfirm,
  theme,
  formatCurrency,
  onRemoveProduct
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  purchaseForm: any
  setPurchaseForm: any
  onConfirm: () => void
  theme: any
  formatCurrency: (value: number, currency?: string) => string
  onRemoveProduct: (productId: number) => void
}) => {
  const [editableQuantities, setEditableQuantities] = useState<Record<number, number>>({})

  useEffect(() => {
    if (open) {
      const initialQuantities: Record<number, number> = {}
      products.forEach(p => {
        initialQuantities[p.id] = p.toPurchase > 0 ? p.toPurchase : Math.max(1, p.minStock - p.stock)
      })
      setEditableQuantities(initialQuantities)
    }
  }, [open, products])

  const totalSum = products.reduce((sum, p) => {
    const quantity = editableQuantities[p.id] || 0
    return sum + (p.costRub * quantity)
  }, 0)

  const urgentProducts = products.filter(p => p.urgencyLevel === 'critical')
  const regularProducts = products.filter(p => p.urgencyLevel !== 'critical')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(25, 25, 25, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 32px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 32px 64px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Box sx={{
          p: 4,
          background: urgentProducts.length > 0
            ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)'
            : 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  display: 'flex'
                }}>
                  <ShoppingCart sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {urgentProducts.length > 0 ? '🔥 Срочная закупка' : '📦 Новая закупка'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {products.length} товар{products.length === 1 ? '' : products.length < 5 ? 'а' : 'ов'} • {formatCurrency(totalSum)}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={onClose}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Decorative background elements */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            opacity: 0.3
          }} />
        </Box>
      </motion.div>

      <DialogContent sx={{ p: 0 }}>
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        >
          <Box sx={{ p: 4, pb: 2 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor: alpha('#10B981', 0.1),
                  border: `1px solid ${alpha('#10B981', 0.2)}`
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981', mb: 0.5 }}>
                    {products.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Позиций к закупке
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor: alpha('#F59E0B', 0.1),
                  border: `1px solid ${alpha('#F59E0B', 0.2)}`
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B', mb: 0.5 }}>
                    {Object.values(editableQuantities).reduce((sum, qty) => sum + qty, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Общее количество
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor: alpha('#3B82F6', 0.1),
                  border: `1px solid ${alpha('#3B82F6', 0.2)}`
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6', mb: 0.5 }}>
                    {formatCurrency(totalSum)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Общая сумма
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Products List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Box sx={{ px: 4, pb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Товары для закупки
            </Typography>

            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  id={`product-${product.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Box sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    backgroundColor: theme.palette.background.paper,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transform: 'translateY(-1px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 24px rgba(0, 0, 0, 0.2)'
                        : '0 8px 24px rgba(0, 0, 0, 0.08)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                          {product.urgencyLevel === 'critical' && (
                            <Box sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: alpha('#EF4444', 0.1),
                              border: `1px solid ${alpha('#EF4444', 0.2)}`
                            }}>
                              <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 600 }}>
                                СРОЧНО
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                          Остаток: {product.stock} шт • Себестоимость: {formatCurrency(product.costRub)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 180 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={editableQuantities[product.id] || 0}
                          onChange={(e) => {
                            const value = Math.max(1, parseInt(e.target.value) || 1)
                            setEditableQuantities(prev => ({ ...prev, [product.id]: value }))
                          }}
                          inputProps={{ min: 1 }}
                          sx={{
                            width: 80,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.main
                              }
                            }
                          }}
                        />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          шт
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => {
                            // Создаем эффект анимации при удалении
                            const element = document.getElementById(`product-${product.id}`)
                            if (element) {
                              element.style.transition = 'all 0.3s ease-out'
                              element.style.transform = 'translateX(-100%)'
                              element.style.opacity = '0'

                              setTimeout(() => {
                                onRemoveProduct(product.id)
                                setEditableQuantities(prev => {
                                  const newQuantities = { ...prev }
                                  delete newQuantities[product.id]
                                  return newQuantities
                                })
                              }, 300)
                            } else {
                              onRemoveProduct(product.id)
                              setEditableQuantities(prev => {
                                const newQuantities = { ...prev }
                                delete newQuantities[product.id]
                                return newQuantities
                              })
                            }
                          }}
                          sx={{
                            color: '#EF4444',
                            backgroundColor: alpha('#EF4444', 0.1),
                            '&:hover': {
                              backgroundColor: alpha('#EF4444', 0.2),
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s'
                          }}
                          title="Убрать из закупки"
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* Purchase Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <Box sx={{ px: 4, pb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Детали закупки
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Поставщик"
                  placeholder="Выберите поставщика"
                  value={purchaseForm.supplier}
                  onChange={(e) => setPurchaseForm(prev => ({ ...prev, supplier: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ожидаемая дата поставки"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={purchaseForm.expectedDeliveryDate}
                  onChange={(e) => setPurchaseForm(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Комментарии к закупке"
                  placeholder="Дополнительная информация, особые требования..."
                  value={purchaseForm.comments}
                  onChange={(e) => setPurchaseForm(prev => ({ ...prev, comments: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </DialogContent>

      {/* Sticky Footer */}
      <Box sx={{
        p: 4,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Итого: {formatCurrency(totalSum)}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {Object.values(editableQuantities).reduce((sum, qty) => sum + qty, 0)} позиций
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={onClose}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.8),
                color: theme.palette.text.primary
              }
            }}
          >
            Назад
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              borderColor: alpha(theme.palette.divider, 0.3),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Отменить
          </Button>
          <Button
            variant="contained"
            onClick={() => onConfirm()}
            disabled={!purchaseForm.supplier || totalSum === 0 || products.length === 0}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              background: urgentProducts.length > 0
                ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)'
                : 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: urgentProducts.length > 0
                  ? '0 8px 24px rgba(255, 107, 107, 0.4)'
                  : '0 8px 24px rgba(79, 70, 229, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                opacity: 0.6,
                transform: 'none'
              }
            }}
          >
            <ShoppingCart sx={{ mr: 1, fontSize: 18 }} />
            Создать закупку
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

// Premium Receive Modal Component - Aviasales/Notion/Vercel style
const PremiumReceiveModal = ({
  open,
  onClose,
  products,
  receiveForm,
  setReceiveForm,
  onConfirm,
  theme,
  formatCurrency
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  receiveForm: any
  setReceiveForm: any
  onConfirm: () => void
  theme: any
  formatCurrency: (value: number, currency?: string) => string
}) => {
  const [editableQuantities, setEditableQuantities] = useState<Record<number, number>>({})

  useEffect(() => {
    if (open) {
      const initialQuantities: Record<number, number> = {}
      const actualQuantities: Record<number, number> = {}
      products.forEach(p => {
        const defaultQty = p.inTransit || 0
        initialQuantities[p.id] = defaultQty
        actualQuantities[p.id] = defaultQty
      })
      setEditableQuantities(initialQuantities)
      setReceiveForm((prev: any) => ({ ...prev, actualQuantities }))
    }
  }, [open, products, setReceiveForm])

  const totalReceiving = Object.values(editableQuantities).reduce((sum, qty) => sum + qty, 0)
  const totalValue = products.reduce((sum, p) => {
    const quantity = editableQuantities[p.id] || 0
    return sum + (p.costRub * quantity)
  }, 0)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(25, 25, 25, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 32px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 32px 64px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Box sx={{
          p: 4,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  p: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  display: 'flex'
                }}>
                  <CheckCircle sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                    📦 Оприходование товаров
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {products.length} позиций • {totalReceiving} штук • {formatCurrency(totalValue)}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={onClose}
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Decorative background elements */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            opacity: 0.3
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            opacity: 0.5
          }} />
        </Box>
      </motion.div>

      <DialogContent sx={{ p: 0 }}>
        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        >
          <Box sx={{ p: 4, pb: 2 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={3}>
                <Box sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor: alpha('#10B981', 0.1),
                  border: `1px solid ${alpha('#10B981', 0.2)}`
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981', mb: 0.5 }}>
                    {products.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Позиций
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor: alpha('#3B82F6', 0.1),
                  border: `1px solid ${alpha('#3B82F6', 0.2)}`
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#3B82F6', mb: 0.5 }}>
                    {totalReceiving}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Единиц товара
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor: alpha('#8B5CF6', 0.1),
                  border: `1px solid ${alpha('#8B5CF6', 0.2)}`
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B5CF6', mb: 0.5 }}>
                    {formatCurrency(totalValue)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Стоимость
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor: alpha('#F59E0B', 0.1),
                  border: `1px solid ${alpha('#F59E0B', 0.2)}`
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#F59E0B', mb: 0.5 }}>
                    {formatCurrency(receiveForm.logisticsCost || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Логистика
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Receive Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Box sx={{ px: 4, pb: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Детали поступления
            </Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Дата поступления"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={receiveForm.receivedDate}
                  onChange={(e) => setReceiveForm((prev: any) => ({ ...prev, receivedDate: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Расходы на логистику"
                  type="number"
                  InputProps={{
                    endAdornment: <Typography sx={{ color: theme.palette.text.secondary, ml: 1 }}>₽</Typography>
                  }}
                  value={receiveForm.logisticsCost || 0}
                  onChange={(e) => setReceiveForm((prev: any) => ({ ...prev, logisticsCost: parseFloat(e.target.value) || 0 }))}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </motion.div>

        {/* Products List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <Box sx={{ px: 4, pb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Товары к оприходованию
            </Typography>

            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Box sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    backgroundColor: theme.palette.background.paper,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: alpha('#10B981', 0.3),
                      transform: 'translateY(-1px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 24px rgba(0, 0, 0, 0.2)'
                        : '0 8px 24px rgba(0, 0, 0, 0.08)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                          <Box sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor: alpha('#10B981', 0.1),
                            border: `1px solid ${alpha('#10B981', 0.2)}`
                          }}>
                            <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                              В ПУТИ: {product.inTransit} шт
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                          Текущий остаток: {product.stock} шт • Себестоимость: {formatCurrency(product.costRub)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 500 }}>
                          После оприходования: {product.stock + (editableQuantities[product.id] || 0)} шт
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 140 }}>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Получено:
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={editableQuantities[product.id] || 0}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(product.inTransit, parseInt(e.target.value) || 0))
                            setEditableQuantities(prev => ({ ...prev, [product.id]: value }))
                            setReceiveForm((prev: any) => ({
                              ...prev,
                              actualQuantities: { ...prev.actualQuantities, [product.id]: value }
                            }))
                          }}
                          inputProps={{ min: 0, max: product.inTransit }}
                          sx={{
                            width: 80,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': {
                                borderColor: '#10B981'
                              }
                            }
                          }}
                        />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          шт
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Box sx={{ px: 4, pb: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Комментарии к оприходованию"
              placeholder="Особенности поставки, качество товара, проблемы..."
              value={receiveForm.comments}
              onChange={(e) => setReceiveForm((prev: any) => ({ ...prev, comments: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </motion.div>
      </DialogContent>

      {/* Sticky Footer */}
      <Box sx={{
        p: 4,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            К оприходованию: {totalReceiving} шт
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Стоимость: {formatCurrency(totalValue)} + логистика {formatCurrency(receiveForm.logisticsCost || 0)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              borderColor: alpha(theme.palette.divider, 0.3),
              '&:hover': {
                borderColor: '#10B981',
                backgroundColor: alpha('#10B981', 0.04)
              }
            }}
          >
            Отменить
          </Button>
          <Button
            variant="contained"
            onClick={() => onConfirm()}
            disabled={totalReceiving === 0}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                opacity: 0.6,
                transform: 'none'
              }
            }}
          >
            <CheckCircle sx={{ mr: 1, fontSize: 18 }} />
            Оприходовать
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

const PremiumPurchaseAnalytics = () => {
  const theme = useTheme()

  // API для получения курсов валют - с fallback защитой
  const currencyApiResult = useCurrencyApi()
  const currencyApiData = currencyApiResult?.data || null
  const currencyLoading = currencyApiResult?.loading || false
  const currencyError = currencyApiResult?.error || null
  const refreshCurrencyRates = currencyApiResult?.refreshCurrencyRates || (async () => {}) || {
    data: null,
    loading: false,
    error: null,
    refreshCurrencyRates: async () => {}
  }

  // Период для расчетов из datepicker в navbar
  const { range } = useDateRangeStore()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все категории')
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [showOnlyNeedsPurchase, setShowOnlyNeedsPurchase] = useState(false)
  const [showHiddenProducts, setShowHiddenProducts] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [actionMenuAnchor, setActionMenuAnchor] = useState<{ [key: number]: HTMLElement | null }>({})
  const [purchaseDrawerOpen, setPurchaseDrawerOpen] = useState(false)
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<Product | null>(null)
  const [bulkPurchaseDrawerOpen, setBulkPurchaseDrawerOpen] = useState(false)
  const [currencySettingsOpen, setCurrencySettingsOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New state for UX improvements
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [productDetailModalOpen, setProductDetailModalOpen] = useState(false)
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null)
  const [analyticsFilter, setAnalyticsFilter] = useState<'all' | 'lowStock' | 'critical' | 'needsPurchase'>('all')

  // Currency states
  const [currencyRates, setCurrencyRates] = useState({
    current: 3.45,        // Текущий курс ЦБ (read-only, получается с бэкенда)
    average30Days: 3.42,  // Средний за 30 дней
    planning: 3.42,       // Плановый курс (можно редактировать)
    buffer: 0.03,         // Буфер 3%
    lastUpdate: new Date().toISOString(),
    source: 'ЦБ РФ'
  })

  // Delivery settings state
  const [deliverySettings, setDeliverySettings] = useState({
    deliveryLeadTime: 14,
    defaultSupplier: '',
    defaultWarehouse: ''
  })

  // New modal states for premium UX
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [selectedProductsForPurchase, setSelectedProductsForPurchase] = useState<Product[]>([])
  const [selectedProductsForReceive, setSelectedProductsForReceive] = useState<Product[]>([])

  // Purchase form state
  const [purchaseForm, setPurchaseForm] = useState({
    supplier: '',
    expectedDeliveryDate: '',
    comments: '',
    priority: 'normal' as 'urgent' | 'normal' | 'low'
  })

  // Receive form state
  const [receiveForm, setReceiveForm] = useState({
    receivedDate: new Date().toISOString().split('T')[0],
    actualQuantities: {} as Record<number, number>,
    comments: '',
    logisticsCost: 0
  })

  // Mock data для sparkline (в реальном проекте получать с API)
  const mockCurrencyTrend = [2.08, 2.06, 2.05, 2.12, 2.11, 2.09, 2.13]
  const trendChange = ((mockCurrencyTrend[mockCurrencyTrend.length - 1] - mockCurrencyTrend[0]) / mockCurrencyTrend[0]) * 100

  // Helper functions for calculations
  const calculateDaysToZero = (stock: number, avgPerDay: number) => {
    return avgPerDay > 0 ? Math.floor(stock / avgPerDay) : 999
  }

  const calculateToPurchase = (stock: number, minStock: number, avgPerDay: number, leadTime: number = 14) => {
    const daysToZero = calculateDaysToZero(stock, avgPerDay)
    // Учитываем рукав доставки: заказываем если товары закончатся до прихода новой поставки
    if (daysToZero <= leadTime || stock <= minStock) {
      // Заказываем на период доставки + запас
      const consumptionDuringDelivery = avgPerDay * leadTime
      const totalNeeded = consumptionDuringDelivery + minStock * 2
      return Math.round(Math.max(totalNeeded - stock, 0))
    }
    return 0
  }

  const calculateMarkup = (salePrice: number, costRub: number) => {
    return costRub > 0 ? ((salePrice - costRub) / costRub) * 100 : 0
  }

  const calculateProfit = (salePrice: number, costRub: number, totalSold: number) => {
    return (salePrice - costRub) * totalSold
  }

  const calculateUrgencyLevel = (stock: number, avgPerDay: number, minStock: number, leadTime: number = 14): 'critical' | 'warning' | 'normal' => {
    const daysToZero = calculateDaysToZero(stock, avgPerDay)
    // Учитываем рукав доставки: если товары закончатся раньше, чем придет новая поставка
    if (daysToZero <= leadTime * 0.5 || stock <= minStock) return 'critical'
    if (daysToZero <= leadTime || stock <= minStock * 1.5) return 'warning'
    return 'normal'
  }

  // Функция для получения статистики продаж из заказов за выбранный период
  const fetchSalesData = useCallback(async () => {
    try {
      const response = await fetch('https://strattera.tgapp.online/api/v1/orders', {
        headers: {
          'Authorization': '8cM9wVBrY3p56k4L1VBpIBwOsw'
        }
      })

      if (!response.ok) {
        throw new Error('Ошибка загрузки заказов')
      }

      const orders = await response.json()

      // Фильтруем заказы по выбранному периоду из datepicker
      let filteredCount = 0
      const filteredOrders = orders.filter((order: any) => {
        if (!order.created_at) return true

        const orderDate = new Date(order.created_at)

        // Если период не выбран, используем заказы за последние 30 дней
        if (!range.start || !range.end) {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const inRange = orderDate >= thirtyDaysAgo
          // Логируем только для первых 3 заказов для отладки
          if (filteredCount < 3) {
            console.log(`📅 Заказ ${order.id} от ${orderDate.toLocaleDateString()}: ${inRange ? 'включен' : 'исключен'} (период: последние 30 дней)`)
          }
          if (inRange) filteredCount++
          return inRange
        }

        // Фильтрация по выбранному периоду
        const inRange = orderDate >= range.start && orderDate <= range.end
        // Логируем только для первых 3 заказов для отладки
        if (filteredCount < 3) {
          console.log(`📅 Заказ ${order.id} от ${orderDate.toLocaleDateString()}: ${inRange ? 'включен' : 'исключен'} (период: ${range.start.toLocaleDateString()} - ${range.end.toLocaleDateString()})`)
        }
        if (inRange) filteredCount++
        return inRange
      })

      console.log(`📊 Всего заказов: ${orders.length}, за выбранный период: ${filteredOrders.length}`)
      console.log(`📅 Выбранный период: ${range.start ? range.start.toLocaleDateString() : 'не выбран'} - ${range.end ? range.end.toLocaleDateString() : 'не выбран'}`)

      // Группируем продажи по товарам
      const salesByProduct: Record<string, { totalSold: number, totalRevenue: number, prices: number[] }> = {}

      // Функция для нормализации названий товаров
      const normalizeProductName = (name: string): string => {
        return name.toLowerCase()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/мг/g, 'mg')
          .replace(/мкг/g, 'мсг')
          .replace(/мл/g, 'ml')
      }

      // Мапа для связывания вариантов названий товаров
      const productNameMapping: Record<string, string> = {
        'risperdal 1 mg/ml сироп': 'Risperdal 1 Mg/ml сироп',
        'risperdal 1 мг/мл сироп': 'Risperdal 1 Mg/ml сироп',
        'salazopyrin 500 mg': 'Salazopyrin 500 mg',
        'сирорсил': 'Siroksil',
        'siroksil': 'Siroksil'
      }

      filteredOrders.forEach((order: any) => {
        if (order.order_items && Array.isArray(order.order_items)) {
          order.order_items.forEach((item: any) => {
            const originalName = item.name || item.product_name
            if (originalName) {
              const normalizedName = normalizeProductName(originalName)
              // Ищем соответствующее каноническое название
              const canonicalName = productNameMapping[normalizedName] || originalName

              if (!salesByProduct[canonicalName]) {
                salesByProduct[canonicalName] = { totalSold: 0, totalRevenue: 0, prices: [] }
              }
              salesByProduct[canonicalName].totalSold += item.quantity || 1
              const price = parseFloat(item.price) || 0
              salesByProduct[canonicalName].totalRevenue += price * (item.quantity || 1)
              if (price > 0) {
                salesByProduct[canonicalName].prices.push(price)
              }
            }
          })
        }
      })

      return salesByProduct
    } catch (error) {
      console.error('Ошибка получения данных продаж:', error)
      return {}
    }
  }, [range])

  // Load products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Сначала получаем данные продаж
      const salesData = await fetchSalesData()

      // Получаем данные о скрытых товарах с сервера
      let hiddenProductsData: string[] = []
      try {
        const hiddenResponse = await fetch('http://localhost:3011/api/products/hidden')
        if (hiddenResponse.ok) {
          const hiddenResult = await hiddenResponse.json()
          console.log('📋 Получены скрытые товары:', hiddenResult)
          hiddenProductsData = hiddenResult.hiddenProducts || []
        }
      } catch (error) {
        console.warn('Не удалось загрузить данные о скрытых товарах:', error)
      }

      const response = await fetch('https://strattera.tgapp.online/api/v1/products', {
        headers: {
          'Authorization': '8cM9wVBrY3p56k4L1VBpIBwOsw'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Обрабатываем данные напрямую как массив из API Strattera
      if (Array.isArray(data)) {
                        // Исключаем товары категории "Доставка" и товары с названием "Доставка"
        const filteredData = data.filter((apiProduct: any) => {
          const category = (apiProduct.category || '').toLowerCase()
          const name = (apiProduct.name || '').toLowerCase()

                    const isServiceProduct = category.includes('доставка') ||
                                 category.includes('delivery') ||
                                 name.includes('доставка') ||
                                 name.includes('delivery') ||
                                 name === 'доставка' ||
                                 name === 'сдвг' ||
                                 name === 'товары' ||
                                 name === 'для похудения' ||
                                 name === 'другое' ||
                                 name === 'противозачаточные'

          if (isServiceProduct) {
            console.log('Исключен служебный товар:', name, category)
          }

          return !isServiceProduct
        })

        console.log(`Товаров получено с API: ${data.length}, после фильтрации: ${filteredData.length}`)

                const transformedProducts = await Promise.all(
          filteredData.map(async (apiProduct: any, index: number) => {
            // Получаем реальные данные продаж для этого товара
            const productSalesData = salesData[apiProduct.name] || { totalSold: 0, totalRevenue: 0, prices: [] }

            // Реальные остатки из API (используем поле stock_quantity)
            const stock = apiProduct.stock_quantity || Math.floor(Math.random() * 50) + 1

            // Рассчитываем среднее потребление на основе реальных продаж за выбранный период
            const calculateDaysInPeriod = () => {
              if (range.start && range.end) {
                const diffTime = Math.abs(range.end.getTime() - range.start.getTime())
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                return Math.max(diffDays, 1) // минимум 1 день
              }
              return selectedPeriod // fallback к selectedPeriod
            }

            const daysInPeriod = calculateDaysInPeriod()
            const avgPerDay = productSalesData.totalSold > 0
              ? productSalesData.totalSold / daysInPeriod
              : 2.5 + Math.random() * 2 // fallback к случайному значению

            const daysToZero = calculateDaysToZero(stock, avgPerDay)
            const minStock = Math.max(Math.floor(stock * 0.3), 5)
            const toPurchase = calculateToPurchase(stock, minStock, avgPerDay, deliverySettings.deliveryLeadTime)

            // Себестоимость из фиксированной базы цен
            const costTry = getProductCostTry(apiProduct.name)
            const costRub = costTry * currencyRates.current
            const expenses = await calculateExpenses(apiProduct.name) // расходы на курьера + дополнительные
            const totalCostRub = costRub + expenses

            // Средняя розничная цена из реальных продаж за выбранный период
            let averageRetailPrice: number
            if (productSalesData.prices.length > 0) {
              // Используем реальные цены из заказов
              averageRetailPrice = productSalesData.prices.reduce((sum: number, price: number) => sum + price, 0) / productSalesData.prices.length
              console.log(`✅ Используются реальные цены для "${apiProduct.name}": средняя ${averageRetailPrice.toFixed(2)}₽ из ${productSalesData.prices.length} продаж`)
            } else {
              // Fallback с базовыми ценами для популярных товаров
              const baseRetailPrices: Record<string, number> = {
                'Atominex 10 mg': 5000,
                'Atominex 25 mg': 7500,
                'Atominex 40 mg': 6500,
                'Atominex 60 mg': 8500,
                'Atominex 80 mg': 9500,
                'Atominex 100 mg': 11000,
                'Atominex 18 mg': 7200,
                'Abilify 15 mg': 6800,
                'Attex 100 mg': 12000,
                'Attex 10 mg': 5500,
                'Attex 4 mg (сироп)': 4200,
                // Добавляем недостающие товары
                'Risperdal 1 Mg/ml сироп': 3500,
                'Risperdal 1 мг/мл сироп': 3500,
                'Salazopyrin 500 mg': 3200,
                'Siroksil': 4800,
                'Euthyrox 100 мсг': 1800,
                'Мирена 20 мкг/24 часа': 8500,
                'Arislow 1 mg': 2800,
                'Arislow 2 mg': 3100,
                'Arislow 3 mg': 3400,
                'Arislow 4 mg': 3700
              }

              // Ищем базовую цену с учётом вариантов написания
              let basePrice = baseRetailPrices[apiProduct.name]
              if (!basePrice) {
                // Пробуем найти по нормализованному названию
                const normalizedName = apiProduct.name.toLowerCase().trim()
                for (const [baseName, price] of Object.entries(baseRetailPrices)) {
                  if (normalizedName === baseName.toLowerCase() ||
                      normalizedName.includes(baseName.toLowerCase()) ||
                      baseName.toLowerCase().includes(normalizedName)) {
                    basePrice = price
                    break
                  }
                }
              }

              averageRetailPrice = basePrice || totalCostRub * 2.5 // 150% наценка для неизвестных товаров
              console.log(`⚠️ Используется базовая цена для "${apiProduct.name}": ${averageRetailPrice.toFixed(2)}₽ ${basePrice ? '(найдена в базе)' : '(расчётная 150%)'}`)
            }

            const retailPrice = averageRetailPrice
            const sold = productSalesData.totalSold || Math.floor(Math.random() * 20) + 1

            // Детальное логирование для отладки расчета цен
            console.log(`🔍 Анализ цен для "${apiProduct.name}":`, {
              productSalesData,
              daysInPeriod,
              costTry,
              costRub: costRub.toFixed(2),
              totalCostRub: totalCostRub.toFixed(2),
              averageRetailPrice: averageRetailPrice.toFixed(2),
              isUsingFallback: productSalesData.prices.length === 0,
              prices: productSalesData.prices
            })

            // Сохраняем среднюю цену в localStorage и API для дальнейшего использования
            if (productSalesData.prices.length > 0) {
              const priceData = {
                averagePrice: averageRetailPrice,
                lastUpdated: new Date().toISOString(),
                salesCount: productSalesData.prices.length,
                period: `${range.start?.toISOString().split('T')[0]} - ${range.end?.toISOString().split('T')[0]}`,
                source: 'real_sales'
              }

              // Сохраняем в localStorage
              const priceHistory = JSON.parse(localStorage.getItem('productPriceHistory') || '{}')
              priceHistory[apiProduct.name] = priceData
              localStorage.setItem('productPriceHistory', JSON.stringify(priceHistory))

              // Асинхронно сохраняем в API (не блокируем загрузку)
              try {
                fetch(`http://localhost:3011/api/prices/${encodeURIComponent(apiProduct.name)}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(priceData)
                }).catch(error => console.warn('Не удалось сохранить цену в API:', error))
              } catch (error) {
                console.warn('Ошибка сохранения цены в API:', error)
              }
            }
            const marginRub = retailPrice - totalCostRub
            const marginPercent = (marginRub / totalCostRub) * 100
            const profitability = (marginRub / retailPrice) * 100
            const turnoverDays = avgPerDay > 0 ? Math.floor(stock / avgPerDay) : 999 // оборачиваемость

          // Определяем статус на основе потребности в закупке
          let deliveryStatus: Product['deliveryStatus']
          if (toPurchase > 0) {
            deliveryStatus = 'нужно_заказать'
          } else {
            const otherStatuses = ['в_пути', 'оплачено', 'на_складе', 'в_закупке', 'задержка'] as const
            deliveryStatus = otherStatuses[Math.floor(Math.random() * otherStatuses.length)]
          }

          const purchaseSum = toPurchase * totalCostRub

          return {
            id: index + 1,
            name: apiProduct.name || `Товар ${index + 1}`,
            category: apiProduct.category || getRandomCategory(),
            stock: stock,
            daysToZero: Math.floor(daysToZero),
            sold: sold,
            avgPerDay: parseFloat(avgPerDay.toFixed(1)),
            inTransit: Math.random() > 0.7 ? Math.floor(Math.random() * 10) + 1 : 0,
            arrivalDate: Math.random() > 0.7 ? getRandomFutureDate() : null,
            leadTime: deliverySettings.deliveryLeadTime,
            minStock: minStock,
            toPurchase: toPurchase,
            costTry: parseFloat(costTry.toFixed(2)),
            costRub: parseFloat(costRub.toFixed(2)),
            expenses: parseFloat(expenses.toFixed(2)),
            totalCostRub: parseFloat(totalCostRub.toFixed(2)),
            retailPrice: parseFloat(retailPrice.toFixed(2)),
            markup: parseFloat(((retailPrice - costRub) / costRub * 100).toFixed(1)),
            marginPercent: parseFloat(marginPercent.toFixed(1)),
            marginRub: parseFloat(marginRub.toFixed(2)),
            profitability: parseFloat(profitability.toFixed(1)),
            turnoverDays: turnoverDays,
            deliveryStatus: deliveryStatus,
            purchaseSum: parseFloat(purchaseSum.toFixed(2)),
            profit: parseFloat(((retailPrice - totalCostRub) * sold).toFixed(2)),
            urgencyLevel: calculateUrgencyLevel(stock, avgPerDay, minStock, deliverySettings.deliveryLeadTime),
            isHidden: hiddenProductsData.includes(apiProduct.name) // Проверяем, скрыт ли товар
          }
        })
        )

        setProducts(transformedProducts)
      } else {
        throw new Error('Неверный формат данных API')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Ошибка загрузки товаров')
    } finally {
      setLoading(false)
    }
  }, [currencyRates.current, selectedPeriod, fetchSalesData, deliverySettings.deliveryLeadTime, range, showHiddenProducts])

  // Расчет расходов на товар (курьер + расходы из базы)
  const calculateExpenses = async (productName: string): Promise<number> => {
    const courierCost = 350 // Фиксированная стоимость отправки курьером в рублях

    // TODO: Здесь будет запрос к базе расходов для получения дополнительных расходов
    // const additionalExpenses = await getExpensesFromDatabase(productName)

    // Пока используем среднее значение расходов на рекламу и расходники
    const averageAdditionalExpenses = 50 + Math.random() * 100 // 50-150₽ на товар

    return courierCost + averageAdditionalExpenses
  }

  // Фиксированные цены товаров в лирах из базы данных
  const getProductCostTry = (productName: string): number => {
    const costDatabase: Record<string, number> = {
      'Atominex 10 mg': 455,
      'Abilify 15 mg': 430,
      'Attex 100 mg': 1170,
      'Atominex 25 mg': 765,
      'Atominex 60 mg': 595,
      'Atominex 40 mg': 416,
      'Atominex 18 mg': 605,
      'Atominex 80 mg': 770,
      'Attex 4 mg (сироп)': 280,
      'Attex 10 mg': 420,
      'Atominex 100 mg': 970,
      'Attex 18 mg': 740,
      'Attex 80 mg': 960,
      'HHS A1 L-Carnitine Lepidium': 280,
      'Мирена 20 мкг/24 часа': 1300,
      'Arislow 1 mg': 255,
      'Arislow 2 mg': 285,
      'Arislow 3 mg': 310,
      'Arislow 4 mg': 340,
      'Attex 25 mg': 797,
      'Attex 40 mg': 495,
      'Attex 60 mg': 730,
      'Abilify 5 mg': 300,
      'Risperdal 1 мг/мл сироп': 245,
      'Salazopyrin 500 mg': 220,
      'Euthyrox 100 мсг': 105
    }

    // Точное совпадение названия
    if (costDatabase[productName]) {
      return costDatabase[productName]
    }

    // Поиск по частичному совпадению (для разных вариантов написания)
    const normalizedName = productName.toLowerCase().trim()
    for (const [dbName, cost] of Object.entries(costDatabase)) {
      if (normalizedName.includes(dbName.toLowerCase()) || dbName.toLowerCase().includes(normalizedName)) {
        return cost
      }
    }

    // Если товар не найден в базе, возвращаем случайную цену как fallback
    console.warn(`Цена не найдена для товара: ${productName}`)
    return 100 + Math.random() * 500
  }

  // Helper functions for random data generation
  const getRandomCategory = () => {
    const cats = ['Антибиотики', 'Обезболивающие', 'Витамины', 'Сердечные препараты', 'Неврология']
    return cats[Math.floor(Math.random() * cats.length)]
  }

  const getRandomFutureDate = () => {
    const days = Math.floor(Math.random() * 30) + 1
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  // Load data on component mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('purchaseSettings')
    if (savedSettings) {
      try {
        const { currencyRates: savedCurrencyRates, deliverySettings: savedDeliverySettings } = JSON.parse(savedSettings)
        if (savedCurrencyRates) {
          setCurrencyRates(savedCurrencyRates)
        }
        if (savedDeliverySettings) {
          setDeliverySettings(savedDeliverySettings)
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error)
      }
    }
  }, [])

  // Обновление локального состояния курсов при получении данных с API
  useEffect(() => {
    if (currencyApiData) {
      setCurrencyRates(prev => ({
        ...prev,
        current: currencyApiData.currentWithBuffer, // Используем курс с буфером +5%
        average30Days: currencyApiData.average30Days,
        buffer: currencyApiData.buffer,
        lastUpdate: currencyApiData.lastUpdate,
        source: currencyApiData.source
      }))
    }
  }, [currencyApiData])

  // Helper function to extract mg from product name
  const extractMg = (name: string): number => {
    const mgMatch = name.match(/(\d+)\s*mg/i)
    return mgMatch ? parseInt(mgMatch[1]) : 0
  }

  // Custom sorting function
  const customSort = (products: Product[]): Product[] => {
    return products.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()

      // Priority groups
      const aIsAtominex = aName.startsWith('atominex')
      const bIsAtominex = bName.startsWith('atominex')
      const aIsAttex = aName.startsWith('attex')
      const bIsAttex = bName.startsWith('attex')

      // Group priority: Atominex > Attex > Others
      if (aIsAtominex && !bIsAtominex) return -1
      if (!aIsAtominex && bIsAtominex) return 1
      if (aIsAttex && !bIsAttex && !bIsAtominex) return -1
      if (!aIsAttex && bIsAttex && !aIsAtominex) return 1

      // Within same group, sort by mg (low to high)
      if ((aIsAtominex && bIsAtominex) || (aIsAttex && bIsAttex)) {
        const aMg = extractMg(a.name)
        const bMg = extractMg(b.name)
        if (aMg !== bMg) return aMg - bMg
      }

      // For others, sort alphabetically then by mg
      if (!aIsAtominex && !bIsAtominex && !aIsAttex && !bIsAttex) {
        // First compare base name (without mg)
        const aBaseName = a.name.replace(/\s*\d+\s*mg.*$/i, '').toLowerCase()
        const bBaseName = b.name.replace(/\s*\d+\s*mg.*$/i, '').toLowerCase()

        if (aBaseName !== bBaseName) {
          return aBaseName.localeCompare(bBaseName)
        }

        // Same base name, sort by mg
        const aMg = extractMg(a.name)
        const bMg = extractMg(b.name)
        return aMg - bMg
      }

      // Same group and no mg difference, sort alphabetically
      return a.name.localeCompare(b.name)
    })
  }

  // Filtered and sorted data with active filter logic
  const filteredData = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'Все категории' || product.category === selectedCategory
      const needsPurchase = showOnlyNeedsPurchase ? product.toPurchase > 0 : true

      // Hidden products filter - показывать скрытые только если включен переключатель
      const isVisibleOrShowHidden = showHiddenProducts || !product.isHidden

      // Analytics filter logic (новая продвинутая фильтрация)
      let matchesAnalyticsFilter = true
      switch (analyticsFilter) {
        case 'lowStock':
          matchesAnalyticsFilter = product.daysToZero < deliverySettings.deliveryLeadTime
          break
        case 'critical':
          matchesAnalyticsFilter = product.urgencyLevel === 'critical'
          break
        case 'needsPurchase':
          matchesAnalyticsFilter = product.toPurchase > 0
          break
        case 'all':
        default:
          matchesAnalyticsFilter = true
          break
      }

      // Active filter logic (старые фильтры кликов по метрикам)
      let matchesActiveFilter = true
      if (activeFilter) {
        switch (activeFilter) {
          case 'critical':
            matchesActiveFilter = product.urgencyLevel === 'critical'
            break
          case 'needsPurchase':
            matchesActiveFilter = product.toPurchase > 0
            break
          case 'slowMovers':
            matchesActiveFilter = product.turnoverDays > 60
            break
          case 'total':
          default:
            matchesActiveFilter = true
            break
        }
      }

      return matchesSearch && matchesCategory && needsPurchase && matchesActiveFilter && matchesAnalyticsFilter && isVisibleOrShowHidden
    })

    return customSort(filtered)
  }, [products, searchQuery, selectedCategory, showOnlyNeedsPurchase, activeFilter, analyticsFilter, deliverySettings.deliveryLeadTime, showHiddenProducts])

  // Stats
  const stats = useMemo(() => {
    const total = filteredData.length
    const critical = filteredData.filter(p => p.urgencyLevel === 'critical').length
    const warning = filteredData.filter(p => p.urgencyLevel === 'warning').length
    const needsPurchase = filteredData.filter(p => p.toPurchase > 0).length
    const totalProfit = filteredData.reduce((sum, p) => sum + p.profit, 0)
    const averageMargin = filteredData.length > 0 ? filteredData.reduce((sum, p) => sum + p.marginPercent, 0) / filteredData.length : 0
    const totalPurchaseSum = filteredData.reduce((sum, p) => sum + p.purchaseSum, 0)
    const slowMovers = filteredData.filter(p => p.turnoverDays > 60).length
    const totalExpenses = filteredData.reduce((sum, p) => sum + (p.expenses * p.stock), 0)
    const potentialRevenue = filteredData.reduce((sum, p) => sum + (p.retailPrice * p.toPurchase), 0)

    return { total, critical, warning, needsPurchase, totalProfit, averageMargin, totalPurchaseSum, slowMovers, totalExpenses, potentialRevenue }
  }, [filteredData])

  // Handlers
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchProducts().finally(() => setIsRefreshing(false))
  }, [fetchProducts])

  const handleSelectRow = useCallback((productId: number) => {
    setSelectedRows(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedRows(
      selectedRows.length === filteredData.length
        ? []
        : filteredData.map(p => p.id)
    )
  }, [selectedRows.length, filteredData])

  const handleActionMenu = useCallback((productId: number, event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchor(prev => ({ ...prev, [productId]: event.currentTarget }))
  }, [])

  const handleCloseActionMenu = useCallback((productId: number) => {
    setActionMenuAnchor(prev => ({ ...prev, [productId]: null }))
  }, [])

  const handleOpenPurchaseDrawer = useCallback((product: Product) => {
    setSelectedProductForPurchase(product)
    setPurchaseDrawerOpen(true)
  }, [])

  const handleClosePurchaseDrawer = useCallback(() => {
    setPurchaseDrawerOpen(false)
    setSelectedProductForPurchase(null)
  }, [])

    const handleOpenBulkPurchaseDrawer = useCallback(() => {
    setBulkPurchaseDrawerOpen(true)
  }, [])

  const handleCloseBulkPurchaseDrawer = useCallback(() => {
    setBulkPurchaseDrawerOpen(false)
  }, [])

  const handleCreatePurchaseOrder = useCallback(() => {
    try {
      // Найти все выбранные товары
      const selectedProducts = filteredData.filter(p =>
        selectedRows.includes(p.id)
      )

      if (selectedProducts.length === 0) {
        alert('Выберите товары для закупки')
        return
      }

      setSelectedProductsForPurchase(selectedProducts)

      // Set default expected delivery date (14 days from now)
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + deliverySettings.deliveryLeadTime)
      setPurchaseForm(prev => ({
        ...prev,
        expectedDeliveryDate: defaultDate.toISOString().split('T')[0]
      }))

      setPurchaseModalOpen(true)
    } catch (error) {
      console.error('Ошибка при открытии модального окна закупки:', error)
      alert('❌ Ошибка при открытии модального окна закупки')
    }
  }, [filteredData, selectedRows, deliverySettings.deliveryLeadTime])

  // Handle purchase confirmation from modal
  const handlePurchaseConfirm = useCallback(async () => {
    try {
      // Подготовить данные для отправки в API закупок
      const purchaseItems = selectedProductsForPurchase.map(product => {
        const quantity = product.toPurchase > 0 ? product.toPurchase : Math.max(1, product.minStock - product.stock)
        return {
          productId: product.id,
          quantity: quantity,
          costTry: product.costTry,
          costRub: product.costRub
        }
      })

      const totalAmount = purchaseItems.reduce((sum, item) => sum + (item.costRub * item.quantity), 0)

      // 1. Создать запись в истории закупок
      console.log('📝 Создание закупки в истории...')
      const purchaseResponse = await fetch('http://localhost:3011/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplier: purchaseForm.supplier || 'Аналитика закупок',
          items: purchaseItems,
          totalAmount: totalAmount,
          expectedDeliveryDate: purchaseForm.expectedDeliveryDate,
          comments: purchaseForm.comments,
          priority: purchaseForm.priority
        })
      })

      if (!purchaseResponse.ok) {
        console.warn('⚠️ API закупок недоступен, продолжаем без записи в историю')
      } else {
        console.log('✅ Закупка успешно записана в историю')
      }

      // 2. Добавить расход в систему расходов (опционально)
      try {
        await fetch('http://localhost:3011/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'Закупка товаров',
            amount: totalAmount,
            description: `Закупка ${selectedProductsForPurchase.length} товар${selectedProductsForPurchase.length === 1 ? '' : selectedProductsForPurchase.length < 5 ? 'а' : 'ов'} у поставщика "${purchaseForm.supplier}"`
          })
        })
        console.log('💰 Расход записан в систему')
      } catch (expenseError) {
        console.warn('⚠️ Не удалось записать расход:', expenseError)
      }

      // 3. Update products with new delivery statuses and inTransit amounts
      const updatedProducts = selectedProductsForPurchase.map(product => ({
        ...product,
        deliveryStatus: 'в_пути' as const,
        inTransit: product.toPurchase > 0 ? product.toPurchase : Math.max(1, product.minStock - product.stock),
        orderDate: new Date().toISOString()
      }))

      // Update the products state
      setProducts(prev => prev.map(p => {
        const updated = updatedProducts.find(up => up.id === p.id)
        return updated || p
      }))

      // Show success message
      const urgentProducts = selectedProductsForPurchase.filter(p => p.urgencyLevel === 'critical')
      const message = urgentProducts.length > 0
        ? `✅ Создана срочная закупка "${purchaseForm.supplier}" на ${selectedProductsForPurchase.length} товар${selectedProductsForPurchase.length === 1 ? '' : selectedProductsForPurchase.length < 5 ? 'а' : 'ов'} (${totalAmount.toLocaleString('ru-RU')} ₽)`
        : `✅ Создана закупка "${purchaseForm.supplier}" на ${selectedProductsForPurchase.length} товар${selectedProductsForPurchase.length === 1 ? '' : selectedProductsForPurchase.length < 5 ? 'а' : 'ов'} (${totalAmount.toLocaleString('ru-RU')} ₽)`

      alert(message)

      // Reset states
      setPurchaseModalOpen(false)
      setSelectedRows([])
      setSelectedProductsForPurchase([])
      setPurchaseForm({
        supplier: '',
        expectedDeliveryDate: '',
        comments: '',
        priority: 'normal'
      })
    } catch (error) {
      console.error('Ошибка при создании закупки:', error)
      alert('❌ Ошибка при создании закупки')
    }
  }, [selectedProductsForPurchase, purchaseForm])

  const handleReceiveGoods = useCallback(async (productId: number) => {
    try {
      // Найти товар
      const product = products.find(p => p.id === productId)
      if (!product) return

      // Создать диалог для ввода количества
      const receivedAmount = prompt(`Сколько единиц товара "${product.name}" получено?`, product.inTransit.toString())

      if (!receivedAmount || isNaN(Number(receivedAmount))) return

      const amount = Number(receivedAmount)
      if (amount <= 0 || amount > product.inTransit) {
        alert('Неверное количество товара')
        return
      }

      // Обновить остатки товара
      setProducts(prev => prev.map(p =>
        p.id === productId
          ? {
              ...p,
              stock: p.stock + amount,
              inTransit: p.inTransit - amount,
              deliveryStatus: p.inTransit - amount === 0 ? 'на_складе' : p.deliveryStatus
            }
          : p
      ))

      // Показать уведомление об успехе
      console.log(`✅ Оприходовано ${amount} шт. товара "${product.name}"`)

    } catch (error) {
      console.error('Ошибка при оприходовании товара:', error)
      alert('Ошибка при оприходовании товара')
    }
  }, [products])

  const handleBulkReceiveGoods = useCallback(() => {
    try {
      // Найти выбранные товары которые можно оприходовать (имеют товары в пути)
      const receivableProducts = filteredData.filter(p =>
        selectedRows.includes(p.id) && p.inTransit > 0
      )

      if (receivableProducts.length === 0) {
        alert('Выберите товары, которые находятся в пути для оприходования')
        return
      }

      setSelectedProductsForReceive(receivableProducts)
      setReceiveModalOpen(true)
    } catch (error) {
      console.error('Ошибка при открытии модального окна оприходования:', error)
      alert('❌ Ошибка при открытии модального окна оприходования')
    }
  }, [filteredData, selectedRows])

  // Handle receive confirmation from modal
  const handleReceiveConfirm = useCallback(() => {
    try {
      // Update products with received quantities
      setProducts(prev => prev.map(p => {
        const receivedProduct = selectedProductsForReceive.find(rp => rp.id === p.id)
        if (receivedProduct) {
          const receivedQty = receiveForm.actualQuantities[p.id] || 0
          return {
            ...p,
            stock: p.stock + receivedQty,
            inTransit: p.inTransit - receivedQty,
            deliveryStatus: (p.inTransit - receivedQty) === 0 ? 'на_складе' as const : p.deliveryStatus
          }
        }
        return p
      }))

      const totalReceived = Object.values(receiveForm.actualQuantities).reduce((sum: number, qty: any) => sum + (qty || 0), 0)

      alert(`✅ Успешно оприходовано ${selectedProductsForReceive.length} товар${selectedProductsForReceive.length === 1 ? '' : selectedProductsForReceive.length < 5 ? 'а' : 'ов'} (${totalReceived} шт)`)

      // Reset states
      setReceiveModalOpen(false)
      setSelectedRows([])
      setSelectedProductsForReceive([])
      setReceiveForm({
        receivedDate: new Date().toISOString().split('T')[0],
        actualQuantities: {},
        comments: '',
        logisticsCost: 0
      })
    } catch (error) {
      console.error('Ошибка при оприходовании товаров:', error)
      alert('❌ Ошибка при оприходовании товаров')
    }
  }, [selectedProductsForReceive, receiveForm.actualQuantities])

  // Helper functions with Premium Design (Aviasales/Linear/Notion style) - Dark Theme Optimized
  const getRowColor = (urgencyLevel: string) => {
    const isDark = theme.palette.mode === 'dark'

    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: isDark ? alpha('#ff6b6b', 0.08) : alpha('#ff4444', 0.05), // Brighter red for dark theme
          border: isDark ? alpha('#ff6b6b', 0.12) : alpha('#ff4444', 0.08),
          hover: isDark ? alpha('#ff6b6b', 0.12) : alpha('#ff4444', 0.08)
        }
      case 'warning':
        return {
          bg: isDark ? alpha('#ffa726', 0.08) : alpha('#ff9800', 0.05), // Brighter orange for dark theme
          border: isDark ? alpha('#ffa726', 0.12) : alpha('#ff9800', 0.08),
          hover: isDark ? alpha('#ffa726', 0.12) : alpha('#ff9800', 0.08)
        }
      default:
        return {
          bg: 'transparent',
          border: 'transparent',
          hover: isDark
            ? alpha(theme.palette.primary.main, 0.06)
            : alpha(theme.palette.action.hover, 0.04)
        }
    }
  }



  const getUrgencyIcon = (urgencyLevel: string) => {
    const isDark = theme.palette.mode === 'dark'

    switch (urgencyLevel) {
      case 'critical':
        return <Warning sx={{ color: isDark ? '#ff6b6b' : '#ff4444', fontSize: 18 }} />
      case 'warning':
        return <Schedule sx={{ color: isDark ? '#ffa726' : '#ff9800', fontSize: 18 }} />
      default:
        return <CheckCircle sx={{ color: isDark ? '#4ade80' : '#4caf50', fontSize: 18 }} />
    }
  }

  // Currency calculation functions
  const getCurrencyWithBuffer = (baseCurrency: number) => {
    return baseCurrency * (1 + currencyRates.buffer)
  }

  const getCurrencyDeviation = (current: number, planned: number) => {
    return ((current - planned) / planned) * 100
  }

  const getCurrencyStatus = (deviation: number) => {
    if (Math.abs(deviation) <= 2) return { color: 'success.main', text: 'Стабильно' }
    if (Math.abs(deviation) <= 5) return { color: 'warning.main', text: 'Внимание' }
    return { color: 'error.main', text: 'Риск' }
  }

  const formatCurrencyRate = (rate: number) => {
    return `${rate.toFixed(4)} ₽/₺`
  }

  const getDeliveryStatusDisplay = (status: string) => {
    switch (status) {
      case 'нужно_заказать':
        return {
          text: 'Нужно заказать',
          color: '#ff5722',
          bg: alpha('#ff5722', 0.1),
          icon: '🛍️'
        }
      case 'в_пути':
        return {
          text: 'В пути',
          color: '#2196f3',
          bg: alpha('#2196f3', 0.1),
          icon: '🚛'
        }
      case 'оплачено':
        return {
          text: 'Оплачено',
          color: '#4caf50',
          bg: alpha('#4caf50', 0.1),
          icon: '💳'
        }
      case 'на_складе':
        return {
          text: 'На складе',
          color: '#4caf50',
          bg: alpha('#4caf50', 0.1),
          icon: '📦'
        }
      case 'в_закупке':
        return {
          text: 'В закупке',
          color: '#ff9800',
          bg: alpha('#ff9800', 0.1),
          icon: '🛒'
        }
      case 'задержка':
        return {
          text: 'Задержка',
          color: '#f44336',
          bg: alpha('#f44336', 0.1),
          icon: '⚠️'
        }
      default:
        return {
          text: 'Неизвестно',
          color: '#757575',
          bg: alpha('#757575', 0.1),
          icon: '❓'
        }
    }
  }

  const getTurnoverStatusColor = (days: number) => {
    const isDark = theme.palette.mode === 'dark'

    if (days <= 15) {
      return {
        bg: isDark ? alpha('#4ade80', 0.15) : '#ECFDF5',
        color: isDark ? '#4ade80' : '#059669'
      }
    }
    if (days <= 60) {
      return {
        bg: isDark ? alpha('#ffa726', 0.15) : '#FEF3C7',
        color: isDark ? '#ffa726' : '#D97706'
      }
    }
    return {
      bg: isDark ? alpha('#9ca3af', 0.15) : '#F9FAFB',
      color: isDark ? '#9ca3af' : '#6B7280'
    }
  }

  // Handler для открытия модального окна товара
  const handleProductDetailClick = (product: Product) => {
    setSelectedProductDetail(product)
    setProductDetailModalOpen(true)
  }

  // Handler для быстрого добавления в корзину
  const handleQuickAddToCart = (productId: number) => {
    if (!selectedRows.includes(productId)) {
      setSelectedRows(prev => [...prev, productId])
    }
  }

  // Функция скрытия товара
  const handleHideProduct = async (productName: string) => {
    try {
      console.log(`👁️ Скрытие товара: ${productName}`)

      const response = await fetch(`http://localhost:3011/api/products/hide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productName, isHidden: true })
      })

      if (!response.ok) {
        throw new Error('Ошибка скрытия товара')
      }

      const result = await response.json()
      console.log('✅ Товар скрыт:', result)

      // Обновляем локальное состояние
      setProducts(prev => prev.map(product =>
        product.name === productName
          ? { ...product, isHidden: true }
          : product
      ))

    } catch (error) {
      console.error('❌ Ошибка скрытия товара:', error)
    }
  }

  // Функция показа товара
  const handleShowProduct = async (productName: string) => {
    try {
      console.log(`👁️ Показ товара: ${productName}`)

      const response = await fetch(`http://localhost:3011/api/products/hide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productName, isHidden: false })
      })

      if (!response.ok) {
        throw new Error('Ошибка показа товара')
      }

      const result = await response.json()
      console.log('✅ Товар показан:', result)

      // Обновляем локальное состояние
      setProducts(prev => prev.map(product =>
        product.name === productName
          ? { ...product, isHidden: false }
          : product
      ))

    } catch (error) {
      console.error('❌ Ошибка показа товара:', error)
    }
  }

  // Функция массового скрытия товаров
  const handleBulkHideProducts = async () => {
    try {
      console.log(`👁️ Массовое скрытие товаров: ${selectedRows.length} товаров`)

      // Получаем выбранные товары
      const selectedProducts = filteredData.filter(p => selectedRows.includes(p.id))

      // Подтверждение действия
      const productNames = selectedProducts.map(p => p.name).join(', ')
      const confirmText = selectedProducts.length === 1
        ? `Скрыть товар "${productNames}"?`
        : `Скрыть ${selectedProducts.length} товар${selectedProducts.length === 1 ? '' : selectedProducts.length < 5 ? 'а' : 'ов'}?\n\n${productNames.length > 100 ? productNames.substring(0, 100) + '...' : productNames}`

      if (!confirm(confirmText)) {
        return
      }

      // Скрываем каждый товар
      const hidePromises = selectedProducts.map(async (product) => {
        const response = await fetch(`http://localhost:3011/api/products/hide`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productName: product.name, isHidden: true })
        })

        if (!response.ok) {
          throw new Error(`Ошибка скрытия товара ${product.name}`)
        }

        return await response.json()
      })

      // Ждем выполнения всех запросов
      await Promise.all(hidePromises)

      console.log('✅ Товары скрыты массово:', selectedProducts.length)

      // Обновляем локальное состояние
      setProducts(prev => prev.map(product =>
        selectedRows.includes(product.id)
          ? { ...product, isHidden: true }
          : product
      ))

      // Очищаем выбор
      setSelectedRows([])

    } catch (error) {
      console.error('❌ Ошибка массового скрытия товаров:', error)
      alert('❌ Ошибка при скрытии товаров')
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              background: 'linear-gradient(135deg, #725CFF 0%, #BB61F9 50%, #F2445B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 1
            }}
          >
            Аналитика закупок
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Управление запасами и планирование закупок
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Интерактивные метрики */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: activeFilter === 'total' ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(0,0,0,0.4)'
                    : '0 8px 24px rgba(0,0,0,0.12)',
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
              onClick={() => {
                setActiveFilter(activeFilter === 'total' ? null : 'total')
                setShowOnlyNeedsPurchase(false)
                setSelectedCategory('Все категории')
              }}
            >
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">Всего товаров</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'primary.main', opacity: 0.7 }}>
                Показать все
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                border: `1px solid ${alpha('#ff4444', 0.2)}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: activeFilter === 'critical' ? alpha('#ff4444', 0.08) : 'transparent',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(255,68,68,0.3)'
                    : '0 8px 24px rgba(255,68,68,0.15)',
                  bgcolor: alpha('#ff4444', 0.05)
                }
              }}
              onClick={() => {
                setActiveFilter(activeFilter === 'critical' ? null : 'critical')
                setShowOnlyNeedsPurchase(false)
                setSelectedCategory('Все категории')
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: theme.palette.mode === 'dark' ? '#FF6B6B' : '#ff4444' }}>
                {stats.critical}
              </Typography>
              <Typography variant="body2" color="text.secondary">Критические</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: theme.palette.mode === 'dark' ? '#FF6B6B' : '#ff4444', opacity: 0.7 }}>
                Требуют внимания
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: activeFilter === 'needsPurchase' ? alpha(theme.palette.success.main, 0.08) : 'transparent',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(76,175,80,0.3)'
                    : '0 8px 24px rgba(76,175,80,0.15)',
                  bgcolor: alpha(theme.palette.success.main, 0.05)
                }
              }}
              onClick={() => {
                setActiveFilter(activeFilter === 'needsPurchase' ? null : 'needsPurchase')
                setShowOnlyNeedsPurchase(activeFilter !== 'needsPurchase')
                setSelectedCategory('Все категории')
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: theme.palette.mode === 'dark' ? '#4ADE80' : theme.palette.success.main }}>
                {stats.needsPurchase}
              </Typography>
              <Typography variant="body2" color="text.secondary">Нужна закупка</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: theme.palette.mode === 'dark' ? '#4ADE80' : theme.palette.success.main, opacity: 0.7 }}>
                Готовы к заказу
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                border: `1px solid ${alpha('#f44336', 0.2)}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: activeFilter === 'slowMovers' ? alpha('#f44336', 0.08) : 'transparent',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(244,67,54,0.3)'
                    : '0 8px 24px rgba(244,67,54,0.15)',
                  bgcolor: alpha('#f44336', 0.05)
                }
              }}
              onClick={() => {
                setActiveFilter(activeFilter === 'slowMovers' ? null : 'slowMovers')
                setShowOnlyNeedsPurchase(false)
                setSelectedCategory('Все категории')
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: theme.palette.mode === 'dark' ? '#F87171' : '#f44336' }}>
                {stats.slowMovers}
              </Typography>
              <Typography variant="body2" color="text.secondary">Медленно оборачиваемые</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: theme.palette.mode === 'dark' ? '#F87171' : '#f44336', opacity: 0.7 }}>
                Анализ требуется
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Финансовые метрики с улучшенными цветами */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              p: 2.5,
              textAlign: 'center',
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.2s ease'
            }}>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                mb: 0.5,
                color: theme.palette.mode === 'dark' ? '#BB86FC' : theme.palette.secondary.main
              }}>
                {formatCurrency(stats.totalPurchaseSum)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Сумма закупки</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              p: 2.5,
              textAlign: 'center',
              border: `1px solid ${alpha('#4caf50', 0.2)}`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(76,175,80,0.3)' : '0 4px 12px rgba(76,175,80,0.15)'
              },
              transition: 'all 0.2s ease'
            }}>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                mb: 0.5,
                color: theme.palette.mode === 'dark' ? '#4ADE80' : '#4caf50'
              }}>
                {formatCurrency(stats.potentialRevenue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Потенциальная выручка</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              p: 2.5,
              textAlign: 'center',
              border: `1px solid ${alpha('#ff9800', 0.2)}`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(255,152,0,0.3)' : '0 4px 12px rgba(255,152,0,0.15)'
              },
              transition: 'all 0.2s ease'
            }}>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                mb: 0.5,
                color: theme.palette.mode === 'dark' ? '#FFA726' : '#ff9800'
              }}>
                {stats.averageMargin.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">Средняя маржа</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              p: 2.5,
              textAlign: 'center',
              border: `1px solid ${alpha('#9c27b0', 0.2)}`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(156,39,176,0.3)' : '0 4px 12px rgba(156,39,176,0.15)'
              },
              transition: 'all 0.2s ease'
            }}>
              <Typography variant="h4" sx={{
                fontWeight: 700,
                mb: 0.5,
                color: theme.palette.mode === 'dark' ? '#E1BEE7' : '#9c27b0'
              }}>
                {formatCurrency(stats.totalExpenses)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Расходы остатков</Typography>
            </Paper>
          </Grid>
        </Grid>
      </motion.div>

      {/* Currency Chart and Delivery Lead Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <CurrencyChart
              data={mockCurrencyTrend}
              change={trendChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DeliveryLeadTimeCard
              leadTime={deliverySettings.deliveryLeadTime}
            />
          </Grid>
        </Grid>

                {/* Информация о выбранном периоде для расчета цен */}
        <Box sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{
            p: 1,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          }}>
            <Timeline sx={{ fontSize: 20, color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              Розничные цены рассчитаны за период:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {range.start && range.end
                ? `${range.start.toLocaleDateString('ru-RU')} — ${range.end.toLocaleDateString('ru-RU')} (${Math.ceil((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24))} дней)`
                : "Последние 30 дней (период по умолчанию)"
              }
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Simplified Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Paper sx={{
          p: 3,
          mb: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <TextField
              size="small"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              sx={{
                minWidth: 250,
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px', // rounded-md
                  padding: '6px 12px', // px-3 py-2
                  fontSize: '0.875rem', // text-sm
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // shadow-sm
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                  },
                  '&.Mui-focused': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }
              }}
            />

            {/* Analytics Filters */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Фильтры:
              </Typography>
              {[
                { key: 'all', label: 'Все товары', icon: '📦' },
                { key: 'lowStock', label: 'Скоро кончатся', icon: '⚠️' },
                { key: 'critical', label: 'Критичные', icon: '🔴' },
                { key: 'needsPurchase', label: 'Нужна закупка', icon: '🛒' }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={analyticsFilter === filter.key ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setAnalyticsFilter(filter.key as any)}
                  startIcon={<span style={{ fontSize: '12px' }}>{filter.icon}</span>}
                  sx={{
                    fontSize: '0.75rem',
                    px: 2,
                    py: 0.5,
                    borderRadius: '6px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    transition: 'all 0.15s ease',
                    ...(analyticsFilter === filter.key ? {
                      background: 'linear-gradient(135deg, #725CFF 0%, #BB61F9 100%)',
                      boxShadow: `0 2px 8px ${alpha('#725CFF', 0.3)}`,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5B4FE8 0%, #A855E8 100%)',
                        transform: 'translateY(-1px)'
                      }
                    } : {
                      borderColor: alpha(theme.palette.divider, 0.3),
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      }
                    })
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </Box>

            {/* Show Hidden Products Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showHiddenProducts}
                    onChange={(e) => setShowHiddenProducts(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    👁️ Показать скрытые
                  </Typography>
                }
                sx={{
                  m: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    letterSpacing: '-0.01em'
                  }
                }}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5 }}>
              {selectedRows.length > 0 && (
                (() => {
                  // Все выбранные товары (для универсальной закупки)
                  const selectedProducts = filteredData.filter(p =>
                    selectedRows.includes(p.id)
                  )

                  // Товары, которые требуют срочной закупки
                  const needsOrderProducts = selectedProducts.filter(p =>
                    p.deliveryStatus === 'нужно_заказать'
                  )

                  // Товары, которые можно оприходовать
                  const receivableProducts = selectedProducts.filter(p =>
                    p.deliveryStatus === 'в_пути' && p.inTransit > 0
                  )

                  return (
                    <>
                      {/* Универсальная кнопка создания закупки для любых товаров */}
                      <Button
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={handleCreatePurchaseOrder}
                        sx={{
                          fontFamily: 'inherit',
                          fontWeight: 600,
                          letterSpacing: '-0.01em',
                          borderRadius: 2,
                          px: 3,
                          background: needsOrderProducts.length > 0
                            ? 'linear-gradient(135deg, #725CFF 0%, #BB61F9 100%)' // Фиолетовый для срочных
                            : 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)', // Зеленый для обычных
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: needsOrderProducts.length > 0
                              ? 'linear-gradient(135deg, #5B4FE8 0%, #A855E8 100%)'
                              : 'linear-gradient(135deg, #3FCF6F 0%, #16A34A 100%)',
                            transform: 'translateY(-1px)',
                            boxShadow: needsOrderProducts.length > 0
                              ? '0 8px 24px rgba(114, 92, 255, 0.3)'
                              : '0 8px 24px rgba(74, 222, 128, 0.3)'
                          }
                        }}
                      >
                        {needsOrderProducts.length > 0 && needsOrderProducts.length === selectedProducts.length
                          ? `🔥 Срочная закупка (${selectedProducts.length})`
                          : needsOrderProducts.length > 0
                          ? `🔥 Смешанная закупка (${selectedProducts.length})`
                          : `Создать закупку (${selectedProducts.length})`
                        }
                      </Button>

                      {/* Кнопка оприходования для товаров в пути */}
                      {receivableProducts.length > 0 && (
                        <Button
                          variant="contained"
                          startIcon={<CheckCircle />}
                          onClick={handleBulkReceiveGoods}
                          sx={{
                            fontFamily: 'inherit',
                            fontWeight: 600,
                            letterSpacing: '-0.01em',
                            borderRadius: 2,
                            px: 3,
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)'
                            }
                          }}
                        >
                          Оприходовать ({receivableProducts.length})
                        </Button>
                      )}
                    </>
                  )
                })()
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Warning sx={{ color: 'error.main' }} />
            <Box>
              <Typography variant="h6" color="error.main">Ошибка загрузки данных</Typography>
              <Typography variant="body2" color="text.secondary">{error}</Typography>
              <Button
                variant="outlined"
                  size="small"
                onClick={handleRefresh}
                sx={{ mt: 1 }}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Загрузка...' : 'Попробовать снова'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Table Content */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Paper sx={{
            border: 'none',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.12)'
              : '0 1px 3px rgba(0,0,0,0.06)',
            borderRadius: 3
          }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
              <Table stickyHeader>
                <TableHead>
                  {/* Группировка колонок */}
                  <TableRow sx={{
                    bgcolor: theme.palette.background.paper,
                    boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
                    zIndex: 100
                  }}>
                    <TableCell
                      padding="checkbox"
                      sx={{
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        bgcolor: 'inherit',
                        py: theme.spacing(3)
                      }}
                    >
                      <Checkbox
                        checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                        indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                        onChange={handleSelectAll}
                        sx={{ borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        bgcolor: 'inherit',
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        py: theme.spacing(3)
                      }}
                    >
                      Товар
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={4}
                      sx={{
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        bgcolor: 'inherit',
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        py: theme.spacing(3)
                      }}
                    >
                      Остатки
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={5}
                      sx={{
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        bgcolor: 'inherit',
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        py: theme.spacing(3)
                      }}
                    >
                      Финансы
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      sx={{
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        bgcolor: 'inherit',
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        py: theme.spacing(3)
                      }}
                    >
                      Закупка
                    </TableCell>
                  </TableRow>
                  {/* Основные заголовки */}
                  <TableRow sx={{
                    bgcolor: theme.palette.background.paper,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}>
                    <TableCell
                      padding="checkbox"
                      sx={{
                        bgcolor: 'inherit',
                        py: '10px', // py-2.5
                        verticalAlign: 'middle'
                      }}
                    />
                    <TableCell sx={{
                      bgcolor: 'inherit',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.875rem', // text-sm
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      py: '10px', // py-2.5
                      verticalAlign: 'middle'
                    }}>Название</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: 'inherit',
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.875rem', // text-sm
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                        py: '10px', // py-2.5
                        verticalAlign: 'middle'
                      }}
                    >
                      Остаток
                    </TableCell>
                    <TableCell align="center" sx={{
                      bgcolor: 'inherit',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.875rem', // text-sm
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      py: '10px', // py-2.5
                      verticalAlign: 'middle'
                    }}>Дней до 0</TableCell>
                    <TableCell align="center" sx={{
                      bgcolor: 'inherit',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.875rem', // text-sm
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      py: '10px', // py-2.5
                      verticalAlign: 'middle'
                    }}>Оборачиваемость</TableCell>
                    <TableCell align="center" sx={{
                      bgcolor: 'inherit',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.875rem', // text-sm
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      py: '10px', // py-2.5
                      verticalAlign: 'middle'
                    }}>В Пути</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: 'inherit',
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.875rem', // text-sm
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                        py: '10px', // py-2.5
                        verticalAlign: 'middle'
                      }}
                    >
                      <Box component="span" sx={{
                        fontWeight: 500,
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827'
                      }}>
                        Себест.{' '}
                        <Box component="span" sx={{
                          fontSize: '0.875rem',
                          color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280'
                        }}>₺</Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{
                      bgcolor: 'inherit',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.875rem', // text-sm
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      py: '10px', // py-2.5
                      verticalAlign: 'middle'
                    }}>Логистика</TableCell>
                    <TableCell align="right" sx={{
                      bgcolor: 'inherit',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.875rem', // text-sm
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      py: '10px', // py-2.5
                      verticalAlign: 'middle'
                    }}>
                      <Box component="span" sx={{
                        fontWeight: 500,
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827'
                      }}>
                        Итого себест.{' '}
                        <Box component="span" sx={{
                          fontSize: '0.875rem',
                          color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280'
                        }}>₽</Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{
                      bgcolor: 'inherit',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.875rem', // text-sm
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      py: '10px', // py-2.5
                      verticalAlign: 'middle'
                    }}>
                      <Box component="span" sx={{
                        fontWeight: 500,
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827'
                      }}>
                        Розн. цена{' '}
                        <Box component="span" sx={{
                          fontSize: '0.875rem',
                          color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280'
                        }}>₽</Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{
                      bgcolor: 'inherit',
                      fontFamily: 'Inter, -apple-system, sans-serif',
                      fontWeight: 500,
                      fontSize: '0.875rem', // text-sm
                      color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                      py: '10px', // py-2.5
                      verticalAlign: 'middle'
                    }}>Маржа %</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: 'inherit',
                        fontFamily: 'Inter, -apple-system, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.875rem', // text-sm
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827',
                        py: '10px', // py-2.5
                        verticalAlign: 'middle'
                      }}
                    >
                      <Box component="span" sx={{
                        fontWeight: 500,
                        color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827'
                      }}>
                        Рекомендовано{' '}
                        <Box component="span" sx={{
                          fontSize: '0.875rem',
                          color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280'
                        }}>шт</Box>
                      </Box>
                    </TableCell>

                  </TableRow>
                </TableHead>
                                <TableBody>
                  {filteredData.map((product) => (
                    <TableRow
                      key={product.id}
                      sx={{
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, // border-b
                        transition: 'background-color 0.15s ease-in-out',
                        // Визуальное выделение скрытых товаров
                        opacity: product.isHidden ? 0.7 : 1,
                        backgroundColor: product.isHidden
                          ? alpha(theme.palette.grey[500], 0.05)
                          : 'transparent',
                        '&:hover': {
                          bgcolor: product.isHidden
                            ? alpha(theme.palette.grey[500], 0.1)
                            : alpha(theme.palette.primary.main, 0.02)
                        }
                      }}
                    >
                        <TableCell
                          padding="checkbox"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Checkbox
                            checked={selectedRows.includes(product.id)}
                            onChange={() => handleSelectRow(product.id)}
                            sx={{ borderRadius: 1.5 }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}> {/* flex gap-2 items-center */}
                            {getUrgencyIcon(product.urgencyLevel)}
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Inter, -apple-system, sans-serif',
                                fontWeight: 500, // font-medium
                                fontSize: '0.875rem', // text-sm
                                lineHeight: 1.25, // leading-tight
                                cursor: 'pointer',
                                color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827', // text-gray-900
                                transition: 'color 0.15s ease-in-out',
                                '&:hover': {
                                  color: theme.palette.primary.main
                                }
                              }}
                              onClick={() => handleProductDetailClick(product)}
                            >
                              {product.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '6px', // rounded-md
                              fontSize: '0.75rem', // text-xs
                              fontWeight: 500, // font-medium
                              px: '8px',
                              py: '4px',
                              color: product.stock <= 3 ?
                                (theme.palette.mode === 'dark' ? '#ff6b6b' : '#DC2626') :
                                product.stock <= 7 ?
                                (theme.palette.mode === 'dark' ? '#ffa726' : '#D97706') :
                                (theme.palette.mode === 'dark' ? '#4ade80' : '#059669'),
                              bgcolor: product.stock <= 3 ?
                                (theme.palette.mode === 'dark' ? alpha('#ff6b6b', 0.15) : '#FEF2F2') :
                                product.stock <= 7 ?
                                (theme.palette.mode === 'dark' ? alpha('#ffa726', 0.15) : '#FEF3C7') :
                                (theme.palette.mode === 'dark' ? alpha('#4ade80', 0.15) : '#ECFDF5'),
                            }}
                          >
                            {product.stock}{' '}
                            <Box component="span" sx={{
                              fontSize: '0.75rem',
                              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280',
                              ml: '2px'
                            }}>шт</Box>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Inter, -apple-system, sans-serif',
                              fontWeight: product.daysToZero <= 7 ? 600 : 500,
                              fontSize: '0.875rem', // text-sm
                              lineHeight: 1.25, // leading-tight
                              color: product.daysToZero <= 7 ?
                                (theme.palette.mode === 'dark' ? '#ff6b6b' : '#DC2626') :
                                (theme.palette.mode === 'dark' ? '#f9fafb' : '#111827')
                            }}
                          >
                            {product.daysToZero}{' '}
                            <Box component="span" sx={{
                              fontSize: '0.75rem',
                              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280'
                            }}>дн</Box>
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '6px', // rounded-md
                              fontSize: '0.75rem', // text-xs
                              fontWeight: 500, // font-medium
                              px: '8px',
                              py: '4px',
                              color: product.turnoverDays <= 30 ?
                                (theme.palette.mode === 'dark' ? '#4ade80' : '#059669') :
                                product.turnoverDays <= 60 ?
                                (theme.palette.mode === 'dark' ? '#ffa726' : '#D97706') :
                                (theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280'),
                              bgcolor: product.turnoverDays <= 30 ?
                                (theme.palette.mode === 'dark' ? alpha('#4ade80', 0.15) : '#ECFDF5') :
                                product.turnoverDays <= 60 ?
                                (theme.palette.mode === 'dark' ? alpha('#ffa726', 0.15) : '#FEF3C7') :
                                (theme.palette.mode === 'dark' ? alpha('#9ca3af', 0.15) : '#F9FAFB'),
                            }}
                          >
                            {product.turnoverDays}{' '}
                            <Box component="span" sx={{
                              fontSize: '0.75rem',
                              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280',
                              ml: '2px'
                            }}>дн</Box>
                          </Box>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          {product.inTransit > 0 ? (
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                borderRadius: '6px', // rounded-md
                                fontSize: '0.75rem', // text-xs
                                fontWeight: 500, // font-medium
                                px: '8px',
                                py: '4px',
                                color: theme.palette.mode === 'dark' ? '#ffa726' : '#D97706', // оранжевый спокойный
                                bgcolor: theme.palette.mode === 'dark' ? alpha('#ffa726', 0.15) : '#FEF3C7', // пастельный оранжевый
                                gap: '4px'
                              }}
                            >
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.mode === 'dark' ? '#ffa726' : '#D97706',
                                  animation: 'pulse 2s infinite'
                                }}
                              />
                              {product.inTransit}{' '}
                              <Box component="span" sx={{
                                fontSize: '0.75rem',
                                color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280',
                                ml: '2px'
                              }}>шт</Box>
                            </Box>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Inter, -apple-system, sans-serif',
                                fontSize: '0.875rem', // text-sm
                                color: theme.palette.mode === 'dark' ? '#9CA3AF' : '#9CA3AF', // text-gray-400
                                fontStyle: 'italic'
                              }}
                            >
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Inter, -apple-system, sans-serif',
                              fontSize: '0.875rem', // text-sm
                              lineHeight: 1.25, // leading-tight
                              fontWeight: 500,
                              color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827', // text-gray-900
                              textAlign: 'right'
                            }}
                          >
                            {formatCurrency(product.costTry, 'TRY')}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Inter, -apple-system, sans-serif',
                              fontSize: '0.875rem', // text-sm
                              lineHeight: 1.25, // leading-tight
                              fontWeight: 500,
                              color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280', // text-gray-500
                              textAlign: 'right'
                            }}
                          >
                            +{formatCurrency(product.expenses)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Inter, -apple-system, sans-serif',
                              fontWeight: 600,
                              fontSize: '0.875rem', // text-sm
                              lineHeight: 1.25, // leading-tight
                              color: theme.palette.mode === 'dark' ? '#f9fafb' : '#111827', // text-gray-900
                              textAlign: 'right'
                            }}
                          >
                            {formatCurrency(product.totalCostRub)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Inter, -apple-system, sans-serif',
                              fontWeight: 600,
                              fontSize: '0.875rem', // text-sm
                              lineHeight: 1.25, // leading-tight
                              color: theme.palette.mode === 'dark' ? '#4ade80' : '#059669', // зеленый для успеха
                              textAlign: 'right'
                            }}
                          >
                            {formatCurrency(product.retailPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: '6px', // rounded-md
                              fontSize: '0.75rem', // text-xs
                              fontWeight: 500, // font-medium
                              px: '8px',
                              py: '4px',
                              color: product.marginPercent > 40 ?
                                (theme.palette.mode === 'dark' ? '#4ade80' : '#059669') :
                                product.marginPercent > 20 ?
                                (theme.palette.mode === 'dark' ? '#ffa726' : '#D97706') :
                                (theme.palette.mode === 'dark' ? '#ff6b6b' : '#DC2626'),
                              bgcolor: product.marginPercent > 40 ?
                                (theme.palette.mode === 'dark' ? alpha('#4ade80', 0.15) : '#ECFDF5') :
                                product.marginPercent > 20 ?
                                (theme.palette.mode === 'dark' ? alpha('#ffa726', 0.15) : '#FEF3C7') :
                                (theme.palette.mode === 'dark' ? alpha('#ff6b6b', 0.15) : '#FEF2F2'),
                            }}
                          >
                            {Math.round(product.marginPercent)}%
                          </Box>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            py: '10px', // py-2.5
                            verticalAlign: 'middle'
                          }}
                        >
                          {product.toPurchase > 0 ? (
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Inter, -apple-system, sans-serif',
                                fontWeight: 600,
                                fontSize: '0.875rem', // text-sm
                                lineHeight: 1.25, // leading-tight
                                color: theme.palette.mode === 'dark' ? '#4ade80' : '#059669', // зеленый для успеха
                                textAlign: 'center'
                              }}
                            >
                              {Math.round(product.toPurchase)}{' '}
                              <Box component="span" sx={{
                                fontSize: '0.75rem',
                                color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6B7280'
                              }}>шт</Box>
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Inter, -apple-system, sans-serif',
                                color: '#9CA3AF', // text-gray-400
                                fontSize: '0.875rem', // text-sm
                                fontStyle: 'italic'
                              }}
                            >
                              —
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredData.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Paper sx={{ p: 8, textAlign: 'center', mt: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Search sx={{ fontSize: 48, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Товары не найдены
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Попробуйте изменить параметры поиска или фильтрации
            </Typography>
          </Paper>
        </motion.div>
      )}

            {/* Settings Dialog - Premium Modern Design with Theme Support */}
      <Dialog
        open={currencySettingsOpen}
        onClose={() => setCurrencySettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 24px 48px rgba(0,0,0,0.5)'
              : '0 24px 48px rgba(0,0,0,0.12)',
            bgcolor: theme.palette.mode === 'dark'
              ? theme.palette.background.paper
              : '#fafafa',
            fontFamily: 'Inter, "Golos Text", -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '-0.025em',
            border: theme.palette.mode === 'dark'
              ? `1px solid ${alpha(theme.palette.divider, 0.12)}`
              : 'none'
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, px: 3, pt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.15)
                  : 'white',
                color: theme.palette.mode === 'dark'
                  ? '#FFFFFF'
                  : theme.palette.text.primary,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(0,0,0,0.25)'
                  : '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <Settings sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: theme.palette.mode === 'dark'
                    ? '#FFFFFF'
                    : theme.palette.text.primary,
                  fontFamily: 'inherit',
                  letterSpacing: 'inherit'
                }}
              >
                Настройки закупок и логистики
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 400,
                  fontFamily: 'inherit',
                  color: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.8)'
                    : theme.palette.text.secondary
                }}
              >
                Информация о курсах валют и настройки доставки
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Currency Information Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '12px',
                bgcolor: theme.palette.mode === 'dark'
                  ? theme.palette.background.paper
                  : 'white',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.divider, 0.15)
                  : theme.palette.divider,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(0,0,0,0.25)'
                  : '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    lineHeight: 1
                  }}
                >
                  💱
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      mb: 0.5,
                      fontFamily: 'inherit',
                      letterSpacing: 'inherit',
                      color: theme.palette.mode === 'dark'
                        ? '#FFFFFF'
                        : theme.palette.text.primary
                    }}
                  >
                    Курс TRY → RUB
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      color: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.8)'
                        : theme.palette.text.secondary
                    }}
                  >
                    по данным ЦБ РФ + 5% буфер
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={6}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: 'inherit',
                      color: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.7)'
                        : theme.palette.text.secondary
                    }}
                  >
                    Текущий курс
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      color: theme.palette.mode === 'dark'
                        ? '#FFFFFF'
                        : theme.palette.text.primary,
                      fontFamily: 'inherit',
                      letterSpacing: 'inherit'
                    }}
                  >
                    {currencyApiData?.currentWithBuffer?.toFixed(4) || currencyRates.current.toFixed(4)} ₽/₺
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontFamily: 'inherit',
                      color: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.7)'
                        : theme.palette.text.secondary
                    }}
                  >
                    С буфером
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      color: theme.palette.mode === 'dark'
                        ? '#FFFFFF'
                        : theme.palette.text.primary,
                      fontFamily: 'inherit',
                      letterSpacing: 'inherit'
                    }}
                  >
                    {((currencyApiData?.currentWithBuffer || currencyRates.current) * 1.05).toFixed(4)} ₽/₺
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1.5,
                    pt: 1.5,
                    borderTop: '1px solid',
                    borderColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.divider, 0.15)
                      : alpha(theme.palette.divider, 0.5)
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.75rem',
                        fontFamily: 'inherit',
                        color: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.7)'
                          : theme.palette.text.secondary
                      }}
                    >
                      Источник: {currencyApiData?.source || currencyRates.source}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Delivery Settings Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '12px',
                bgcolor: theme.palette.mode === 'dark'
                  ? theme.palette.background.paper
                  : 'white',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.divider, 0.15)
                  : theme.palette.divider,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 2px 8px rgba(0,0,0,0.25)'
                  : '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    lineHeight: 1
                  }}
                >
                  🚚
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      mb: 0.5,
                      fontFamily: 'inherit',
                      letterSpacing: 'inherit',
                      color: theme.palette.mode === 'dark'
                        ? '#FFFFFF'
                        : theme.palette.text.primary
                    }}
                  >
                    Рукав доставки
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      color: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.8)'
                        : theme.palette.text.secondary
                    }}
                  >
                    Среднее количество дней от покупки до склада
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Рукав доставки"
                type="number"
                value={deliverySettings.deliveryLeadTime}
                onChange={(e) => setDeliverySettings(prev => ({
                  ...prev,
                  deliveryLeadTime: parseInt(e.target.value) || 14
                }))}
                inputProps={{
                  min: 1,
                  max: 90
                }}
                InputProps={{
                  endAdornment: (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontFamily: 'inherit' }}
                    >
                      дней
                    </Typography>
                  )
                }}
                helperText="Время с момента создания закупки до приезда товаров на склад"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    fontFamily: 'inherit'
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'inherit'
                  },
                  '& .MuiFormHelperText-root': {
                    fontFamily: 'inherit'
                  }
                }}
              />
            </Paper>

          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            onClick={() => setCurrencySettingsOpen(false)}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: '8px',
              px: 3,
              py: 1,
              fontWeight: 500,
              fontSize: '0.875rem',
              border: '1.5px solid',
              borderColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.divider, 0.3)
                : theme.palette.divider,
              color: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.8)'
                : theme.palette.text.secondary,
              fontFamily: 'inherit',
              letterSpacing: 'inherit',
              '&:hover': {
                borderColor: theme.palette.mode === 'dark'
                  ? '#FFFFFF'
                  : theme.palette.text.primary,
                color: theme.palette.mode === 'dark'
                  ? '#FFFFFF'
                  : theme.palette.text.primary,
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha('#FFFFFF', 0.08)
                  : alpha(theme.palette.text.primary, 0.04)
              }
            }}
          >
            Отменить
          </Button>
          <Button
            onClick={() => {
              // Сохранение настроек в localStorage
              localStorage.setItem('purchaseSettings', JSON.stringify({
                currencyRates,
                deliverySettings
              }))
              setCurrencySettingsOpen(false)
            }}
            variant="contained"
            size="large"
            startIcon={<Settings sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: '8px',
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: '0.875rem',
              bgcolor: theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.text.primary,
              color: '#FFFFFF',
              fontFamily: 'inherit',
              letterSpacing: 'inherit',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 2px 8px rgba(0,0,0,0.25)'
                : '0 2px 8px rgba(0,0,0,0.12)',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.8)
                  : alpha(theme.palette.text.primary, 0.9),
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 4px 16px rgba(0,0,0,0.35)'
                  : '0 4px 16px rgba(0,0,0,0.16)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Сохранить настройки
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Bar для массовых операций */}
      {selectedRows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1200
          }}
        >
          <Paper
            elevation={12}
            sx={{
              px: 4,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              borderRadius: '24px',
              bgcolor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.95)
                : alpha('#ffffff', 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 12px 32px rgba(0,0,0,0.5)'
                : '0 12px 32px rgba(0,0,0,0.15)',
              minWidth: 400
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                {selectedRows.length}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedRows.length} товар{selectedRows.length === 1 ? '' : selectedRows.length < 5 ? 'а' : 'ов'} выбрано
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Общая сумма: {formatCurrency(
                    filteredData
                      .filter(p => selectedRows.includes(p.id))
                      .reduce((sum, p) => {
                        // Для товаров с рекомендованным количеством используем его
                        // Для остальных товаров используем минимальное количество
                        const quantity = p.toPurchase > 0 ? p.toPurchase : Math.max(1, p.minStock - p.stock)
                        return sum + (p.costRub * quantity)
                      }, 0)
                  )}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
              <Button
                variant="outlined"
                  size="small"
                onClick={() => setSelectedRows([])}
                sx={{ borderRadius: '12px' }}
              >
                Отменить
              </Button>

              {(() => {
                // Все выбранные товары
                const selectedProducts = filteredData.filter(p =>
                  selectedRows.includes(p.id)
                )

                // Товары для срочной закупки
                const needsOrderProducts = selectedProducts.filter(p =>
                  p.deliveryStatus === 'нужно_заказать'
                )

                // Товары для оприходования
                const receivableProducts = selectedProducts.filter(p =>
                  ['в_пути', 'оплачено'].includes(p.deliveryStatus) && p.inTransit > 0
                )

                return (
                  <>
                    {/* Универсальная кнопка закупки для любых товаров */}
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<ShoppingCart />}
                      onClick={handleCreatePurchaseOrder}
                      sx={{
                        borderRadius: '12px',
                        px: 3,
                        background: needsOrderProducts.length > 0
                          ? 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' // Оранжевый для срочных
                          : 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)', // Синий для обычных
                        fontWeight: 600,
                        '&:hover': {
                          background: needsOrderProducts.length > 0
                            ? 'linear-gradient(135deg, #E55A2B 0%, #E8831A 100%)'
                            : 'linear-gradient(135deg, #1976D2 0%, #00ACC1 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: needsOrderProducts.length > 0
                            ? '0 8px 24px rgba(255, 107, 53, 0.35)'
                            : '0 8px 24px rgba(33, 150, 243, 0.35)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                                            {needsOrderProducts.length > 0 && needsOrderProducts.length === selectedProducts.length
                        ? `🔥 Срочная закупка (${selectedProducts.length})`
                        : needsOrderProducts.length > 0
                        ? `🔥 Смешанная закупка (${selectedProducts.length})`
                        : `Создать закупку (${selectedProducts.length})`
                      }
                    </Button>

                    {/* Кнопка оприходования для товаров в пути */}
                    {receivableProducts.length > 0 && (
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={<CheckCircle />}
                        onClick={handleBulkReceiveGoods}
                        sx={{
                          borderRadius: '12px',
                          px: 3,
                          background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #388E3C 0%, #689F38 100%)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.35)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Оприходовать ({receivableProducts.length})
                      </Button>
                    )}

                    {/* Кнопка скрытия товаров */}
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<Delete />}
                      onClick={handleBulkHideProducts}
                      sx={{
                        borderRadius: '12px',
                        px: 3,
                        borderColor: '#f44336',
                        color: '#f44336',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#d32f2f',
                          color: '#d32f2f',
                          backgroundColor: alpha('#f44336', 0.04),
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 16px rgba(244, 67, 54, 0.25)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Скрыть ({selectedProducts.length})
                    </Button>
                  </>
                )
              })()}
            </Box>
          </Paper>
        </motion.div>
      )}

      {/* Модальное окно детальной информации о товаре */}
      <Dialog
        open={productDetailModalOpen}
        onClose={() => setProductDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: theme.palette.mode === 'dark'
              ? theme.palette.background.paper
              : '#fafafa',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography sx={{ fontSize: '1.25rem' }}>📦</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {selectedProductDetail?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Детальная информация и история
            </Typography>
          </Box>
          <IconButton onClick={() => setProductDetailModalOpen(false)}>
            <Close />
                </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedProductDetail && (
            <Grid container spacing={3}>
              {/* Основная информация */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: 'background.paper' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    📊 Основные показатели
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Остаток на складе:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {selectedProductDetail.stock} шт.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Дней до нуля:</Typography>
                      <Typography sx={{
                        fontWeight: 600,
                        color: selectedProductDetail.daysToZero <= 5
                          ? 'error.main'
                          : selectedProductDetail.daysToZero <= 14
                          ? 'warning.main'
                          : 'success.main'
                      }}>
                        {selectedProductDetail.daysToZero} дней
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Продано за период:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {selectedProductDetail.sold} шт.
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Средний расход в день:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {selectedProductDetail.avgPerDay} шт/день
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Оборачиваемость:</Typography>
                      <Typography sx={{
                        fontWeight: 600,
                        color: getTurnoverStatusColor(selectedProductDetail.turnoverDays)
                      }}>
                        {selectedProductDetail.turnoverDays} дней
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Финансовая информация */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: '12px', bgcolor: 'background.paper' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    💰 Финансовые данные
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Себестоимость:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {selectedProductDetail.costTry} ₺ / {formatCurrency(selectedProductDetail.costRub)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Логистика:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatCurrency(selectedProductDetail.expenses)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Итого себестоимость:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatCurrency(selectedProductDetail.totalCostRub)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Розничная цена:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatCurrency(selectedProductDetail.retailPrice)}
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      pt: 1,
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}>
                      <Typography color="text.secondary">Маржа:</Typography>
                      <Typography sx={{
                        fontWeight: 600,
                        color: selectedProductDetail.marginPercent >= 40
                          ? 'success.main'
                          : selectedProductDetail.marginPercent >= 20
                          ? 'warning.main'
                          : 'error.main'
                      }}>
                        {selectedProductDetail.marginPercent}% ({formatCurrency(selectedProductDetail.marginRub)})
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              {/* Рекомендации к закупке */}
              <Grid item xs={12}>
                <Paper sx={{
                  p: 3,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                    🛒 Рекомендации к закупке
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {Math.round(selectedProductDetail.toPurchase)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Рекомендовано к закупке
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                          {formatCurrency(selectedProductDetail.purchaseSum)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Сумма закупки
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {formatCurrency(selectedProductDetail.profit)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Потенциальная прибыль
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => setProductDetailModalOpen(false)}
            sx={{ borderRadius: '8px' }}
          >
            Закрыть
          </Button>
          {selectedProductDetail && selectedProductDetail.toPurchase > 0 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                handleQuickAddToCart(selectedProductDetail.id)
                setProductDetailModalOpen(false)
              }}
              sx={{
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #725CFF 0%, #BB61F9 50%, #F2445B 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5B47E6 0%, #A854E0 50%, #D93842 100%)',
                }
              }}
            >
              Добавить в корзину
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Premium Modals */}
      <PremiumPurchaseModal
        open={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        products={selectedProductsForPurchase}
        purchaseForm={purchaseForm}
        setPurchaseForm={setPurchaseForm}
        onConfirm={handlePurchaseConfirm}
        theme={theme}
        formatCurrency={formatCurrency}
        onRemoveProduct={(productId: number) => {
          setSelectedProductsForPurchase(prev => prev.filter(p => p.id !== productId))
        }}
      />

      <PremiumReceiveModal
        open={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        products={selectedProductsForReceive}
        receiveForm={receiveForm}
        setReceiveForm={setReceiveForm}
        onConfirm={handleReceiveConfirm}
        theme={theme}
        formatCurrency={formatCurrency}
      />

      {/* CSS Animations for pulse effect */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Box>
  )
}

export default PremiumPurchaseAnalytics
