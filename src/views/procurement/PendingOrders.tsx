'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export default function PendingOrders() {
  return (
    <Card>
      <CardHeader title='Ожидающие заказы' />
      <CardContent>
        <Typography variant='body2' color='text.secondary'>
          Заказы в ожидании
        </Typography>
      </CardContent>
    </Card>
  )
}
