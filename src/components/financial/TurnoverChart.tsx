'use client'

import { Card, CardContent, CardHeader, useTheme, alpha } from '@mui/material'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface TurnoverChartProps {
  products: Array<{
    name: string
    turnover: string
    stockValue: string
  }>
}

export default function TurnoverChart({ products }: TurnoverChartProps) {
  const theme = useTheme()

  // Группируем товары по оборачиваемости
  const groups = {
    fast: { label: 'Быстрая (>0.5)', value: 0, color: theme.palette.success.main },
    medium: { label: 'Средняя (0.2-0.5)', value: 0, color: theme.palette.warning.main },
    slow: { label: 'Медленная (<0.2)', value: 0, color: theme.palette.error.main }
  }

  products.forEach(product => {
    const turnover = parseFloat(product.turnover)
    const stockValue = parseFloat(product.stockValue)

    if (turnover > 0.5) {
      groups.fast.value += stockValue
    } else if (turnover >= 0.2) {
      groups.medium.value += stockValue
    } else {
      groups.slow.value += stockValue
    }
  })

  const data = {
    labels: Object.values(groups).map(g => g.label),
    datasets: [
      {
        data: Object.values(groups).map(g => g.value),
        backgroundColor: Object.values(groups).map(g => alpha(g.color, 0.8)),
        borderColor: Object.values(groups).map(g => g.color),
        borderWidth: 2
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${context.label}: ${new Intl.NumberFormat('ru-RU').format(value)} ₽ (${percentage}%)`
          }
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader
        title="Оборачиваемость товаров"
        titleTypographyProps={{ variant: 'h6' }}
        subheader="Распределение стоимости склада по скорости оборота"
      />
      <CardContent>
        <div style={{ height: 300 }}>
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
