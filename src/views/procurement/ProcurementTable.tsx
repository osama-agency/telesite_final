'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export default function ProcurementTable() {
  return (
    <Card>
      <CardHeader title='Таблица закупок' />
      <CardContent>
        <Typography>Таблица заказов поставщикам</Typography>
      </CardContent>
    </Card>
  )
}
