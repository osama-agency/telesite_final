'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export default function MonthlyComparison() {
  return (
    <Card>
      <CardContent>
        <Typography variant='h6'>Сравнение</Typography>
        <Typography variant='body2' color='text.secondary'>по месяцам</Typography>
      </CardContent>
    </Card>
  )
}
