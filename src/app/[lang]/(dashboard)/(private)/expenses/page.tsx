'use client'

// React Imports
import React from 'react'
import { useState, useEffect, useMemo, useCallback } from 'react'

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
import IconButton from '@mui/material/IconButton'
import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Badge from '@mui/material/Badge'
import Fade from '@mui/material/Fade'
import Slide from '@mui/material/Slide'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme, alpha } from '@mui/material/styles'

// Third-party Imports
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { ru } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

// Icons
import {
  Add,
  Download,
  FilterList,
  Search,
  TrendingUp,
  Receipt,
  AttachMoney,
  Category,
  AccessTime,
  MoreVert,
  FileUpload,
  Analytics,
  Insights,
  CalendarToday,
  KeyboardArrowDown,
  Close
} from '@mui/icons-material'

// Store Imports
import { useDateRangeStore } from '@/store/dateRangeStore'

// Enhanced Toast Imports
import { showSuccessToast, showErrorToast, showWarningToast } from '@/utils/enhancedToast'

// Types
interface Expense {
  id: number
  date: string
  category: 'Реклама' | 'Логистика' | 'ЗП Курьеру' | 'Аренда' | 'Прочее'
  description: string
  amount: number
  receipt?: string
}

interface NewExpense {
  date: Date | null
  category: string
  description: string
  amount: string
  receipt?: File | null
}

interface ExpenseStats {
  totalAmount: number
  totalCount: number
  avgPerDay: number
  biggestExpense: number
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  weeklyTrend: { week: string; amount: number }[]
}

// Enhanced Categories with icons and gradients
const categories = [
  { 
    value: 'Реклама', 
    label: 'Реклама', 
    icon: '📊',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    lightColor: 'rgba(102, 126, 234, 0.1)'
  },
  { 
    value: 'Логистика', 
    label: 'Логистика', 
    icon: '🚚',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    lightColor: 'rgba(240, 147, 251, 0.1)'
  },
  { 
    value: 'ЗП Курьеру', 
    label: 'ЗП Курьеру', 
    icon: '💰',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    lightColor: 'rgba(79, 172, 254, 0.1)'
  },
  { 
    value: 'Аренда', 
    label: 'Аренда', 
    icon: '🏢',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    lightColor: 'rgba(67, 233, 123, 0.1)'
  },
  { 
    value: 'Прочее', 
    label: 'Прочее', 
    icon: '📋',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    lightColor: 'rgba(250, 112, 154, 0.1)'
  }
]

const ExpensesPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // States
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalCount, setTotalCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [showStats, setShowStats] = useState(true)
  const [statsExpanded, setStatsExpanded] = useState(false)
  
  // Menu states
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null)
  
  const [newExpense, setNewExpense] = useState<NewExpense>({
    date: new Date(),
    category: '',
    description: '',
    amount: '',
    receipt: null
  })

  const { range } = useDateRangeStore()

  // Enhanced stats calculation
  const stats = useMemo((): ExpenseStats => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalCount = expenses.length
    const avgPerDay = totalAmount / Math.max(1, 30) // Assume 30 days period
    const biggestExpense = Math.max(...expenses.map(e => e.amount), 0)
    
    // Category breakdown
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)
    
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalAmount) * 100 || 0
    })).sort((a, b) => b.amount - a.amount)
    
    // Mock weekly trend (in real app, calculate from actual dates)
    const weeklyTrend = [
      { week: 'Нед 1', amount: totalAmount * 0.2 },
      { week: 'Нед 2', amount: totalAmount * 0.3 },
      { week: 'Нед 3', amount: totalAmount * 0.25 },
      { week: 'Нед 4', amount: totalAmount * 0.25 }
    ]

    return { totalAmount, totalCount, avgPerDay, biggestExpense, categoryBreakdown, weeklyTrend }
  }, [expenses])

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = !searchQuery || 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [expenses, searchQuery, selectedCategory])

  // Load expenses with enhanced error handling
  const fetchExpenses = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

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
        if (showRefreshIndicator) {
          showSuccessToast('Данные обновлены')
        }
      } else {
        throw new Error(data.message || 'Ошибка загрузки')
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
      showErrorToast('Ошибка загрузки расходов')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, rowsPerPage, range.start, range.end])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSaveExpense = async () => {
    if (!newExpense.date || !newExpense.category || !newExpense.amount) {
      showWarningToast('Заполните все обязательные поля')
      return
    }

    try {
      setSaving(true)

      const formData = new FormData()
      formData.append('date', newExpense.date.toISOString().split('T')[0])
      formData.append('category', newExpense.category)
      formData.append('description', newExpense.description)
      formData.append('amount', newExpense.amount)
      
      if (newExpense.receipt) {
        formData.append('receipt', newExpense.receipt)
      }

      const response = await fetch('http://localhost:3001/api/expenses', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to create expense')

      showSuccessToast('Расход успешно добавлен')
      setModalOpen(false)
      setNewExpense({
        date: new Date(),
        category: '',
        description: '',
        amount: '',
        receipt: null
      })
      fetchExpenses(true)

    } catch (error) {
      console.error('Error saving expense:', error)
      showErrorToast('Ошибка при сохранении расхода')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/expenses/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dateFrom: range.start?.toISOString(),
          dateTo: range.end?.toISOString(),
          category: selectedCategory !== 'all' ? selectedCategory : undefined
        })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `expenses-${new Date().toISOString().split('T')[0]}.xlsx`
        a.click()
        showSuccessToast('Файл загружен')
      }
    } catch (error) {
      showErrorToast('Ошибка экспорта данных')
    }
  }

  const getCategoryData = (category: string) => {
    return categories.find(c => c.value === category) || categories[categories.length - 1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Loading component
  const LoadingSkeleton = () => (
    <Stack spacing={2}>
      {Array.from({ length: 5 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
              <Skeleton variant="text" width={80} height={24} />
            </Box>
          </Paper>
        </motion.div>
      ))}
    </Stack>
  )

  // Enhanced Stats Cards
  const StatsCards = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Общая сумма',
            value: formatCurrency(stats.totalAmount),
            icon: <AttachMoney />,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            trend: '+12%',
            subtitle: 'за период'
          },
          {
            title: 'Количество',
            value: stats.totalCount.toString(),
            icon: <Receipt />,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            trend: '+3',
            subtitle: 'записей'
          },
          {
            title: 'Среднее в день',
            value: formatCurrency(stats.avgPerDay),
            icon: <TrendingUp />,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            trend: '+8%',
            subtitle: 'средний расход'
          },
          {
            title: 'Максимум',
            value: formatCurrency(stats.biggestExpense),
            icon: <Insights />,
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            trend: '→',
            subtitle: 'крупнейший'
          }
        ].map((stat, index) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                    '&::before': {
                      opacity: 1
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: stat.gradient,
                    opacity: 0.7,
                    transition: 'opacity 0.3s ease'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box 
                    sx={{ 
                      p: 1.5,
                      borderRadius: 2,
                      background: stat.gradient,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Chip 
                    label={stat.trend}
                    size="small"
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: 'success.main',
                      fontWeight: 600
                    }}
                  />
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                  {stat.value}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {stat.title}
                </Typography>
                
                <Typography variant="caption" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  )

  // Mobile Expense Cards
  const ExpenseCards = () => (
    <Stack spacing={2}>
      <AnimatePresence>
        {filteredExpenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Paper 
              sx={{ 
                p: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
                  borderColor: 'primary.main'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 2, fontSize: '24px' }}>
                  {getCategoryData(expense.category).icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {expense.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(expense.date)}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {formatCurrency(expense.amount)}
                </Typography>
              </Box>
              
              {expense.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {expense.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={expense.category}
                  size="small"
                  sx={{
                    background: getCategoryData(expense.category).lightColor,
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                />
                {expense.receipt && (
                  <Chip 
                    icon={<Receipt sx={{ fontSize: 14 }} />}
                    label="Чек"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Paper>
          </motion.div>
        ))}
      </AnimatePresence>
    </Stack>
  )

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { sm: 'center' },
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              Расходы
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Управление финансами и анализ трат
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Search */}
            <TextField
              placeholder="Поиск расходов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
            />
            
            {/* Filters */}
            <IconButton 
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <Badge badgeContent={selectedCategory !== 'all' ? 1 : 0} color="primary">
                <FilterList />
              </Badge>
            </IconButton>
            
            {/* More actions */}
            <IconButton onClick={(e) => setMoreMenuAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Stack>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      {showStats && <StatsCards />}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => {
            setSelectedCategory('all')
            setFilterMenuAnchor(null)
          }}
          selected={selectedCategory === 'all'}
        >
          <Category sx={{ mr: 1 }} />
          Все категории
        </MenuItem>
        {categories.map((category) => (
          <MenuItem
            key={category.value}
            onClick={() => {
              setSelectedCategory(category.value)
              setFilterMenuAnchor(null)
            }}
            selected={selectedCategory === category.value}
          >
            <Box sx={{ mr: 1, fontSize: '18px' }}>{category.icon}</Box>
            {category.label}
          </MenuItem>
        ))}
      </Menu>

      {/* More Actions Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { handleExport(); setMoreMenuAnchor(null) }}>
          <Download sx={{ mr: 1 }} />
          Экспорт в Excel
        </MenuItem>
        <MenuItem onClick={() => { fetchExpenses(true); setMoreMenuAnchor(null) }}>
          <Analytics sx={{ mr: 1 }} />
          Обновить данные
        </MenuItem>
        <MenuItem onClick={() => { setShowStats(!showStats); setMoreMenuAnchor(null) }}>
          <Insights sx={{ mr: 1 }} />
          {showStats ? 'Скрыть' : 'Показать'} статистику
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <Card sx={{ 
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 0 }}>
              {isMobile ? (
                <Box sx={{ p: 3 }}>
                  {filteredExpenses.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Нет расходов
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || selectedCategory !== 'all' 
                          ? 'Попробуйте изменить фильтры'
                          : 'Добавьте первый расход'
                        }
                      </Typography>
                    </Box>
                  ) : (
                    <ExpenseCards />
                  )}
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Дата</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Категория</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Описание</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Сумма</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Чек</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredExpenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                            <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                              Нет данных о расходах
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredExpenses.map((expense, index) => (
                          <motion.tr
                            key={expense.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            component={TableRow}
                            hover
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.02)
                              }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {formatDate(expense.date)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<span style={{ fontSize: '14px' }}>{getCategoryData(expense.category).icon}</span>}
                                label={expense.category}
                                size="small"
                                sx={{
                                  background: getCategoryData(expense.category).lightColor,
                                  color: 'text.primary',
                                  fontWeight: 500,
                                  borderRadius: 2
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.primary">
                                {expense.description || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {formatCurrency(expense.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {expense.receipt && (
                                <Tooltip title="Посмотреть чек">
                                  <IconButton size="small">
                                    <Receipt sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {filteredExpenses.length > 0 && (
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
                  sx={{
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '& .MuiTablePagination-toolbar': { px: 3 }
                  }}
                />
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <Fab
          color="primary"
          onClick={() => setModalOpen(true)}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 32 },
            right: { xs: 16, md: 32 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1000
          }}
        >
          <Add />
        </Fab>
      </motion.div>

      {/* Enhanced Add Expense Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={isMobile ? Slide : Fade}
        TransitionProps={isMobile ? { direction: "up" } : {}}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: isMobile ? 0 : 4,
            ...(isMobile && { m: 0, maxHeight: '100%' })
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mb: 0
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Добавить расход
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={() => setModalOpen(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <DatePicker
                label="Дата расхода"
                value={newExpense.date}
                onChange={(newValue) => setNewExpense({ ...newExpense, date: newValue })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      )
                    }
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
                startAdornment={
                  <InputAdornment position="start">
                    <Category sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                }
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ fontSize: '18px' }}>{cat.icon}</Box>
                      {cat.label}
                    </Box>
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
              rows={3}
              placeholder="Подробное описание расхода..."
            />

            <TextField
              label="Сумма"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value.replace(/[^0-9.]/g, '') })}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">₽</InputAdornment>,
              }}
              placeholder="0.00"
            />

            {/* File Upload */}
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="receipt-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setNewExpense({ ...newExpense, receipt: file })
                    showSuccessToast(`Файл "${file.name}" загружен`)
                  }
                }}
              />
              <label htmlFor="receipt-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<FileUpload />}
                  fullWidth
                  sx={{ borderStyle: 'dashed', py: 2 }}
                >
                  {newExpense.receipt ? newExpense.receipt.name : 'Загрузить чек'}
                </Button>
              </label>
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setModalOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSaveExpense}
            variant="contained"
            disabled={saving}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              }
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ExpensesPage
