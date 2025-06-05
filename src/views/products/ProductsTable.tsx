'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const ProductsTable = () => {
  return (
    <Card>
      <CardHeader title='Список товаров' />
      <CardContent>
        <Typography>Таблица товаров будет здесь</Typography>
      </CardContent>
    </Card>
  )
}

export default ProductsTable
