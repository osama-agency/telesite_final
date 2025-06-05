'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export default function ExpensesTrend() {
  return (
    <Card>
      <CardHeader title='Тренд расходов' />
      <CardContent>
        <Typography variant='h2'>5.4%</Typography>
        <Typography color='text.secondary'>Снижение за месяц</Typography>
      </CardContent>
    </Card>
  )
}
