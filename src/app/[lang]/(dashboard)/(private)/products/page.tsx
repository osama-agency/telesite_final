'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Grid from '@mui/material/Grid2'
import Paper from '@mui/material/Paper'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnDef
} from '@tanstack/react-table'

// Store Imports
import { useDateRangeStore } from '@/store/dateRangeStore'

// Types
interface ProductData {
  id: number
  productName: string
  costTry: number
  costRub: number
  logisticsPercent: number
  markupPercent: number
  moneyInStock: number
  marginPercent: number
  netProfit: number
  expenses: number
  stockQty: number
  daysToZero: number
  soldQty: number
  avgDailySales: number
  minStock: number
  category: string
}

interface MetricsData {
  totalSku: number
  totalStock: number
  potentialProfit: number
}

const columnHelper = createColumnHelper<ProductData>()

const ProductsPage = () => {
  // States
  const [products, setProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<MetricsData>({ totalSku: 0, totalStock: 0, potentialProfit: 0 })
  const [sorting, setSorting] = useState<SortingState>([{ id: 'marginPercent', desc: true }])
  const [category, setCategory] = useState<string>('')
  const [needToBuy, setNeedToBuy] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { range } = useDateRangeStore()

  // Колонки таблицы
  const columns = useMemo<ColumnDef<ProductData>[]>(
    () => [
      columnHelper.accessor('productName', {
        header: 'Название',
        cell: info => (
          <Tooltip title={info.getValue()}>
            <Typography
              variant="body2"
              sx={{
                maxWidth: 240,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {info.getValue()}
            </Typography>
          </Tooltip>
        )
      }),
      columnHelper.accessor('costTry', {
        header: 'Себес, TRY',
        cell: info => `${info.getValue().toLocaleString('tr-TR')} ₺`
      }),
      columnHelper.accessor('costRub', {
        header: 'Себес, RUB',
        cell: info => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue().toLocaleString('ru-RU')} ₽
          </Typography>
        )
      }),
      columnHelper.accessor('logisticsPercent', {
        header: '% логистики',
        cell: info => (
          <Chip
            label={`${info.getValue()}%`}
            size="small"
            variant="outlined"
          />
        )
      }),
      columnHelper.accessor('markupPercent', {
        header: 'Наценка, %',
        cell: info => (
          <Typography
            variant="body2"
            color={info.getValue() < 0 ? 'error' : 'inherit'}
          >
            {info.getValue()}%
          </Typography>
        )
      }),
      columnHelper.accessor('moneyInStock', {
        header: 'Деньги в товаре, ₽',
        cell: info => (
          <Typography variant="body2" fontWeight="bold">
            {info.getValue().toLocaleString('ru-RU')} ₽
          </Typography>
        )
      }),
      columnHelper.accessor('marginPercent', {
        header: 'Маржа, %',
        cell: info => {
          const value = info.getValue()

          return (
            <Box
              sx={{
                backgroundColor: value < 10 ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                px: 1,
                py: 0.5,
                borderRadius: 1
              }}
            >
              {value}%
            </Box>
          )
        }
      }),
      columnHelper.accessor('netProfit', {
        header: 'Чистая прибыль, ₽',
        cell: info => (
          <Typography
            variant="body2"
            color={info.getValue() > 0 ? 'success.main' : 'error.main'}
          >
            {info.getValue().toLocaleString('ru-RU')} ₽
          </Typography>
        )
      }),
      columnHelper.accessor('expenses', {
        header: () => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Затраты
            <Tooltip title="Ad + Delivery + ФОТ">
              <i className='bx-info-circle text-sm' />
            </Tooltip>
          </Box>
        ),
        cell: info => `${info.getValue().toLocaleString('ru-RU')} ₽`
      }),
      columnHelper.accessor('stockQty', {
        header: 'Остаток, шт',
        cell: info => {
          const value = info.getValue()
          const minStock = info.row.original.minStock

          return (
            <Typography
              variant="body2"
              color={value <= minStock ? 'error' : 'inherit'}
              sx={{
                animation: value <= minStock ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 }
                }
              }}
            >
              {value}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('daysToZero', {
        header: 'Дней до нуля',
        cell: info => {
          const value = info.getValue()
          if (value <= 7) {
            return (
              <Chip
                label={`${value} д`}
                color="error"
                size="small"
                icon={<i className='bx-error' />}
              />
            )
          }

          return `${value} д`
        }
      }),
      columnHelper.accessor('soldQty', {
        header: 'Продано / период',
        cell: info => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue()}
          </Typography>
        )
      }),
      columnHelper.accessor('avgDailySales', {
        header: 'AVG продаж / день',
        cell: info => info.getValue().toFixed(1)
      }),
      {
        id: 'actions',
        header: 'Действия',
        cell: () => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Редактировать">
              <IconButton size="small">
                <i className='bx-edit-alt text-base' />
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton size="small" color="error">
                <i className='bx-trash text-base' />
              </IconButton>
            </Tooltip>
            <Tooltip title="Статистика">
              <IconButton size="small">
                <i className='bx-line-chart text-base' />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    ],
    []
  )

  // Загрузка данных
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({
        ...(range.start && { dateFrom: range.start.toISOString().split('T')[0] }),
        ...(range.end && { dateTo: range.end.toISOString().split('T')[0] }),
        ...(category && { category }),
        ...(needToBuy && { needToBuy: 'true' })
      })

      const response = await fetch(`http://localhost:3001/api/products?${queryParams}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products || [])
        setMetrics(data.data.metrics || { totalSku: 0, totalStock: 0, potentialProfit: 0 })
      } else {
        throw new Error(data.message || 'Failed to fetch products')
      }
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }, [range.start, range.end, category, needToBuy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Фильтрация данных
  const filteredData = useMemo(() => {
    if (!searchQuery) return products
    return products.filter(product =>
      product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])

  // Настройка таблицы
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25
      }
    }
  })

  // Экспорт в CSV
  const handleExportCSV = () => {
    const headers = ['Название', 'Себес TRY', 'Себес RUB', 'Маржа %', 'Остаток', 'Дней до нуля']
    const rows = table.getRowModel().rows.map(row => [
      row.original.productName,
      row.original.costTry,
      row.original.costRub,
      row.original.marginPercent,
      row.original.stockQty,
      row.original.daysToZero
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <>
      {/* A. Заголовок + CTA */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Товары</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<i className='bx-plus' />}
            sx={{
              background: 'linear-gradient(135deg, #DF4C9D 0%, #E91E63 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #C83688 0%, #D81B60 100%)'
              }
            }}
          >
            Новый SKU
          </Button>
          <Button
            variant="outlined"
            startIcon={<i className='bx-download' />}
            onClick={handleExportCSV}
          >
            Экспорт CSV
          </Button>
        </Box>
      </Box>

      {/* B. Панель фильтров */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(55, 65, 81, 0.6)', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', height: 48 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Категория</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Категория"
            >
              <MenuItem value="">Все категории</MenuItem>
              <MenuItem value="electronics">Электроника</MenuItem>
              <MenuItem value="clothing">Одежда</MenuItem>
              <MenuItem value="food">Продукты</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={needToBuy}
                onChange={(e) => setNeedToBuy(e.target.checked)}
                color="warning"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <i className='bx-error' />
                Нужно закупить
              </Box>
            }
          />

          <TextField
            size="small"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <i className='bx-search' style={{ marginRight: 8 }} />
            }}
            sx={{ ml: 'auto', minWidth: 250 }}
          />
        </Box>
      </Paper>

      {/* C. Метрики-сводка */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
              <i className='bx-package text-2xl' />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Всего SKU</Typography>
              <Typography variant="h5">{metrics.totalSku.toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'info.main', borderRadius: 2, color: 'white' }}>
              <i className='bx-wallet text-2xl' />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Остаток ₽</Typography>
              <Typography variant="h5">{metrics.totalStock.toLocaleString()} ₽</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'success.main', borderRadius: 2, color: 'white' }}>
              <i className='bx-trending-up text-2xl' />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Потенц. прибыль ₽</Typography>
              <Typography variant="h5">{metrics.potentialProfit.toLocaleString()} ₽</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* D. Таблица */}
      <Card>
        <CardContent>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={fetchProducts}>
                  Повторить
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableCell
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        sx={{
                          cursor: header.column.getCanSort() ? 'pointer' : 'default',
                          userSelect: 'none',
                          bgcolor: 'background.paper'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() && (
                            <i className={`bx-chevron-${header.column.getIsSorted() === 'desc' ? 'down' : 'up'} text-sm`} />
                          )}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {loading ? (
                  // Skeleton loading
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 14 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton animation="wave" height={20} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 8 }}>
                      <Box>
                        <i className='bx-package text-6xl mb-2' style={{ opacity: 0.3 }} />
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          Товары не найдены
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<i className='bx-plus' />}
                        >
                          Добавить SKU
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent'
                      }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredData.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => table.setPageIndex(page)}
            onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default ProductsPage
