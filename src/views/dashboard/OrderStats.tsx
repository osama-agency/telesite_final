'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Vars
const series = [{ data: [] }]

const OrderStats = () => {
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
      style: {
        fontSize: '14px'
      },
      y: {
        formatter: (val) => `${val} заказов`
      },
      marker: {
        show: true
      }
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    colors: ['var(--mui-palette-warning-main)'],
    markers: {
      size: 6,
      strokeWidth: 5,
      colors: ['transparent'],
      strokeColors: 'transparent',
      hover: {
        size: 8,
        sizeOffset: 2
      },
      discrete: [
        {
          size: 7,
          seriesIndex: 0,
          dataPointIndex: 5,
          strokeColor: 'var(--mui-palette-warning-main)',
          fillColor: 'var(--mui-palette-background-paper)'
        }
      ]
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        top: -30,
        right: 12,
        bottom: 5
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: { labels: { show: false } }
  }

  return (
    <Card>
      <CardContent className='pb-0'>
        <Typography color='text.secondary'>Заказы</Typography>
        <div className='flex items-center gap-x-2 mbe-1'>
          <Typography variant='h4'>0</Typography>
          <Chip label='0%' size='small' color='success' variant='tonal' />
        </div>
        <Typography variant='body2' color='text.secondary'>
          Всего заказов
        </Typography>
      </CardContent>
      <div className='p-1'>
        <AppReactApexCharts type='line' height={115} width='100%' series={series} options={options} />
      </div>
    </Card>
  )
}

export default OrderStats
