'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Components Imports
import OptionMenu from '@core/components/option-menu'

const OrdersChart = () => {
  return (
    <Card>
      <CardHeader
        title='Статистика заказов'
        subheader='Распределение по статусам'
        action={<OptionMenu options={['Поделиться', 'Обновить', 'Удалить']} />}
      />
            <CardContent className='flex flex-col gap-y-3'>
        <div className='flex flex-col gap-0.5'>
          <Typography>Общая сумма заказов</Typography>
          <Typography variant='h4'>₽0</Typography>
        </div>
        <Typography color='error.main' className='flex gap-0.5 items-center'>
          <i className='text-xl bx-down-arrow-alt' />
          <span className='text-[13px] font-medium'>0%</span>
        </Typography>
      </CardContent>
    </Card>
  )
}

export default OrdersChart
