'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const InventoryChart = () => {
  return (
    <Card>
      <CardHeader title='Склад' />
      <CardContent>
        <Typography variant='h2'>₽3,450,000</Typography>
        <Typography color='text.secondary'>Общая стоимость товаров</Typography>
        <div className='flex flex-col gap-y-4 mbs-6'>
          <div className='flex items-center justify-between'>
            <Typography variant='body2'>В наличии</Typography>
            <Typography variant='body2' className='font-medium'>1,245</Typography>
          </div>
          <div className='flex items-center justify-between'>
            <Typography variant='body2'>Зарезервировано</Typography>
            <Typography variant='body2' className='font-medium'>89</Typography>
          </div>
          <div className='flex items-center justify-between'>
            <Typography variant='body2'>Мало товара</Typography>
            <Typography variant='body2' className='font-medium text-warning'>12</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InventoryChart
