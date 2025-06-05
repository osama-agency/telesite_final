'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

export default function ExpensesOverview() {
  return (
    <Card>
      <CardHeader title='Расходы' />
      <CardContent>
        <div className='flex items-center gap-x-2'>
          <Typography variant='h2'>₽684,560</Typography>
        </div>
        <div className='flex gap-x-2 mbs-1'>
          <Chip label='-5%' size='small' color='error' variant='tonal' />
          <Typography>Месячные расходы</Typography>
        </div>
      </CardContent>
    </Card>
  )
}
