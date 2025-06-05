'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'

// Components Imports

// Sample Data
const productsData: any[] = []

const TopSellingProducts = () => {
  return (
    <Card>
      <CardHeader
        title='Топ товары по продажам'
      />
      <CardContent className='flex flex-col gap-y-6'>
        {productsData.map((product, index) => (
          <div key={index} className='flex items-center gap-x-4'>
            <Avatar
              src={product.avatar}
              alt={product.name}
              variant='rounded'
              className='w-12 h-12'
            />
            <div className='flex-grow'>
              <Typography variant='h6' className='text-sm font-medium'>
                {product.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {product.brand}
              </Typography>
            </div>
            <div className='text-right'>
              <Typography variant='h6' className='text-sm font-medium'>
                {product.sales}
              </Typography>
              <div className='flex items-center gap-x-1'>
                <Chip
                  label={product.trendValue}
                  size='small'
                  color={product.trend === 'positive' ? 'success' : 'error'}
                  variant='tonal'
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default TopSellingProducts
