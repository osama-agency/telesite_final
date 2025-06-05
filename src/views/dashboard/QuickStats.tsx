'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Vars
const series = [0]

const QuickStats = () => {
  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      shared: true,
      followCursor: true,
      style: {
        fontSize: '14px'
      },
      y: {
        formatter: (val) => `${val}%`
      },
      marker: {
        show: true
      }
    },
    labels: ['Товары на складе'],
    stroke: { lineCap: 'round' },
    colors: ['var(--mui-palette-info-main)'],
    states: {
      hover: { filter: { type: 'lighten', value: 0.1 } },
      active: { filter: { type: 'darken', value: 0.1 } }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '73%',
          imageWidth: 48,
          imageHeight: 48,
          imageOffsetY: -25,
          imageClipped: false,
          image: '/images/cards/warehouse.png'
        },
        track: {
          strokeWidth: '40px',
          background: 'var(--mui-palette-customColors-trackBg)'
        },
        dataLabels: {
          name: {
            offsetY: 45,
            fontSize: '0.875rem',
            color: 'var(--mui-palette-text-disabled)'
          },
          value: {
            offsetY: 5,
            fontWeight: 500,
            fontSize: '24px',
            color: 'var(--mui-palette-text-primary)',
            fontFamily: 'Public Sans'
          }
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader title='Товары на складе' />
      <CardContent className='flex flex-col gap-y-6'>
        <AppReactApexCharts type='radialBar' height={200} width='100%' series={series} options={options} />
        <div className='text-center'>
          <Typography variant='h6'>0</Typography>
          <Typography variant='body2' color='text.secondary'>
            Доступно
          </Typography>
          <Typography variant='caption' color='error'>
            0% с прошлого месяца
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickStats
