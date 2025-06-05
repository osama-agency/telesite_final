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
  {
    name: 'Прошлый месяц',
    data: []
  },
  {
    name: 'Этот месяц',
    data: []
  }
]

const SalesOverview = () => {
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
      },

      dropShadow: {
        top: 14,
        blur: 4,
        left: 0,
        enabled: true,
        opacity: 0.04,
        enabledOnSeries: [1],
        color: 'var(--mui-palette-common-black)'
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
      x: {
        show: true,
        formatter: (val, opts) => {
          const categories = ['', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл']

          return categories[opts.dataPointIndex] || ''
        }
      },
      marker: {
        show: true
      }
    },
    grid: {
      show: false,
      padding: {
        left: 7,
        top: 10,
        right: 44,
        bottom: 10
      }
    },
    legend: { show: false },
    colors: ['var(--mui-palette-customColors-inputBorder)', 'var(--mui-palette-primary-main)'],
    markers: {
      size: 6,
      strokeWidth: 5,
      strokeOpacity: 1,
      hover: {
        size: 10,
        sizeOffset: 3
      },
      colors: ['transparent'],
      strokeColors: 'transparent',
      discrete: [
        {
          size: 6,
          seriesIndex: 1,
          fillColor: 'var(--mui-palette-background-paper)',
          strokeColor: 'var(--mui-palette-primary-main)',
          dataPointIndex: series[0].data.length - 1
        },
        {
          size: 6,
          seriesIndex: 1,
          dataPointIndex: 3,
          fillColor: 'var(--mui-palette-common-white)',
          strokeColor: 'var(--mui-palette-common-black)'
        }
      ]
    },
    stroke: {
      width: [3, 5],
      curve: 'smooth',
      lineCap: 'round',
      dashArray: [8, 0]
    },
    states: {
      hover: {
        filter: {
          type: 'lighten',
          value: 0.1
        }
      },
      active: {
        filter: {
          type: 'darken',
          value: 0.1
        }
      }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: ['', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'],
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
              <CardHeader title='Общие продажи' />
      <CardContent>
        <div className='flex items-center gap-x-2'>
          <Typography variant='h2'>0 ₽</Typography>
        </div>
        <div className='flex gap-x-2 mbs-1'>
          <Chip label='0%' size='small' color='primary' variant='tonal' />
          <Typography>За этот месяц</Typography>
        </div>
      </CardContent>
      <div className='p-4' style={{ pointerEvents: 'auto' }}>
        <AppReactApexCharts type='line' height={226} width='100%' series={series} options={options} />
      </div>
    </Card>
  )
}

export default SalesOverview
