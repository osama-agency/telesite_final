'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export default function PurchaseStatus() {
  return (
    <Card>
      <CardContent className='flex flex-col items-center'>
        <Typography variant='h5'>Статус</Typography>
        <Typography variant='body2' color='text.secondary'>закупок</Typography>
      </CardContent>
    </Card>
  )
}
