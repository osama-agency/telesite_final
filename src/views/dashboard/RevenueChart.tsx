'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Vars
const series = [
  { name: 'Выручка', data: [] }
]

const RevenueChart = () => {
  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      shared: true,
      intersect: false,
      followCursor: true,
      fillSeriesColor: false,
      style: {
        fontSize: '14px'
      },
      y: {
        formatter: (val) => `${val.toLocaleString('ru-RU')} ₽`
      },
      marker: {
        show: true
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        distributed: true,
        columnWidth: '60%'
      }
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    colors: [
      'var(--mui-palette-warning-main)',
      'var(--mui-palette-warning-main)',
      'var(--mui-palette-primary-main)',
      'var(--mui-palette-warning-main)',
      'var(--mui-palette-warning-main)',
      'var(--mui-palette-warning-main)',
      'var(--mui-palette-warning-main)'
    ],
    states: {
      hover: {
        filter: { type: 'lighten', value: 0.1 }
      },
      active: {
        filter: { type: 'darken', value: 0.1 }
      }
    },
    grid: {
      show: false,
      padding: {
        left: -8,
        top: -20,
        right: 0,
        bottom: -12
      }
    },
    xaxis: {
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'],
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        style: {
          fontSize: '1rem',
          colors: 'var(--mui-palette-text-disabled)',
          fontFamily: 'Public Sans'
        }
      }
    },
    yaxis: { labels: { show: false } }
  }

  return (
    <Card>
      <CardHeader
        title='Выручка & Активность продаж'
        subheader='Проверьте каждую колонку для деталей'
      />
      <CardContent>
        <div className='flex items-center gap-x-2 mbe-4'>
          <Typography variant='h2'>0 ₽</Typography>
          <Chip label='0%' size='small' color='success' variant='tonal' />
        </div>
        <Typography>За этот месяц</Typography>
      </CardContent>
      <div className='p-4'>
        <AppReactApexCharts type='bar' height={200} width='100%' series={series} options={options} />
      </div>
    </Card>
  )
}

export default RevenueChart
