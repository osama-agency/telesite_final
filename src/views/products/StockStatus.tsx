'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const StockStatus = () => {
  return (
    <Card>
      <CardContent className='flex flex-col items-center'>
        <Typography variant='h5' className='mbs-4'>Запасы</Typography>
        <Typography variant='body2' color='text.secondary'>Общий статус</Typography>
      </CardContent>
    </Card>
  )
}

export default StockStatus
