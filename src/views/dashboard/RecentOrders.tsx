'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'

// Components Imports

// Sample Data
const ordersData: any[] = []

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'success'
    case 'pending':
      return 'warning'
    case 'shipped':
      return 'info'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

const RecentOrders = () => {
  return (
    <Card>
      <CardHeader
        title='Последние заказы'
      />
      <CardContent className='p-0'>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Заказ</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Товар</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordersData.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant='body2' className='font-medium'>
                      {order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-x-3'>
                      <Avatar src={order.avatar} className='w-8 h-8' />
                      <Typography variant='body2' className='font-medium'>
                        {order.customer}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>
                      {order.product}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' className='font-medium'>
                      {order.amount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.statusText}
                      size='small'
                      color={getStatusColor(order.status) as any}
                      variant='tonal'
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default RecentOrders
