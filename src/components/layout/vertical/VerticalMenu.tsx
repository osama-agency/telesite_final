// Next Imports
// import { useParams } from 'next/navigation'

// MUI Imports
// import { useTheme } from '@mui/material/styles'
// import { Box } from '@mui/material'

// Third-party Imports
// import PerfectScrollbar from 'react-perfect-scrollbar'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Wallet
} from 'lucide-react'

// Type Imports
// import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
// import { Menu } from '@menu/vertical-menu'
import SidebarItem from './SidebarItem'
// import SidebarUserStatus from './SidebarUserStatus'

// Hook Imports
// import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
// import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
// import menuItemStyles from '@core/styles/vertical/menuItemStyles'
// import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
// import menuData from '@/data/navigation/verticalMenuData'

const VerticalMenu = () => {
  return (
    <>
      <SidebarItem icon={LayoutDashboard} label="Дашборд" href="/ru/dashboard" />
      <SidebarItem icon={ShoppingCart} label="Заказы" href="/ru/orders" />
      <SidebarItem icon={Package} label="Товары" href="/ru/products" />
      <SidebarItem icon={Truck} label="Закупки" href="/ru/procurement" />
      <SidebarItem icon={Wallet} label="Расходы" href="/ru/expenses" />
    </>
  )
}

export default VerticalMenu
