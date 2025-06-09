'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  alpha
} from '@mui/material'

export default function AnalyticsDemoPage() {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:3011/api/prices/analytics')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result.data)
        } else {
          setError('Ошибка загрузки данных')
        }
      })
      .catch(err => {
        setError('Ошибка подключения к серверу')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

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

  const formatCurrency = (value: number | string, currency: string = '₽') => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('ru-RU').format(num) + ' ' + currency
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        💰 Финансовая аналитика
      </Typography>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Стоимость склада
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {data && formatCurrency(data.stats.totalStockValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Средняя маржа
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {data?.stats.averageMargin}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Средний ROI
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {data?.stats.averageROI}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Топ-5 товаров */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Топ-5 товаров по прибыльности
          </Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Товар</TableCell>
                  <TableCell align="right">Себест. ₺</TableCell>
                  <TableCell align="right">Себест. ₽</TableCell>
                  <TableCell align="right">Розница</TableCell>
                  <TableCell align="right">Маржа %</TableCell>
                  <TableCell align="right">Прибыль</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.products.slice(0, 5).map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell align="right">{formatCurrency(product.costPriceTRY, '₺')}</TableCell>
                    <TableCell align="right">{formatCurrency(product.costPriceRUB)}</TableCell>
                    <TableCell align="right">{formatCurrency(product.retailPrice)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${product.marginPercent}%`}
                        size="small"
                        color={parseFloat(product.marginPercent) > 70 ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(product.profit)}</strong>
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
