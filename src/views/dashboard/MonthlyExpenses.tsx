'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Components Imports

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Vars
const series = [
  {
    name: 'Расходы',
    data: []
  }
]

const expenseData: any[] = []

const MonthlyExpenses = () => {
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
    colors: ['var(--mui-palette-error-main)'],
    states: {
      hover: { filter: { type: 'lighten', value: 0.1 } },
      active: { filter: { type: 'darken', value: 0.1 } }
    },
    grid: {
      show: false,
      padding: {
        left: -8,
        top: -20,
        right: 8,
        bottom: -12
      }
    },
    xaxis: {
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: { show: false }
    },
    yaxis: { labels: { show: false } }
  }

  return (
    <Card>
      <CardHeader
        title='Ежемесячные расходы'
      />
      <CardContent>
        <AppReactApexCharts type='bar' height={120} width='100%' series={series} options={options} />
        <div className='flex flex-col gap-y-4 mbs-6'>
          {expenseData.map((item, index) => (
            <div key={index} className='flex items-center gap-x-3'>
              <Avatar src={item.avatar} variant='rounded' className='w-8 h-8' />
              <div className='flex-grow'>
                <Typography variant='body2' className='font-medium'>
                  {item.title}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {item.percentage}% от общих расходов
                </Typography>
              </div>
              <Typography variant='body2' className='font-medium'>
                {item.amount}
              </Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default MonthlyExpenses
