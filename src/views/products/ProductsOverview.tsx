'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Components Imports
import OptionMenu from '@core/components/option-menu'

const ProductsOverview = () => {
  return (
    <Card>
      <CardHeader title='Товары' action={<OptionMenu options={['Поделиться', 'Обновить']} />} />
      <CardContent>
        <div className='flex items-center gap-x-2'>
          <Typography variant='h2'>1,547</Typography>
        </div>
        <div className='flex gap-x-2 mbs-1'>
          <Chip label='+8%' size='small' color='success' variant='tonal' />
          <Typography>Товаров в каталоге</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductsOverview
