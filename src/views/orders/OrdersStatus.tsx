'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Third Party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const OrdersStatus = () => {
  return (
    <Card>
      <CardContent className='flex flex-col items-center'>
        <Box
          sx={{
            height: 130,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary'
          }}
        >
          <Typography variant='h5'>0%</Typography>
        </Box>
        <Typography variant='h5' className='mbs-4'>
          Статус
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Выполнение заказов
        </Typography>
      </CardContent>
    </Card>
  )
}

export default OrdersStatus
