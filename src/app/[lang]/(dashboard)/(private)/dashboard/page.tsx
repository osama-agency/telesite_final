'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Components Imports
import BusinessKPICards from '@views/dashboard/BusinessKPICards'
import SalesRevenueChart from '@views/dashboard/SalesRevenueChart'
import OrderTrendsChart from '@views/dashboard/OrderTrendsChart'
import ProductPerformanceChart from '@views/dashboard/ProductPerformanceChart'
import ExpenseAnalysisChart from '@views/dashboard/ExpenseAnalysisChart'
import ProfitMarginChart from '@views/dashboard/ProfitMarginChart'
import InventoryStatusChart from '@views/dashboard/InventoryStatusChart'
import RecentOrdersList from '@views/dashboard/RecentOrdersList'
import TopProductsAnalysis from '@views/dashboard/TopProductsAnalysis'

const Dashboard = () => {
  return (
    <Grid container spacing={6}>
      {/* KPI Cards - Первый ряд */}
      <Grid size={{ xs: 12 }}>
        <BusinessKPICards />
      </Grid>

      {/* Основные графики - Второй ряд */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <SalesRevenueChart />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <ProfitMarginChart />
      </Grid>

      {/* Детальная аналитика - Третий ряд */}
      <Grid size={{ xs: 12, md: 6 }}>
        <OrderTrendsChart />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ExpenseAnalysisChart />
      </Grid>

      {/* Товарная аналитика - Четвертый ряд */}
      <Grid size={{ xs: 12, lg: 7 }}>
        <ProductPerformanceChart />
      </Grid>
      <Grid size={{ xs: 12, lg: 5 }}>
        <InventoryStatusChart />
      </Grid>

      {/* Списки и таблицы - Пятый ряд */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <RecentOrdersList />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <TopProductsAnalysis />
      </Grid>
    </Grid>
  )
}

export default Dashboard
