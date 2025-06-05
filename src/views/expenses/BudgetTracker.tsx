'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export default function BudgetTracker() {
  return (
    <Card>
      <CardHeader title='Контроль бюджета' />
      <CardContent>
        <Typography variant='body2' color='text.secondary'>
          Отслеживание лимитов
        </Typography>
      </CardContent>
    </Card>
  )
}
