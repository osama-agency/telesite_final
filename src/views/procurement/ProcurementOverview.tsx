'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

const ProcurementOverview = () => {
  return (
    <Card>
      <CardHeader title='Закупки' />
      <CardContent>
        <div className='flex items-center gap-x-2'>
          <Typography variant='h2'>₽1,247,890</Typography>
        </div>
        <div className='flex gap-x-2 mbs-1'>
          <Chip label='+12%' size='small' color='success' variant='tonal' />
          <Typography>Сумма закупок</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProcurementOverview
