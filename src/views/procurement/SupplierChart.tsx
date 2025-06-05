'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const SupplierChart = () => {
  return (
    <Card>
      <CardHeader title='Поставщики' />
      <CardContent>
        <Typography variant='h2'>47</Typography>
        <Typography color='text.secondary'>Активных поставщиков</Typography>
      </CardContent>
    </Card>
  )
}

export default SupplierChart
