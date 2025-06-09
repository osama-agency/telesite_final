'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Button
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  ShowChart as ShowChartIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import MarginChart from '@/components/financial/MarginChart'
import TurnoverChart from '@/components/financial/TurnoverChart'

interface ProductAnalytics {
  id: number
  name: string
  costPriceTRY: number
  costPriceRUB: number
  retailPrice: number
  margin: number
  marginPercent: string
  roi: string
  stockQuantity: number
  salesQuantity: number
  salesRevenue: number
  turnover: string
  profit: string
  stockValue: string
  potentialRevenue: string
}

interface FinancialStats {
  totalStockValue: string
  totalPotentialRevenue: string
  totalSalesRevenue: string
  totalProfit: string
  averageMargin: string
  averageROI: string
}

export default function FinancialAnalyticsPage() {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductAnalytics[]>([])
  const [stats, setStats] = useState<FinancialStats | null>(null)

  useEffect(() => {
    fetchFinancialAnalytics()
  }, [])

  const fetchFinancialAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3011/api/prices/analytics')
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products)
        setStats(data.data.stats)
      } else {
        setError('Ошибка загрузки данных')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | string, currency: string = '₽') => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num) + ' ' + currency
  }

  const getMarginColor = (percent: number) => {
    if (percent >= 80) return theme.palette.success.main
    if (percent >= 60) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const getROIColor = (roi: number) => {
    if (roi >= 300) return theme.palette.success.main
    if (roi >= 150) return theme.palette.warning.main
    return theme.palette.error.main
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          💰 Финансовая аналитика
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchFinancialAnalytics}
          disabled={loading}
        >
          Обновить
        </Button>
      </Box>

      {/* Статистические карточки */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Стоимость склада
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats && formatCurrency(stats.totalStockValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Потенциальная выручка
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats && formatCurrency(stats.totalPotentialRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ShowChartIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Средняя маржа
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats?.averageMargin}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AttachMoneyIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Средний ROI
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats?.averageROI}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Графики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <MarginChart products={products} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TurnoverChart products={products} />
        </Grid>
      </Grid>

      {/* Таблица товаров */}
      <Card>
        <CardHeader
          title="Детальная аналитика по товарам"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell>Товар</TableCell>
                  <TableCell align="right">Себест. ₺</TableCell>
                  <TableCell align="right">Себест. ₽</TableCell>
                  <TableCell align="right">Розница</TableCell>
                  <TableCell align="right">Маржа</TableCell>
                  <TableCell align="right">ROI</TableCell>
                  <TableCell align="right">Остаток</TableCell>
                  <TableCell align="right">Продажи</TableCell>
                  <TableCell align="right">Оборот</TableCell>
                  <TableCell align="right">Прибыль</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.05)
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(product.costPriceTRY, '₺')}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(product.costPriceRUB)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(product.retailPrice)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${product.marginPercent}%`}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getMarginColor(parseFloat(product.marginPercent)), 0.1),
                          color: getMarginColor(parseFloat(product.marginPercent)),
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${product.roi}%`}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getROIColor(parseFloat(product.roi)), 0.1),
                          color: getROIColor(parseFloat(product.roi)),
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">{product.stockQuantity}</TableCell>
                    <TableCell align="right">{product.salesQuantity}</TableCell>
                    <TableCell align="right">{product.turnover}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={parseFloat(product.profit) > 0 ? 'success.main' : 'text.secondary'}
                      >
                        {formatCurrency(product.profit)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
