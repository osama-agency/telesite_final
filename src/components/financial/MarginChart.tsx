'use client'

import { Card, CardContent, CardHeader, useTheme, alpha } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface MarginChartProps {
  products: Array<{
    name: string
    marginPercent: string
    profit: string
  }>
}

export default function MarginChart({ products }: MarginChartProps) {
  const theme = useTheme()

  // Берем топ 10 товаров по прибыли
  const topProducts = products.slice(0, 10)

  const data = {
    labels: topProducts.map(p => p.name),
    datasets: [
      {
        label: 'Маржинальность %',
        data: topProducts.map(p => parseFloat(p.marginPercent)),
        backgroundColor: topProducts.map(p => {
          const margin = parseFloat(p.marginPercent)
          if (margin >= 80) return alpha(theme.palette.success.main, 0.8)
          if (margin >= 60) return alpha(theme.palette.warning.main, 0.8)
          return alpha(theme.palette.error.main, 0.8)
        }),
        borderColor: topProducts.map(p => {
          const margin = parseFloat(p.marginPercent)
          if (margin >= 80) return theme.palette.success.main
          if (margin >= 60) return theme.palette.warning.main
          return theme.palette.error.main
        }),
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const product = topProducts[context.dataIndex]
            return [
              `Маржа: ${product.marginPercent}%`,
              `Прибыль: ${new Intl.NumberFormat('ru-RU').format(parseFloat(product.profit))} ₽`
            ]
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => value + '%'
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader
        title="Топ-10 товаров по маржинальности"
        titleTypographyProps={{ variant: 'h6' }}
      />
      <CardContent>
        <div style={{ height: 300 }}>
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
