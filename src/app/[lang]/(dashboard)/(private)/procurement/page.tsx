'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Tooltip from '@mui/material/Tooltip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import { alpha, useTheme } from '@mui/material/styles'

// Icons
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import InventoryIcon from '@mui/icons-material/Inventory'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'

// Types
interface Product {
  id: number
  name: string
  sku: string
  currentStock: number
  costPriceTRY?: number // Себестоимость в лирах из базы
}

interface PurchaseItem {
  id: string
  product: Product
  quantity: number
  costTry: number
  costRub: number
  totalRub: number
}

interface Purchase {
  id: string
  sequenceId: number
  date: string
  statusUpdatedAt: string
  supplier?: string
  items: PurchaseItem[]
  totalAmount: number
  logisticsCost: number
  status: 'pending' | 'paid' | 'in_transit' | 'delivering' | 'received' | 'cancelled'
  isUrgent?: boolean
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface ReceiveItemForm {
  productId: number
  productName: string
  expectedQuantity: number
  actualQuantity: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const ProcurementPage = () => {
  const theme = useTheme()

  // States
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [costTry, setCostTry] = useState<string>('')
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [exchangeRate] = useState(2.13) // Обновленный курс лиры к рублю
  const [tabValue, setTabValue] = useState(0)
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([])
  const [isUrgentPurchase, setIsUrgentPurchase] = useState(false)

  // Оприходование
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [receivingPurchase, setReceivingPurchase] = useState<Purchase | null>(null)
  const [receiveItems, setReceiveItems] = useState<ReceiveItemForm[]>([])
  const [logisticsCost, setLogisticsCost] = useState<string>('')
  const [receivingComment, setReceivingComment] = useState('')

  // Загрузка списка товаров
  useEffect(() => {
    fetchProducts()
    fetchPurchaseHistory()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products.map((p: any) => ({
          id: p.id,
          name: p.productName || p.name,
          sku: p.sku || `SKU-${p.id}`,
          currentStock: p.stockQty || p.stock_quantity || 0,
          costPriceTRY: p.costPriceTRY || p.cost_price_try // Себестоимость из базы
        })))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      showSnackbar('Ошибка загрузки товаров', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchPurchaseHistory = async () => {
    try {
      const response = await fetch('/api/purchases')
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setPurchaseHistory(data.data)
      } else {
        // Fallback с тестовыми данными
        const mockPurchases: Purchase[] = [
        {
            id: 'purchase_1001',
            date: '2024-12-10T10:00:00.000Z',
          supplier: 'Основной поставщик',
            items: [
              {
                id: 'item-1',
                product: { id: 1, name: 'Attex 40mg', sku: 'SKU-1', currentStock: 5 },
                quantity: 10,
                costTry: 85.50,
                costRub: 182.12,
                totalRub: 1821.15
              },
              {
                id: 'item-2',
                product: { id: 2, name: 'Atominex 25mg', sku: 'SKU-2', currentStock: 3 },
                quantity: 20,
                costTry: 120.00,
                costRub: 255.60,
                totalRub: 5112.00
              }
            ],
            totalAmount: 6933.15,
            status: 'in_transit',
            isUrgent: false
        },
        {
            id: 'purchase_1002',
            date: '2024-12-08T14:30:00.000Z',
          supplier: '🔥 Срочная закупка',
            items: [
              {
                id: 'item-3',
                product: { id: 3, name: 'Strattera 10mg', sku: 'SKU-3', currentStock: 0 },
                quantity: 15,
                costTry: 95.00,
                costRub: 202.35,
                totalRub: 3035.25
              }
            ],
            totalAmount: 3035.25,
            status: 'received',
            isUrgent: true
        }
      ]
      setPurchaseHistory(mockPurchases)
      }
    } catch (error) {
      console.error('❌ Error fetching purchase history:', error)
      setPurchaseHistory([])
      showSnackbar('Не удалось загрузить историю закупок', 'error')
    }
  }

  // Добавление позиции в черновой список (БЕЗ ДУБЛИРОВАНИЯ)
  const handleAddItem = () => {
    if (!selectedProduct || !costTry || quantity < 1) {
      showSnackbar('Заполните все поля', 'error')
      return
    }

    // Проверяем, есть ли уже этот товар в списке
    const existingItemIndex = purchaseItems.findIndex(item => item.product.id === selectedProduct.id)

    const costTryNum = parseFloat(costTry)
    const costRub = costTryNum * exchangeRate
    const totalRub = costRub * quantity

    if (existingItemIndex >= 0) {
      // Обновляем существующую позицию
      const updatedItems = [...purchaseItems]
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        totalRub: updatedItems[existingItemIndex].totalRub + totalRub
      }
      setPurchaseItems(updatedItems)
      showSnackbar(`Количество ${selectedProduct.name} увеличено на ${quantity}`, 'success')
    } else {
      // Добавляем новую позицию
    const newItem: PurchaseItem = {
        id: `item-${Date.now()}-${selectedProduct.id}`,
      product: selectedProduct,
      quantity,
      costTry: costTryNum,
      costRub,
      totalRub
    }
    setPurchaseItems([...purchaseItems, newItem])
      showSnackbar(`${selectedProduct.name} добавлен в закупку`, 'success')
    }

    // Очистка формы
    setSelectedProduct(null)
    setQuantity(1)
    setCostTry('')
  }

  // Автозаполнение себестоимости при выборе товара
  useEffect(() => {
    if (selectedProduct && selectedProduct.costPriceTRY) {
      setCostTry(selectedProduct.costPriceTRY.toString())
    }
  }, [selectedProduct])

  // Удаление позиции из списка
  const handleRemoveItem = (id: string) => {
    const itemToRemove = purchaseItems.find(item => item.id === id)
    setPurchaseItems(purchaseItems.filter(item => item.id !== id))
    if (itemToRemove) {
      showSnackbar(`${itemToRemove.product.name} удален из закупки`, 'success')
    }
  }

  // Расчет итогов
  const totals = useMemo(() => {
    const totalPositions = purchaseItems.length
    const totalAmount = purchaseItems.reduce((sum, item) => sum + item.totalRub, 0)

    return { totalPositions, totalAmount }
  }, [purchaseItems])

  // Сохранение закупки
  const handleSavePurchase = async () => {
    if (purchaseItems.length === 0) {
      showSnackbar('Добавьте хотя бы одну позицию', 'error')
      return
    }

    try {
      setSaving(true)

      // Создать закупку в базе данных
      const purchaseResponse = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isUrgent: isUrgentPurchase,
          items: purchaseItems.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.costTry,
            total: item.totalRub
          })),
          totalCost: totals.totalAmount
        })
      })

      if (!purchaseResponse.ok) {
        throw new Error('Ошибка создания закупки')
      }

      const purchaseData = await purchaseResponse.json()

      // Добавить расход в Expenses
      try {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'Закупка товаров',
            amount: totals.totalAmount,
            description: `Закупка ${totals.totalPositions} позиций ${isUrgentPurchase ? '(срочная)' : ''}`
          })
        })
      } catch (error) {
        console.warn('Не удалось добавить расход:', error)
      }

      // Отправить уведомление в Telegram
      try {
        const telegramMessage = `📦 *ЗАКУПКА #${purchaseData.data?.sequenceId || 'unknown'}*\n\n` +
          `🔥 ${isUrgentPurchase ? 'СРОЧНАЯ ЗАКУПКА' : 'Обычная закупка'}\n` +
          `📊 Позиций: ${totals.totalPositions}\n` +
          `💰 Сумма: ${totals.totalAmount.toLocaleString('ru-RU')} ₽\n\n` +
          `📋 *Состав закупки:*\n` +
          purchaseItems.map(item =>
            `• ${item.product.name} - ${item.quantity} шт × ${item.costTry.toFixed(2)} ₺`
          ).join('\n')

        console.log('📤 Отправляю уведомление в Telegram:', {
          message: telegramMessage,
          type: 'purchase',
          purchaseId: purchaseData.data?.id,
          currentStatus: 'pending'
        })

        const telegramResponse = await fetch('/api/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: telegramMessage,
            type: 'purchase',
            purchaseId: purchaseData.data?.id,
            currentStatus: 'pending'
          })
        })

        const telegramResult = await telegramResponse.json()
        console.log('📥 Ответ от Telegram API:', telegramResult)

        if (!telegramResponse.ok) {
          throw new Error(`Telegram API error: ${JSON.stringify(telegramResult)}`)
        }
      } catch (telegramError) {
        console.error('❌ Ошибка отправки в Telegram:', telegramError)
        showSnackbar('Не удалось отправить уведомление в Telegram', 'error')
      }

      showSnackbar(`Закупка #${purchaseData.data?.sequenceId || 'unknown'} создана успешно! 📦`, 'success')
      setPurchaseItems([])
      setIsUrgentPurchase(false)
      fetchPurchaseHistory()

    } catch (error) {
      console.error('Error saving purchase:', error)
      showSnackbar('Ошибка при сохранении закупки', 'error')
    } finally {
      setSaving(false)
        }
      }

  // Обновление статуса закупки
  const handleStatusChange = async (purchaseId: string, newStatus: 'pending' | 'paid' | 'in_transit' | 'delivering' | 'received' | 'cancelled') => {
        try {
      // Обновляем статус в базе данных
      const response = await fetch(`/api/purchases/${purchaseId}/status`, {
            method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Ошибка обновления статуса')
      }

      // Обновляем локальное состояние
      setPurchaseHistory(prev => prev.map(purchase =>
        purchase.id === purchaseId
          ? { ...purchase, status: newStatus }
          : purchase
      ))

      // Отправляем обновление в Telegram
      try {
        const purchase = safePurchaseHistory.find(p => p.id === purchaseId)
        if (purchase) {
          const statusEmoji = {
            pending: '⏳',
            paid: '💰',
            in_transit: '🚚',
            delivering: '🚛',
            received: '✅',
            cancelled: '❌'
          }

          const statusText = {
            pending: 'Ожидает',
            paid: 'Оплачено',
            in_transit: 'В пути',
            delivering: 'Доставляется',
            received: 'Получено',
            cancelled: 'Отменено'
          }

          const telegramMessage = `🔄 *ОБНОВЛЕНИЕ СТАТУСА ЗАКУПКИ #${purchase.sequenceId}*\n\n` +
            `${statusEmoji[newStatus]} *Новый статус:* ${statusText[newStatus]}\n\n` +
            `📊 Позиций: ${purchase.items.length}\n` +
            `💰 Сумма: ${purchase.totalAmount.toLocaleString('ru-RU')} ₽\n\n` +
            `📋 *Состав закупки:*\n` +
            purchase.items.map(item =>
              `• ${item.product.name} - ${item.quantity} шт`
            ).join('\n')

          await fetch('/api/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: telegramMessage,
              type: 'info'
            })
          })
        }
      } catch (telegramError) {
        console.warn('Не удалось отправить обновление в Telegram:', telegramError)
      }

      const updatedPurchase = safePurchaseHistory.find(p => p.id === purchaseId)
      showSnackbar(`Статус закупки #${updatedPurchase?.sequenceId || purchaseId} обновлен`, 'success')

    } catch (error) {
      console.error('Error updating purchase status:', error)
      showSnackbar('Ошибка при обновлении статуса', 'error')
    }
  }

  // Открыть модальное окно оприходования
  const handleOpenReceiveModal = (purchase: Purchase) => {
    setReceivingPurchase(purchase)
    setReceiveItems(purchase.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      expectedQuantity: item.quantity,
      actualQuantity: item.quantity // По умолчанию ожидаемое количество
    })))
    setLogisticsCost('')
    setReceivingComment('')
    setReceiveModalOpen(true)
  }

  // Оприходование товаров
  const handleReceiveGoods = async () => {
    if (!receivingPurchase) return

    try {
      // Обновить статус закупки
      await fetch(`/api/purchases/${receivingPurchase.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'received' })
      })

      // Обновить остатки товаров
      for (const item of receiveItems) {
        if (item.actualQuantity > 0) {
          try {
            await fetch(`/api/products/${item.productId}/stock`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quantity: item.actualQuantity,
              operation: 'add'
            })
          })
        } catch (error) {
            console.warn('Не удалось обновить остатки товара:', item.productName, error)
          }
        }
      }

      // Добавить расход на логистику, если указан
      if (logisticsCost && parseFloat(logisticsCost) > 0) {
      try {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              category: 'Логистика',
              amount: parseFloat(logisticsCost),
              description: `Логистика по закупке #${receivingPurchase.sequenceId}${receivingComment ? '. ' + receivingComment : ''}`
          })
        })
      } catch (error) {
          console.warn('Не удалось добавить расход на логистику:', error)
        }
      }

      showSnackbar(`Закупка #${receivingPurchase.sequenceId} успешно оприходована! 📦`, 'success')
      setReceiveModalOpen(false)
      fetchPurchaseHistory()

    } catch (error) {
      console.error('Error receiving goods:', error)
      showSnackbar('Ошибка при оприходовании товаров', 'error')
    }
  }

  // Показать уведомление
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  // Обработка горячих клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (receiveModalOpen) {
          handleReceiveGoods()
        } else {
        handleSavePurchase()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [purchaseItems, receiveModalOpen])

  const safePurchaseHistory = Array.isArray(purchaseHistory) ? purchaseHistory : []

  return (
    <>
      <Typography variant="h4" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ShoppingCartIcon color="primary" />
        Система закупок
      </Typography>

      <Grid container spacing={3}>
        {/* 1. Форма добавления позиции */}
        <Grid size={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon />
                Добавление товара в закупку
              </Typography>

              <Grid container spacing={2} alignItems="flex-end">
                <Grid size={{ xs: 12, md: 4 }}>
                  <Autocomplete
                    value={selectedProduct}
                    onChange={(_, newValue) => setSelectedProduct(newValue)}
                    options={products}
                    getOptionLabel={(option) => `${option.name} (${option.sku})`}
                    loading={loading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Выберите товар"
                        variant="outlined"
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      const { key, ...otherProps } = props;
                      return (
                        <Box component="li" key={key} {...otherProps}>
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.sku} • Остаток: {option.currentStock} шт
                              {option.costPriceTRY && ` • Себес: ${option.costPriceTRY} ₺`}
                          </Typography>
                        </Box>
                      </Box>
                      );
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField
                    label="Количество"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    fullWidth
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label="Себестоимость"
                    value={costTry}
                    onChange={(e) => setCostTry(e.target.value.replace(/[^0-9.]/g, ''))}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">₺</InputAdornment>,
                    }}
                    placeholder="0.00"
                    helperText={selectedProduct?.costPriceTRY ? `Из базы: ${selectedProduct.costPriceTRY} ₺` : ''}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleAddItem}
                    size="large"
                    sx={{ height: 56 }}
                    startIcon={<InventoryIcon />}
                  >
                    Добавить в список
                  </Button>
                </Grid>
              </Grid>

              {costTry && quantity && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Сумма: {(parseFloat(costTry) * quantity).toFixed(2)} ₺ = {(parseFloat(costTry) * quantity * exchangeRate).toFixed(2)} ₽
                  (курс: 1₺ = {exchangeRate}₽)
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Черновой список позиций и итоги */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Черновой список позиций</Typography>

              {purchaseItems.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Список пуст. Добавьте позиции через форму выше.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Товар</TableCell>
                        <TableCell align="right">Кол-во</TableCell>
                        <TableCell align="right">Себес ₺</TableCell>
                        <TableCell align="right">Себес ₽</TableCell>
                        <TableCell align="right">Сумма ₽</TableCell>
                        <TableCell align="center">Действия</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {purchaseItems.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Typography variant="body2">{item.product.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.product.sku}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.costTry.toFixed(2)} ₺</TableCell>
                          <TableCell align="right">{item.costRub.toFixed(2)} ₽</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {item.totalRub.toFixed(2)} ₽
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 3. Итоги закупки */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Итоги закупки</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="body2" color="text.secondary">
                    Всего позиций
                  </Typography>
                  <Typography variant="h4">
                    {totals.totalPositions}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Общая сумма
                  </Typography>
                  <Typography variant="h4">
                    {totals.totalAmount.toLocaleString('ru-RU')} ₽
                  </Typography>
                </Paper>

                <Alert severity="info" icon={false}>
                  <Typography variant="caption">
                    Курс: 1 ₺ = {exchangeRate} ₽
                  </Typography>
                </Alert>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isUrgentPurchase}
                      onChange={(e) => setIsUrgentPurchase(e.target.checked)}
                      color="error"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>Срочная закупка</span>
                      <Typography variant="caption" color="text.secondary">
                        (будет помечена 🔥)
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 1 }}
                />

                <Tooltip title="Или используйте ⌘+Enter">
                  <span>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={handleSavePurchase}
                      disabled={purchaseItems.length === 0 || saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                      {saving ? 'Сохранение...' : 'Сохранить закупку'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 4. История закупок */}
        <Grid size={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                  <Tab
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        📋 История закупок
                        <Chip
                          label={safePurchaseHistory.length}
                          size="small"
                          color="primary"
                          sx={{ ml: 1, minWidth: 'auto', height: 20 }}
                        />
                      </Box>
                    }
                  />
              </Tabs>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    placeholder="Поиск по ID или товарам..."
                    variant="outlined"
                    sx={{
                      minWidth: 250,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          🔍
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 2
                    }}
                  >
                    📊 Фильтры
                  </Button>
                </Box>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    '& .MuiTable-root': {
                      minWidth: 1200
                    }
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F1F28' : '#F8F9FA',
                            borderBottom: theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.08)',
                            color: theme.palette.mode === 'dark' ? 'text.secondary' : '#6B7280',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            py: 2.5
                          }}
                        >
                          ID
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F1F28' : '#F8F9FA',
                            borderBottom: theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.08)',
                            color: theme.palette.mode === 'dark' ? 'text.secondary' : '#6B7280',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            py: 2.5
                          }}
                        >
                          СОЗДАНО
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F1F28' : '#F8F9FA',
                            borderBottom: theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.08)',
                            color: theme.palette.mode === 'dark' ? 'text.secondary' : '#6B7280',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            py: 2.5
                          }}
                        >
                          ОБНОВЛЕНО
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F1F28' : '#F8F9FA',
                            borderBottom: theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.08)',
                            color: theme.palette.mode === 'dark' ? 'text.secondary' : '#6B7280',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            py: 2.5
                          }}
                        >
                          ТОВАРЫ
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F1F28' : '#F8F9FA',
                            borderBottom: theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.08)',
                            color: theme.palette.mode === 'dark' ? 'text.secondary' : '#6B7280',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            py: 2.5
                          }}
                        >
                          СУММА
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F1F28' : '#F8F9FA',
                            borderBottom: theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.08)',
                            color: theme.palette.mode === 'dark' ? 'text.secondary' : '#6B7280',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            py: 2.5
                          }}
                        >
                          СТАТУС
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F1F28' : '#F8F9FA',
                            borderBottom: theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.08)',
                            color: theme.palette.mode === 'dark' ? 'text.secondary' : '#6B7280',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            py: 2.5
                          }}
                        >
                          РАСХОДЫ
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? '#1F1F28' : '#F8F9FA',
                            borderBottom: theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.08)',
                            color: theme.palette.mode === 'dark' ? 'text.secondary' : '#6B7280',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            py: 2.5,
                            width: '80px'
                          }}
                        >
                          <i className="bx-dots-horizontal-rounded" style={{ fontSize: '1rem', opacity: 0.4 }} />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {safePurchaseHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                              <Box
                                sx={{
                                  fontSize: '4rem',
                                  opacity: 0.3,
                                  filter: 'grayscale(1)'
                                }}
                              >
                                📋
                              </Box>
                              <Typography variant="h6" color="text.secondary" fontWeight={500}>
                              История закупок пуста
                            </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Создайте первую закупку, чтобы увидеть её здесь
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        safePurchaseHistory.map((purchase) => (
                          <TableRow
                            key={purchase.id}
                            sx={{
                              borderBottom: theme.palette.mode === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.05)'
                                : '1px solid rgba(0, 0, 0, 0.06)',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark'
                                  ? alpha(theme.palette.action.hover, 0.02)
                                  : alpha(theme.palette.action.hover, 0.04),
                                transition: 'all 0.15s ease'
                              },
                              ...(purchase.status === 'cancelled' && {
                                opacity: 0.6,
                                textDecoration: 'line-through'
                              })
                            }}
                          >
                            {/* ID заказа */}
                            <TableCell sx={{ py: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {purchase.isUrgent && (
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: 'error.main',
                                      flexShrink: 0
                                    }}
                                  />
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    fontSize: '0.875rem',
                                    fontFamily: 'monospace'
                                  }}
                                >
                                  #{purchase.sequenceId || purchase.id.split('_')[1] || purchase.id.slice(-4)}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Дата оформления */}
                            <TableCell sx={{ py: 3 }}>
                              <Box>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                              {new Date(purchase.date).toLocaleDateString('ru-RU')}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                  {new Date(purchase.date).toLocaleTimeString('ru-RU', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Дата обновления */}
                            <TableCell>
                              <Tooltip
                                title={
                                  <Box
                                    sx={{
                                      bgcolor: theme.palette.mode === 'dark' ? '#2A2B36' : 'background.paper',
                                      color: theme.palette.mode === 'dark' ? '#C7C9D9' : 'text.primary',
                                      p: 1.5,
                                      borderRadius: 2,
                                      border: theme.palette.mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(0, 0, 0, 0.1)',
                                      boxShadow: theme.palette.mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.6)'
                                        : '0 8px 32px rgba(0, 0, 0, 0.12)'
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: theme.palette.mode === 'dark' ? '#C7C9D9' : 'text.primary',
                                        fontSize: '0.875rem'
                                      }}
                                    >
                                      Последнее обновление: {new Date(purchase.statusUpdatedAt || purchase.date).toLocaleString('ru-RU')}
                                    </Typography>
                                  </Box>
                                }
                                arrow
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      bgcolor: 'transparent !important',
                                      boxShadow: 'none !important',
                                      p: 0,
                                      maxWidth: 'none'
                                    }
                                  },
                                  arrow: {
                                    sx: {
                                      color: theme.palette.mode === 'dark' ? '#2A2B36' : 'background.paper',
                                      '&::before': {
                                        border: theme.palette.mode === 'dark'
                                          ? '1px solid rgba(255, 255, 255, 0.1)'
                                          : '1px solid rgba(0, 0, 0, 0.1)'
                                      }
                                    }
                                  }
                                }}
                              >
                                <Box sx={{ cursor: 'help' }}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {new Date(purchase.statusUpdatedAt || purchase.date).toLocaleDateString('ru-RU')}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(purchase.statusUpdatedAt || purchase.date).toLocaleTimeString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </TableCell>

                            {/* Товары */}
                            <TableCell>
                              <Tooltip
                                title={
                                  <Box
                                    sx={{
                                      bgcolor: theme.palette.mode === 'dark' ? '#2A2B36' : 'background.paper',
                                      color: theme.palette.mode === 'dark' ? '#C7C9D9' : 'text.primary',
                                      p: 2,
                                      borderRadius: 2,
                                      border: theme.palette.mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(0, 0, 0, 0.1)',
                                      boxShadow: theme.palette.mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.6)'
                                        : '0 8px 32px rgba(0, 0, 0, 0.12)'
                                    }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      sx={{
                                        mb: 1,
                                        color: theme.palette.mode === 'dark' ? '#C7C9D9' : 'text.primary',
                                        fontWeight: 600
                                      }}
                                    >
                                      Состав закупки:
                                    </Typography>
                                    {purchase.items.map((item, index) => (
                                      <Typography
                                        key={index}
                                        variant="body2"
                                        sx={{
                                          mb: 0.5,
                                          color: theme.palette.mode === 'dark' ? '#B0B0C3' : 'text.secondary',
                                          fontSize: '0.875rem'
                                        }}
                                      >
                                        • {item.product.name} - {item.quantity} шт
                                      </Typography>
                                    ))}
                                  </Box>
                                }
                                arrow
                                placement="left"
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      bgcolor: 'transparent !important',
                                      boxShadow: 'none !important',
                                      p: 0,
                                      maxWidth: 'none'
                                    }
                                  },
                                  arrow: {
                                    sx: {
                                      color: theme.palette.mode === 'dark' ? '#2A2B36' : 'background.paper',
                                      '&::before': {
                                        border: theme.palette.mode === 'dark'
                                          ? '1px solid rgba(255, 255, 255, 0.1)'
                                          : '1px solid rgba(0, 0, 0, 0.1)'
                                }
                                    }
                                  }
                                }}
                              >
                                <Button
                                  variant="outlined"
                                size="small"
                                  sx={{
                                    minWidth: 'auto',
                                    borderRadius: 2,
                                    px: 2,
                                    py: 0.5,
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: 2
                                    }
                                  }}
                                >
                                  {purchase.items.length} поз.
                                </Button>
                              </Tooltip>
                            </TableCell>

                            {/* Общая сумма */}
                            <TableCell align="right" sx={{ py: 3 }}>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                                  {purchase.totalAmount.toLocaleString('ru-RU')} ₽
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                  ~{(purchase.totalAmount / 2.13).toFixed(0)} ₺
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Статус */}
                            <TableCell sx={{ py: 3 }}>
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 250 }}>
                                {[
                                  { key: 'pending', label: 'Ожидает', color: '#f59e0b' },
                                  { key: 'paid', label: 'Оплачено', color: '#10b981' },
                                  { key: 'in_transit', label: 'В пути', color: '#3b82f6' },
                                  { key: 'delivering', label: 'Доставляется', color: '#8b5cf6' },
                                  { key: 'received', label: 'Получено', color: '#6366f1' },
                                  { key: 'cancelled', label: 'Отменено', color: '#ef4444' }
                                ].map((status) => (
                                  <Button
                                    key={status.key}
                                    size="small"
                                    variant={purchase.status === status.key ? 'contained' : 'outlined'}
                                    onClick={() => handleStatusChange(purchase.id, status.key as any)}
                                    disabled={purchase.status === 'cancelled'}
                                    sx={{
                                      minWidth: 'auto',
                                      fontSize: '0.6875rem',
                                      fontWeight: 500,
                                      textTransform: 'none',
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: 1,
                                      transition: 'all 0.15s ease',
                                      ...(purchase.status === status.key ? {
                                        bgcolor: status.color,
                                        borderColor: status.color,
                                        color: 'white',
                                        '&:hover': {
                                          bgcolor: status.color,
                                          opacity: 0.9
                                        }
                                      } : {
                                        color: status.color,
                                        borderColor: alpha(status.color, 0.3),
                                        bgcolor: 'transparent',
                                        '&:hover': {
                                          bgcolor: alpha(status.color, 0.08),
                                          borderColor: status.color
                                        }
                                      }),
                                      '&:disabled': {
                                        opacity: 0.5,
                                        cursor: 'not-allowed'
                                      }
                                    }}
                                  >
                                    {status.label}
                                  </Button>
                                ))}
                              </Box>
                            </TableCell>

                            {/* Расходы на закупку */}
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {purchase.logisticsCost ? `${purchase.logisticsCost.toLocaleString('ru-RU')} ₽` : '—'}
                                </Typography>
                                {purchase.logisticsCost > 0 && (
                                  <Typography variant="caption" color="text.secondary">
                                    Логистика
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>

                            {/* Действия */}
                            <TableCell align="center" sx={{ py: 3 }}>
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                                {(purchase.status === 'in_transit' || purchase.status === 'delivering' || purchase.status === 'paid') && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleOpenReceiveModal(purchase)}
                                    sx={{
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                      textTransform: 'none',
                                      color: 'success.main',
                                      borderColor: 'success.main',
                                      bgcolor: 'transparent',
                                      px: 1.5,
                                      py: 0.5,
                                      minWidth: 'auto',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.success.main, 0.08),
                                        borderColor: 'success.main'
                                      }
                                    }}
                                  >
                                    Оприходовать
                                  </Button>
                                )}
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.action.hover, 0.08)
                                    }
                                  }}
                                >
                                  <i className="bx-dots-horizontal-rounded" style={{ fontSize: '1rem' }} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Модальное окно оприходования */}
      <Dialog
        open={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? '#1B1C24' : 'background.paper',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: 'success.main'
        }}>
          <LocalShippingIcon />
          Оприходование товаров - Закупка #{receivingPurchase?.sequenceId}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Укажите фактическое количество полученного товара и расходы на логистику
          </Typography>

          {/* Список товаров для оприходования */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Товар</TableCell>
                  <TableCell align="center">Ожидалось</TableCell>
                  <TableCell align="center">Получено</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receiveItems.map((item, index) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Typography variant="body2">{item.productName}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {item.expectedQuantity} шт
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        value={item.actualQuantity}
                        onChange={(e) => {
                          const newItems = [...receiveItems]
                          newItems[index].actualQuantity = Math.max(0, parseInt(e.target.value) || 0)
                          setReceiveItems(newItems)
                        }}
                        inputProps={{ min: 0, max: item.expectedQuantity * 2 }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          {/* Расходы на логистику */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Расходы на логистику"
                value={logisticsCost}
                onChange={(e) => setLogisticsCost(e.target.value.replace(/[^0-9.]/g, ''))}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                }}
                placeholder="0.00"
                helperText="Будет добавлено в расходы"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Комментарий"
                value={receivingComment}
                onChange={(e) => setReceivingComment(e.target.value)}
                placeholder="Особенности поставки..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setReceiveModalOpen(false)}>
            Отмена
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleReceiveGoods}
            startIcon={<SaveIcon />}
          >
            Оприходовать товары
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          suppressHydrationWarning
        >
          <span suppressHydrationWarning>{snackbar.message}</span>
        </Alert>
      </Snackbar>
    </>
  )
}

export default ProcurementPage
