'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid2'

// Third-party Imports
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { ru } from 'date-fns/locale'

// Store Imports
import { useDateRangeStore } from '@/store/dateRangeStore'

// Types
interface Expense {
  id: number
  date: string
  category: 'Реклама' | 'Логистика' | 'ЗП Курьеру'
  description: string
  amount: number
}

interface NewExpense {
  date: Date | null
  category: string
  description: string
  amount: string
}

const ExpensesPage = () => {
  // States
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalCount, setTotalCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  const [newExpense, setNewExpense] = useState<NewExpense>({
    date: new Date(),
    category: '',
    description: '',
        amount: ''
  })

  const { range } = useDateRangeStore()

  // Категории расходов
  const categories = [
    { value: 'Реклама', label: 'Реклама', color: 'primary' },
    { value: 'Логистика', label: 'Логистика', color: 'warning' },
    { value: 'ЗП Курьеру', label: 'ЗП Курьеру', color: 'info' }
  ]

  // Загрузка данных
  const fetchExpenses = async () => {
    try {
      setLoading(true)

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(range.start && { dateFrom: range.start.toISOString().split('T')[0] }),
        ...(range.end && { dateTo: range.end.toISOString().split('T')[0] })
      })

      const response = await fetch(`http://localhost:3001/api/expenses?${queryParams}`)
      const data = await response.json()

      if (data.success) {
        setExpenses(data.data.expenses || [])
        setTotalCount(data.data.pagination?.totalItems || 0)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      showSnackbar('Ошибка загрузки расходов', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [page, rowsPerPage, range.start, range.end])

  // Итоги за период
  const totals = useMemo(() => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalCount = expenses.length

    return { totalAmount, totalCount }
  }, [expenses])

  // Обработчики пагинации
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Сохранение нового расхода
  const handleSaveExpense = async () => {
    if (!newExpense.date || !newExpense.category || !newExpense.amount) {
      showSnackbar('Заполните все обязательные поля', 'error')

      return
    }

    try {
      setSaving(true)

      const response = await fetch('http://localhost:3001/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newExpense.date.toISOString().split('T')[0],
          category: newExpense.category,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount)
        })
      })

      if (!response.ok) throw new Error('Failed to create expense')

      showSnackbar('Расход успешно добавлен', 'success')
      setModalOpen(false)
      setNewExpense({
        date: new Date(),
        category: '',
        description: '',
        amount: ''
      })
      fetchExpenses()

    } catch (error) {
      console.error('Error saving expense:', error)
      showSnackbar('Ошибка при сохранении расхода', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Показать уведомление
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  // Получить цвет категории
  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category)

    return cat?.color || 'default'
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <>
      {/* Заголовок + CTA */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Расходы</Typography>
        <Button
          variant="contained"
          startIcon={<i className='bx-plus' />}
          onClick={() => setModalOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #DF4C9D 0%, #E91E63 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #C83688 0%, #D81B60 100%)'
            }
          }}
        >
          Новый расход
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Таблица расходов */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Дата</TableCell>
                      <TableCell>Категория</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell align="right">Сумма ₽</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton animation="wave" width={80} /></TableCell>
                          <TableCell><Skeleton animation="wave" width={100} /></TableCell>
                          <TableCell><Skeleton animation="wave" width={200} /></TableCell>
                          <TableCell><Skeleton animation="wave" width={80} /></TableCell>
                        </TableRow>
                      ))
                    ) : expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                          <Typography variant="body2" color="text.secondary">
                            Нет данных о расходах за выбранный период
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>{formatDate(expense.date)}</TableCell>
                          <TableCell>
                            <Chip
                              label={expense.category}
                              color={getCategoryColor(expense.category) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{expense.description || '—'}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {expense.amount.toLocaleString('ru-RU')} ₽
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Строк на странице:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Итого за период */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Итого за период</Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: 'error.main', borderRadius: 2, color: 'white' }}>
                      <i className='bx-dollar-circle text-2xl' />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Общая сумма</Typography>
                      <Typography variant="h5">{totals.totalAmount.toLocaleString('ru-RU')} ₽</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: 'info.main', borderRadius: 2, color: 'white' }}>
                      <i className='bx-receipt text-2xl' />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Количество записей</Typography>
                      <Typography variant="h5">{totals.totalCount}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Модалка добавления расхода */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Добавить расход</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DatePicker
                label="Дата"
                value={newExpense.date}
                onChange={(newValue) => setNewExpense({ ...newExpense, date: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
              />
            </LocalizationProvider>

            <FormControl fullWidth required>
              <InputLabel>Категория</InputLabel>
              <Select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                label="Категория"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Описание"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              label="Сумма"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value.replace(/[^0-9.]/g, '') })}
              fullWidth
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">₽</InputAdornment>,
              }}
              placeholder="0.00"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Отмена</Button>
          <Button
            onClick={handleSaveExpense}
            variant="contained"
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ExpensesPage
