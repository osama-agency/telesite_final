'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import AviasalesOrdersTable from '@views/orders/OrdersTableNew'

const OrdersPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <AviasalesOrdersTable />
      </Grid>
    </Grid>
  )
}

export default OrdersPage
