'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export default function ExpensesTable() {
  return (
    <Card>
      <CardHeader title='Таблица расходов' />
      <CardContent>
        <Typography>Детальная таблица расходов</Typography>
      </CardContent>
    </Card>
  )
}
