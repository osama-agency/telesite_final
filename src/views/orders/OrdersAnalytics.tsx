'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'

const OrdersAnalytics = () => {
  return (
    <Card>
      <CardContent className='flex flex-col items-center'>
        <div className='w-full'>
          <div className='flex items-center justify-between mbe-2'>
            <Typography variant='body2'>Цель продаж</Typography>
            <Typography variant='body2' className='font-medium'>0%</Typography>
          </div>
          <LinearProgress
            variant='determinate'
            value={0}
            color='primary'
            className='mbe-4'
          />

          <div className='flex items-center justify-between mbe-2'>
            <Typography variant='body2'>Выполнение плана</Typography>
            <Typography variant='body2' className='font-medium'>0%</Typography>
          </div>
          <LinearProgress
            variant='determinate'
            value={0}
            color='success'
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default OrdersAnalytics
