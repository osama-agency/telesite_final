'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'

import { motion } from 'framer-motion'

import { useCurrencyApi } from '@/hooks/useCurrencyApi'

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
  LocalShipping
} from '@mui/icons-material'

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
}

const categories = ['Все категории', 'Электроника', 'Компьютеры', 'Аудио', 'Техника для дома']
const periods = [
  { value: 7, label: '7 дней' },
  { value: 14, label: '14 дней' },
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' }
]

// Enhanced Currency Chart Component
const CurrencyChart = ({ data, change, currentRate }: { data: number[], change: number, currentRate: number }) => {
  const theme = useTheme()
  const width = 240
  const height = 60
  const padding = 8

  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 0.01

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2)
    const y = padding + ((max - value) / range) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  // Theme-aware colors
  const changeColor = change >= 0
    ? (theme.palette.mode === 'dark' ? '#4ADE80' : '#10b981')
    : (theme.palette.mode === 'dark' ? '#F87171' : '#ef4444')

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
          backgroundColor: alpha(changeColor, 0.1),
          borderRadius: 1.5,
          display: 'flex'
        }}>
          <Timeline sx={{ fontSize: 18, color: changeColor }} />
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: theme.palette.text.primary
          }}
        >
          Курс лиры (TRY/₽)
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <svg width={width} height={height} style={{
          backgroundColor: alpha(theme.palette.background.default, 0.5),
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="15" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 15" fill="none" stroke={alpha(theme.palette.divider, 0.1)} strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Currency trend line */}
          <polyline
            points={points}
            fill="none"
            stroke={changeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: `drop-shadow(0 2px 4px ${alpha(changeColor, 0.3)})`
            }}
          />

          {/* Data points */}
          {data.map((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - padding * 2)
            const y = padding + ((max - value) / range) * (height - padding * 2)
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={changeColor}
                opacity={index === data.length - 1 ? 1 : 0.6}
              />
            )
          })}
        </svg>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              letterSpacing: '-0.02em'
            }}
          >
            {currentRate.toFixed(4)} ₽
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.75rem'
            }}
          >
            Текущий курс
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant="body2"
            sx={{
              color: changeColor,
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.75rem'
            }}
          >
            за период
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

