'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

const RecentShipments = () => {
  const shipments: any[] = []

  return (
    <Card>
      <CardHeader title='Недавние отправки' />
      <CardContent>
        {shipments.length === 0 ? (
          <Box
            sx={{
              py: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography variant='body2'>Отправки отсутствуют</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {shipments.map((shipment, index) => (
              <ListItem key={shipment.id} className={index !== shipments.length - 1 ? 'border-be' : ''}>
                <Avatar className='me-4 bg-primary/10 text-primary'>
                  <i className='bx-package' />
                </Avatar>
                <ListItemText
                  primary={
                    <div className='flex items-center justify-between'>
                      <Typography variant='body2' className='font-medium'>
                        {shipment.id}
                      </Typography>
                      <Chip
                        label={shipment.status}
                        size='small'
                        variant='tonal'
                        color={shipment.status === 'Доставлено' ? 'success' : 'warning'}
                      />
                    </div>
                  }
                  secondary={
                    <div className='flex items-center justify-between'>
                      <Typography variant='body2' color='text.secondary'>
                        {shipment.destination}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {shipment.date}
                      </Typography>
                    </div>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentShipments
