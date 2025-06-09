import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Checkbox,
  useTheme,
  alpha
} from '@mui/material'

interface Product {
  id: number
  name: string
  category: string
  stock: number
  daysToZero: number
  sold: number
  avgPerDay: number
  inTransit: number
  costTry: number
  costRub: number
  expenses: number
  totalCostRub: number
  retailPrice: number
  marginPercent: number
  toPurchase: number
  urgencyLevel: 'critical' | 'warning' | 'normal'
}

interface ModernAnalyticsTableProps {
  products: Product[]
  selectedRows: number[]
  onSelectRow: (id: number) => void
  onProductClick: (product: Product) => void
}

const ModernAnalyticsTable: React.FC<ModernAnalyticsTableProps> = ({
  products,
  selectedRows,
  onSelectRow,
  onProductClick
}) => {
  const theme = useTheme()

  const formatCurrency = (value: number, currency: 'RUB' | 'TRY' = 'RUB') => {
    const symbol = currency === 'TRY' ? '₺' : '₽'
    return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}${symbol}`
  }

  const getUrgencyIcon = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'critical': return '🔴'
      case 'warning': return '🟡'
      default: return '🟢'
    }
  }

  return (
    <Paper sx={{
      borderRadius: '12px',
      overflow: 'hidden',
      bgcolor: theme.palette.background.paper,
      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      boxShadow: theme.palette.mode === 'dark'
        ? '0 4px 20px rgba(0,0,0,0.15)'
        : '0 4px 20px rgba(0,0,0,0.04)'
    }}>
      <TableContainer>
        <Table sx={{
          minWidth: 1200,
          '& .MuiTableCell-root': {
            borderColor: alpha(theme.palette.divider, 0.06),
            fontSize: '0.875rem',
            fontFamily: 'Inter, -apple-system, sans-serif',
            letterSpacing: '-0.01em'
          }
        }}>
          <TableHead>
            {/* Group Headers */}
            <TableRow sx={{
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <TableCell padding="checkbox" sx={{ bgcolor: 'inherit', py: 1.5 }} />
              <TableCell
                colSpan={2}
                sx={{
                  bgcolor: 'inherit',
                  borderBottom: 'none',
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  py: theme.spacing(1.5)
                }}
              >
                Товар
              </TableCell>
              {/* Блок Запасы */}
              <TableCell
                align="center"
                colSpan={3}
                sx={{
                  borderBottom: 'none',
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  bgcolor: 'inherit',
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  py: theme.spacing(1.5)
                }}
              >
                📦 Запасы
              </TableCell>
              {/* Блок Продажи */}
              <TableCell
                align="center"
                colSpan={3}
                sx={{
                  borderBottom: 'none',
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  bgcolor: 'inherit',
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  py: theme.spacing(1.5)
                }}
              >
                📈 Продажи
              </TableCell>
              {/* Блок Финансы */}
              <TableCell
                align="center"
                colSpan={5}
                sx={{
                  borderBottom: 'none',
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  bgcolor: 'inherit',
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  py: theme.spacing(1.5)
                }}
              >
                💰 Финансы
              </TableCell>
              {/* Блок Закупка */}
              <TableCell
                align="center"
                colSpan={1}
                sx={{
                  borderBottom: 'none',
                  bgcolor: 'inherit',
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  py: theme.spacing(1.5)
                }}
              >
                🛒 Закупка
              </TableCell>
            </TableRow>

            {/* Column Headers */}
            <TableRow sx={{
              bgcolor: theme.palette.background.paper,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '& .MuiTableCell-root': {
                py: '10px',
                fontWeight: 500,
                fontSize: '0.75rem',
                color: 'text.secondary',
                letterSpacing: 'normal'
              }
            }}>
              <TableCell padding="checkbox" sx={{ bgcolor: 'inherit' }} />
              <TableCell sx={{
                bgcolor: 'inherit',
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                fontWeight: 600,
                color: 'text.primary',
                minWidth: 200
              }}>
                Название
              </TableCell>

              {/* Блок Запасы */}
              <TableCell align="center" sx={{ bgcolor: 'inherit', minWidth: 90 }}>
                Остаток
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: 'inherit', minWidth: 90 }}>
                Дней до 0
              </TableCell>
              <TableCell align="center" sx={{
                bgcolor: 'inherit',
                minWidth: 80,
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}`
              }}>
                В пути
              </TableCell>

              {/* Блок Продажи */}
              <TableCell align="center" sx={{ bgcolor: 'inherit', minWidth: 120 }}>
                Ср. потребление
              </TableCell>
              <TableCell align="center" sx={{ bgcolor: 'inherit', minWidth: 130 }}>
                Продаж за период
              </TableCell>
              <TableCell align="center" sx={{
                bgcolor: 'inherit',
                minWidth: 120,
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}`
              }}>
                Оборачиваемость
              </TableCell>

              {/* Блок Финансы */}
              <TableCell align="right" sx={{ bgcolor: 'inherit', minWidth: 100 }}>
                Себест. ₺
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: 'inherit', minWidth: 100 }}>
                Расходы
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: 'inherit', minWidth: 120 }}>
                Итого себест.
              </TableCell>
              <TableCell align="right" sx={{ bgcolor: 'inherit', minWidth: 120 }}>
                Розн. цена
              </TableCell>
              <TableCell align="right" sx={{
                bgcolor: 'inherit',
                minWidth: 90,
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}`
              }}>
                Маржа %
              </TableCell>

              {/* Блок Закупка */}
              <TableCell align="center" sx={{ bgcolor: 'inherit', minWidth: 120 }}>
                Рекомендовано
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                sx={{
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                  transition: 'all 0.2s ease-in-out',
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`
                  },
                  '& .MuiTableCell-root': {
                    py: 2.5,
                    fontSize: '0.875rem',
                    lineHeight: 1.4
                  }
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.includes(product.id)}
                    onChange={() => onSelectRow(product.id)}
                    size="small"
                    sx={{
                      '&.Mui-checked': {
                        color: theme.palette.primary.main
                      }
                    }}
                  />
                </TableCell>

                <TableCell sx={{ borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <span style={{ fontSize: '1rem' }}>{getUrgencyIcon(product.urgencyLevel)}</span>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => onProductClick(product)}
                    >
                      {product.name}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Блок Запасы */}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: product.stock <= 3 ? '#dc2626' : product.stock <= 7 ? '#f59e0b' : 'text.primary',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {product.stock}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      шт
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: product.daysToZero <= 7 ? 700 : 500,
                        fontSize: '0.875rem',
                        color: product.daysToZero <= 7 ? '#f59e0b' : 'text.primary',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {product.daysToZero}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      дн
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center" sx={{ borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}` }}>
                  {product.inTransit > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#f59e0b',
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      >
                        {product.inTransit}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          ml: 0.5
                        }}
                      >
                        шт
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      —
                    </Typography>
                  )}
                </TableCell>

                {/* Блок Продажи */}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {product.avgPerDay.toFixed(1)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      шт/день
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {product.sold}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      шт
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center" sx={{ borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      30
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      дн
                    </Typography>
                  </Box>
                </TableCell>

                {/* Блок Финансы */}
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {product.costTry.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      ₺
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      +{product.expenses.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      ₽
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: 'text.primary',
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {product.totalCostRub.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      ₽
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: '#10b981', // Зеленый для прибыли
                        fontVariantNumeric: 'tabular-nums'
                      }}
                    >
                      {product.retailPrice.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        ml: 0.5
                      }}
                    >
                      ₽
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="right" sx={{ borderRight: `1px solid ${alpha(theme.palette.divider, 0.15)}` }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: product.marginPercent > 40 ? '#10b981' : product.marginPercent > 20 ? '#f59e0b' : '#dc2626',
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {Math.round(product.marginPercent)}%
                  </Typography>
                </TableCell>

                {/* Блок Закупка */}
                <TableCell align="center">
                  {product.toPurchase > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: '#10b981',
                          fontVariantNumeric: 'tabular-nums'
                        }}
                      >
                        {Math.round(product.toPurchase)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          ml: 0.5
                        }}
                      >
                        шт
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.875rem'
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
  )
}

export default ModernAnalyticsTable
