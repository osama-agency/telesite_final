'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const LowStockAlerts = () => {
  return (
    <Card>
      <CardHeader title='Уведомления' />
      <CardContent>
        <Typography variant='body2' color='text.secondary'>
          Мало товаров на складе
        </Typography>
      </CardContent>
    </Card>
  )
}

export default LowStockAlerts
