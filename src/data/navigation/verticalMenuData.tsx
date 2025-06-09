// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Дашборд',
    icon: 'bx-home-smile',
    href: '/dashboard'
  },
  {
    label: 'Заказы',
    icon: 'bx-cart-alt',
    href: '/orders'
  },
  {
    label: 'Товары',
    icon: 'bx-package',
    href: '/products'
  },
  {
    label: 'Закупки',
    icon: 'bx-store',
    href: '/procurement'
  },
  {
    label: 'Расходы',
    icon: 'bx-money',
    href: '/expenses'
  },
  {
    label: 'Финансовая аналитика',
    icon: 'bx-trending-up',
    href: '/financial-analytics'
  }
]

export default verticalMenuData
