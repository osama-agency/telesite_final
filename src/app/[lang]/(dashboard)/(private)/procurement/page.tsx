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

// Components Imports (unused imports removed)

// Types
interface Product {
  id: number
  name: string
  sku: string
  currentStock: number
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
  id: number
  date: string
  supplier?: string
  items: number
  totalAmount: number
  status: 'paid' | 'partial' | 'pending'
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
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
  // States
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [costTry, setCostTry] = useState<string>('')
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [exchangeRate] = useState(3.5) // Курс лиры к рублю
  const [tabValue, setTabValue] = useState(0)
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([])
  const [isUrgentPurchase, setIsUrgentPurchase] = useState(false)

  // Отладка: логируем тип purchaseHistory
  console.log('🔍 purchaseHistory type check:', {
    isArray: Array.isArray(purchaseHistory),
    type: typeof purchaseHistory,
    length: purchaseHistory?.length,
    value: purchaseHistory
  })

  // Загрузка списка товаров
  useEffect(() => {
    // Убеждаемся что purchaseHistory инициализирован как массив
    if (!Array.isArray(purchaseHistory)) {
      setPurchaseHistory([])
    }

    fetchProducts()
    fetchPurchaseHistory()

    // Получить курс из настроек
    // fetchExchangeRate()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products.map((p: any) => ({
          id: p.id,
          name: p.productName,
          sku: p.sku || `SKU-${p.id}`,
          currentStock: p.stockQty || 0
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
      console.log('📋 Загрузка истории закупок...')
      const response = await fetch('http://localhost:3010/api/purchases')
      const data = await response.json()

      if (data.success && data.data && Array.isArray(data.data.purchases)) {
        console.log(`✅ Загружено ${data.data.pagination.total} закупок`)

        // Преобразуем данные для отображения
        const formattedPurchases = data.data.purchases.map((p: any) => ({
          id: p.id,
          date: new Date(p.createdAt).toISOString(),
          supplier: p.isUrgent ? '🔥 Срочная закупка' : 'Обычная закупка',
          items: p.items.length,
          totalAmount: parseFloat(p.totalCost),
          status: 'pending' as const
        }))

        setPurchaseHistory(formattedPurchases)
      } else {
        console.warn('⚠️ Неожиданный формат данных:', data)
        setPurchaseHistory([])
      }
    } catch (error) {
      console.error('❌ Error fetching purchase history:', error)
      setPurchaseHistory([])
      showSnackbar('Не удалось загрузить историю закупок', 'error')
    }
  }

  // Добавление позиции в черновой список
  const handleAddItem = () => {
    if (!selectedProduct || !costTry || quantity < 1) {
      showSnackbar('Заполните все поля', 'error')

      return
    }

    const costTryNum = parseFloat(costTry)
    const costRub = costTryNum * exchangeRate
    const totalRub = costRub * quantity

    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      product: selectedProduct,
      quantity,
      costTry: costTryNum,
      costRub,
      totalRub
    }

    setPurchaseItems([...purchaseItems, newItem])

    // Очистка формы
    setSelectedProduct(null)
    setQuantity(1)
    setCostTry('')
  }

  // Удаление позиции из списка
  const handleRemoveItem = (id: string) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id))
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

      // 1. Создать запись purchase с автоматической отправкой в Telegram
      const purchaseResponse = await fetch('http://localhost:3010/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isUrgent: isUrgentPurchase,
          items: purchaseItems.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.costTry,
            total: item.costTry * item.quantity // Общая сумма в лирах
          }))
        })
      })

      if (!purchaseResponse.ok) {
        const errorData = await purchaseResponse.json()
        throw new Error(errorData.error || 'Failed to create purchase')
      }

      const purchaseData = await purchaseResponse.json()

      console.log('✅ Закупка создана:', purchaseData)

      // 2. Обновить остатки товаров (если есть такой API)
      for (const item of purchaseItems) {
        try {
          await fetch(`/api/products/${item.product.id}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quantity: item.quantity,
              operation: 'add'
            })
          })
        } catch (error) {
          console.warn('Не удалось обновить остатки товара:', item.product.name, error)
        }
      }

      // 3. Добавить расход в Expenses
      try {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'Закупка товаров',
            amount: totals.totalAmount,
            description: `Закупка ${totals.totalPositions} позиций`
          })
        })
      } catch (error) {
        console.warn('Не удалось добавить расход:', error)
      }

      showSnackbar(`Закупка #${purchaseData.data.id.split('_')[1]} создана и отправлена в Telegram! 📱`, 'success')
      setPurchaseItems([])
      fetchPurchaseHistory()

    } catch (error) {
      console.error('Error saving purchase:', error)
      showSnackbar('Ошибка при сохранении закупки', 'error')
    } finally {
      setSaving(false)
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
        handleSavePurchase()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [purchaseItems])

  // Принудительная защита от undefined purchaseHistory
  const safePurchaseHistory = Array.isArray(purchaseHistory) ? purchaseHistory : []

  // Дополнительная защита - убеждаемся что все map() используют safe версию
  useEffect(() => {
    if (!Array.isArray(purchaseHistory)) {
      console.error('⚠️ purchaseHistory is not an array:', typeof purchaseHistory, purchaseHistory)
      setPurchaseHistory([])
    }
  }, [purchaseHistory])

  return (
    <>
      <Typography variant="h4" sx={{ mb: 4 }}>Закупка</Typography>

      <Grid container spacing={3}>
        {/* 1. Форма добавления позиции */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Добавление позиции</Typography>

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
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.sku} • Остаток: {option.currentStock} шт
                          </Typography>
                        </Box>
                      </Box>
                    )}
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
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleAddItem}
                    size="large"
                    sx={{ height: 56 }}
                  >
                    Добавить в список
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Черновой список позиций и итоги */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
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
                        <TableRow key={item.id}>
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
                              <i className='bx-trash' />
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
          <Card>
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
                      startIcon={saving ? <CircularProgress size={20} /> : <i className='bx-save' />}
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
          <Card>
            <CardContent>
              <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                <Tab label="История закупок" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>№</TableCell>
                        <TableCell>Дата</TableCell>
                        <TableCell>Поставщик</TableCell>
                        <TableCell>Позиции × сумма ₽</TableCell>
                        <TableCell>Статус</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {!Array.isArray(safePurchaseHistory) || safePurchaseHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              История закупок пуста
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        safePurchaseHistory.map((purchase) => (
                          <TableRow key={purchase.id}>
                            <TableCell>{purchase.id}</TableCell>
                            <TableCell>
                              {new Date(purchase.date).toLocaleDateString('ru-RU')}
                            </TableCell>
                            <TableCell>{purchase.supplier || '—'}</TableCell>
                            <TableCell>
                              {purchase.items} × {purchase.totalAmount.toLocaleString('ru-RU')} ₽
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  purchase.status === 'paid' ? 'Оплачено' :
                                  purchase.status === 'partial' ? 'Частично' :
                                  'Ожидает'
                                }
                                color={
                                  purchase.status === 'paid' ? 'success' :
                                  purchase.status === 'partial' ? 'warning' :
                                  'default'
                                }
                                size="small"
                              />
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ProcurementPage
