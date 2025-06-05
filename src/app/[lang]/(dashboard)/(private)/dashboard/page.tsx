'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import SalesOverview from '@views/dashboard/SalesOverview'
import RevenueChart from '@views/dashboard/RevenueChart'
import OrderStats from '@views/dashboard/OrderStats'
import Vertical from '@components/card-statistics/Vertical'
import QuickStats from '@views/dashboard/QuickStats'
import TopSellingProducts from '@views/dashboard/TopSellingProducts'
import MonthlyExpenses from '@views/dashboard/MonthlyExpenses'
import RecentOrders from '@views/dashboard/RecentOrders'


const Dashboard = () => {
  return (
    <Grid container spacing={6}>
      {/* Первый ряд - основные графики */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <SalesOverview />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <RevenueChart />
      </Grid>

      {/* Второй ряд - статистики (одинаковая высота) */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ display: 'flex', '& > *': { width: '100%' } }}>
        <MonthlyExpenses />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ display: 'flex', '& > *': { width: '100%' } }}>
        <OrderStats />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ display: 'flex', '& > *': { width: '100%' } }}>
        <Vertical
          title='Прибыль'
          imageSrc='/images/cards/cube-secondary-bg.png'
          stats='₽0'
          trendNumber={0}
          trend='positive'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ display: 'flex', '& > *': { width: '100%' } }}>
        <QuickStats />
      </Grid>

      {/* Третий ряд - таблицы (одинаковая высота) */}
      <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', '& > *': { width: '100%' } }}>
        <TopSellingProducts />
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex', '& > *': { width: '100%' } }}>
        <RecentOrders />
      </Grid>
    </Grid>
  )
}

export default Dashboard
