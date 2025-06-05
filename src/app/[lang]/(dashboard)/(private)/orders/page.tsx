'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import OrdersTable from '@views/orders/OrdersTable'

const OrdersPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrdersTable />
      </Grid>
    </Grid>
  )
}

export default OrdersPage