// Enhanced Delivery Lead Time Card
const DeliveryLeadTimeCard = ({ leadTime, onLeadTimeChange }: { leadTime: number, onLeadTimeChange: (days: number) => void }) => {
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

const PremiumPurchaseAnalytics = () => {
  const theme = useTheme()

  // API для получения курсов валют
  const { data: currencyApiData } = useCurrencyApi()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Все категории')
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [showOnlyNeedsPurchase, setShowOnlyNeedsPurchase] = useState(false)
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

  // Currency states
  const [currencyRates, setCurrencyRates] = useState({
    current: 3.45,        // Текущий курс ЦБ (read-only, получается с бэкенда)
    average30Days: 3.42,  // Средний за 30 дней
    planning: 3.42,       // Плановый курс (можно редактировать)
    buffer: 0.03,         // Буфер 3%
    lastUpdate: new Date().toISOString(),
    source: 'Загрузка...'  // Источник курса
  })

  // Delivery settings
  const [deliverySettings, setDeliverySettings] = useState({
    deliveryLeadTime: 14,  // Рукав доставки в днях (время с момента создания закупки до приезда на склад)
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
      return Math.max(totalNeeded - stock, 0)
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

  // Функция для получения статистики продаж из заказов
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

      // Группируем продажи по товарам
      const salesByProduct: Record<string, { totalSold: number, totalRevenue: number, prices: number[] }> = {}

      orders.forEach((order: any) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productName = item.name || item.product_name
            if (productName) {
              if (!salesByProduct[productName]) {
                salesByProduct[productName] = { totalSold: 0, totalRevenue: 0, prices: [] }
              }
              salesByProduct[productName].totalSold += item.quantity || 1
              const price = item.price || item.unit_price || 0
              salesByProduct[productName].totalRevenue += price * (item.quantity || 1)
              if (price > 0) {
                salesByProduct[productName].prices.push(price)
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
  }, [])

  // Load products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Сначала получаем данные продаж
      const salesData = await fetchSalesData()

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

            // Реальные остатки из API (если есть поле stock)
            const stock = apiProduct.stock || Math.floor(Math.random() * 50) + 1

            // Рассчитываем среднее потребление на основе реальных продаж за выбранный период
            const daysInPeriod = selectedPeriod
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

            // Средняя розничная цена из реальных продаж
            const averageRetailPrice = productSalesData.prices.length > 0
              ? productSalesData.prices.reduce((sum: number, price: number) => sum + price, 0) / productSalesData.prices.length
              : totalCostRub * (1.3 + Math.random() * 0.7) // fallback

            const retailPrice = averageRetailPrice
            const sold = productSalesData.totalSold || Math.floor(Math.random() * 20) + 1
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
            urgencyLevel: calculateUrgencyLevel(stock, avgPerDay, minStock, deliverySettings.deliveryLeadTime)
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
  }, [currencyRates.current, selectedPeriod, fetchSalesData, deliverySettings.deliveryLeadTime])

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

      // Active filter logic
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

      return matchesSearch && matchesCategory && needsPurchase && matchesActiveFilter
    })

    return customSort(filtered)
  }, [products, searchQuery, selectedCategory, showOnlyNeedsPurchase, activeFilter])

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
      // Найти выбранные товары со статусом "Нужно заказать"
      const needsOrderProducts = filteredData.filter(p =>
        selectedRows.includes(p.id) && p.deliveryStatus === 'нужно_заказать'
      )

      if (needsOrderProducts.length === 0) {
        alert('Выберите товары, которые нужно заказать')
        return
      }

      // Создать заказ на закупку (здесь можно добавить диалог подтверждения)
      const totalSum = needsOrderProducts.reduce((sum, p) => sum + p.purchaseSum, 0)
      const confirmed = confirm(
        `Создать закупку на сумму ${formatCurrency(totalSum)} для ${needsOrderProducts.length} товаров?`
      )

      if (!confirmed) return

      // Обновить статус товаров на "В пути"
      setProducts(prev => prev.map(p =>
        needsOrderProducts.some(np => np.id === p.id)
          ? { ...p, deliveryStatus: 'в_пути' as const }
          : p
      ))

      // Очистить выбранные строки
      setSelectedRows([])

      alert(`Создана закупка на ${needsOrderProducts.length} товаров на сумму ${formatCurrency(totalSum)}`)
    } catch (error) {
      console.error('Ошибка при создании закупки:', error)
      alert('Ошибка при создании закупки')
    }
  }, [filteredData, selectedRows])

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

  // Helper functions
  const getRowColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: alpha('#ff4444', 0.08),
          border: alpha('#ff4444', 0.2),
          hover: alpha('#ff4444', 0.12)
        }
      case 'warning':
        return {
          bg: alpha('#ffa726', 0.08),
          border: alpha('#ffa726', 0.2),
          hover: alpha('#ffa726', 0.12)
        }
      default:
        return {
          bg: 'transparent',
          border: alpha(theme.palette.divider, 0.1),
          hover: alpha(theme.palette.action.hover, 0.08)
        }
    }
  }

  const formatCurrency = (value: number, currency: 'RUB' | 'TRY' = 'RUB') => {
    return currency === 'TRY'
      ? `${value.toLocaleString('tr-TR')} ₺`
      : `${value.toLocaleString('ru-RU')} ₽`
  }

  const getUrgencyIcon = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'critical':
        return <Warning sx={{ color: '#ff4444', fontSize: 18 }} />
      case 'warning':
        return <Schedule sx={{ color: '#ffa726', fontSize: 18 }} />
      default:
        return <CheckCircle sx={{ color: '#4caf50', fontSize: 18 }} />
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
    if (days <= 30) return '#4caf50' // быстрая оборачиваемость
    if (days <= 60) return '#ff9800' // средняя оборачиваемость
    return '#f44336' // медленная оборачиваемость
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
              currentRate={currencyRates.current}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DeliveryLeadTimeCard
              leadTime={deliverySettings.deliveryLeadTime}
              onLeadTimeChange={(days) => setDeliverySettings({...deliverySettings, deliveryLeadTime: days})}
            />
          </Grid>
        </Grid>
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
                  borderRadius: 2,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                  }
                }
              }}
            />

            {/* Actions */}
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5 }}>
              {selectedRows.length > 0 && (
                (() => {
                  const needsOrderProducts = filteredData.filter(p =>
                    selectedRows.includes(p.id) && p.deliveryStatus === 'нужно_заказать'
                  )

                  if (needsOrderProducts.length > 0) {
                    return (
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
                          background: 'linear-gradient(135deg, #725CFF 0%, #BB61F9 100%)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5B4FE8 0%, #A855E8 100%)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 8px 24px rgba(114, 92, 255, 0.3)'
                          }
                        }}
                      >
                        Создать закупку ({needsOrderProducts.length})
                      </Button>
                    )
                  }
                  return null
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
          <Paper sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
              <Table stickyHeader>
                <TableHead>
                  {/* Группировка колонок */}
                  <TableRow sx={{
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.95) : alpha('#fafafa', 0.95),
                    backdropFilter: 'blur(10px)'
                  }}>
                    <TableCell
                      padding="checkbox"
                      sx={{
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit'
                      }}
                    >
                      <Checkbox
                        checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                        indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit',
                        fontWeight: 700,
                        fontSize: '0.875rem'
                      }}
                    >
                      ОСНОВНАЯ ИНФОРМАЦИЯ
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={4}
                      sx={{
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: theme.palette.mode === 'dark' ? '#FF6B6B' : '#ff4444'
                      }}
                    >
                      📦 ОСТАТКИ И СТАТУС
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={5}
                      sx={{
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: theme.palette.mode === 'dark' ? '#4ADE80' : '#4caf50'
                      }}
                    >
                      💰 ФИНАНСОВЫЕ ДАННЫЕ
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      sx={{
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: theme.palette.mode === 'dark' ? '#BB86FC' : theme.palette.secondary.main
                      }}
                    >
                      🛒 РЕКОМЕНДАЦИИ К ЗАКУПКЕ
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit',
                        fontWeight: 700,
                        fontSize: '0.875rem'
                      }}
                    >
                      ДЕЙСТВИЯ
                    </TableCell>
                  </TableRow>
                  {/* Основные заголовки */}
                  <TableRow sx={{
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : alpha('#fafafa', 0.8),
                    backdropFilter: 'blur(8px)'
                  }}>
                    <TableCell
                      padding="checkbox"
                      sx={{
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit'
                      }}
                    />
                    <TableCell sx={{ bgcolor: 'inherit', backdropFilter: 'inherit', fontWeight: 600 }}>Товар</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit',
                        fontWeight: 600,
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                      }}
                    >
                      Остаток
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'inherit', backdropFilter: 'inherit', fontWeight: 600 }}>Дней до нуля</TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'inherit', backdropFilter: 'inherit', fontWeight: 600 }}>Оборачиваемость</TableCell>
                    <TableCell align="center" sx={{ bgcolor: 'inherit', backdropFilter: 'inherit', fontWeight: 600 }}>Статус</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit',
                        fontWeight: 600,
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                      }}
                    >
                      Себест. ₺
                    </TableCell>
                    <TableCell align="right" sx={{ bgcolor: 'inherit', backdropFilter: 'inherit', fontWeight: 600 }}>Логистика</TableCell>
                    <TableCell align="right" sx={{ bgcolor: 'inherit', backdropFilter: 'inherit', fontWeight: 600 }}>Итого себест.</TableCell>
                    <TableCell align="right" sx={{ bgcolor: 'inherit', backdropFilter: 'inherit', fontWeight: 600 }}>Розн. цена</TableCell>
                    <TableCell align="right" sx={{ bgcolor: 'inherit', backdropFilter: 'inherit', fontWeight: 600 }}>Маржа %</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit',
                        fontWeight: 600,
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                      }}
                    >
                      Рекомендовано
                    </TableCell>
                    <TableCell align="right" sx={{ bgcolor: 'inherit', backdropFilter: 'inherit', fontWeight: 600 }}>Сумма закупки</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        bgcolor: 'inherit',
                        backdropFilter: 'inherit',
                        fontWeight: 600,
                        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                      }}
                    >
                      Действия
                    </TableCell>
                  </TableRow>
                </TableHead>
                                <TableBody>
                  {filteredData.map((product) => (
                    <TableRow
                      key={product.id}
                      sx={{
                        bgcolor: getRowColor(product.urgencyLevel).bg,
                        '&:hover': {
                          bgcolor: getRowColor(product.urgencyLevel).hover
                        }
                      }}
                    >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRows.includes(product.id)}
                            onChange={() => handleSelectRow(product.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getUrgencyIcon(product.urgencyLevel)}
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  color: 'primary.main',
                                  textDecoration: 'underline',
                                  textDecorationColor: 'transparent',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    textDecorationColor: 'primary.main',
                                    color: 'primary.dark'
                                  }
                                }}
                                onClick={() => handleProductDetailClick(product)}
                              >
                                {product.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${product.stock} шт`}
                            size="small"
                            color={product.stock <= 3 ? 'error' : product.stock <= 7 ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: product.daysToZero <= 7 ? '#ff4444' : 'text.primary'
                            }}
                          >
                            {product.daysToZero}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${product.turnoverDays} дн.`}
                            size="small"
                            sx={{
                              bgcolor: alpha(getTurnoverStatusColor(product.turnoverDays), 0.1),
                              color: getTurnoverStatusColor(product.turnoverDays),
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getDeliveryStatusDisplay(product.deliveryStatus).text}
                            size="small"
                            sx={{
                              bgcolor: getDeliveryStatusDisplay(product.deliveryStatus).bg,
                              color: getDeliveryStatusDisplay(product.deliveryStatus).color,
                              fontWeight: 500,
                              '&::before': {
                                content: `"${getDeliveryStatusDisplay(product.deliveryStatus).icon}"`,
                                mr: 0.5
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {formatCurrency(product.costTry, 'TRY')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'warning.main' }}>
                            +{formatCurrency(product.expenses)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {formatCurrency(product.totalCostRub)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                            {formatCurrency(product.retailPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${product.marginPercent}%`}
                            size="small"
                            color={product.marginPercent > 40 ? 'success' : product.marginPercent > 20 ? 'warning' : 'error'}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {product.toPurchase > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                              <Chip
                                label={`${product.toPurchase} шт`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                              />
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => handleQuickAddToCart(product.id)}
                                sx={{
                                  fontSize: '0.7rem',
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: '6px',
                                  minWidth: 'auto',
                                  fontWeight: 500,
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  borderColor: alpha(theme.palette.primary.main, 0.3),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    borderColor: theme.palette.primary.main,
                                    transform: 'scale(1.05)'
                                  }
                                }}
                              >
                                В корзину
                              </Button>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              color: product.toPurchase > 0 ? 'primary.main' : 'text.secondary'
                            }}
                          >
                            {product.toPurchase > 0 ? formatCurrency(product.purchaseSum) : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {product.toPurchase > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => handleOpenPurchaseDrawer(product)}
                                sx={{ color: 'success.main' }}
                              >
                                <Add />
                </IconButton>
                            )}
                            <IconButton
                              size="small"
                              onClick={(e) => handleActionMenu(product.id, e)}
                            >
                              <MoreVert />
                            </IconButton>
                          </Box>
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
                      .reduce((sum, p) => sum + p.purchaseSum, 0)
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
                const needsOrderProducts = filteredData.filter(p =>
                  selectedRows.includes(p.id) && p.deliveryStatus === 'нужно_заказать'
                )

                if (needsOrderProducts.length > 0) {
                  return (
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<ShoppingCart />}
                      onClick={handleCreatePurchaseOrder}
                      sx={{
                        borderRadius: '12px',
                        px: 3,
                        background: 'linear-gradient(135deg, #725CFF 0%, #BB61F9 50%, #F2445B 100%)',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5B47E6 0%, #A854E0 50%, #D93842 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 24px rgba(114, 92, 255, 0.35)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Оприходовать ({needsOrderProducts.length})
                    </Button>
                  )
                }

                return (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<Visibility />}
                    disabled
                    sx={{
                      borderRadius: '12px',
                      px: 3
                    }}
                  >
                    Уже в закупке
                  </Button>
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
                          {selectedProductDetail.toPurchase}
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
    </Box>
  )
}

export default PremiumPurchaseAnalytics
