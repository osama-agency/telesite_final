// Type Imports
import type { HorizontalMenuDataType } from '@/types/menuTypes'

const horizontalMenuData = (): HorizontalMenuDataType[] => [
  {
    label: 'Dashboards',
    icon: 'bx-home-smile',
    children: [
      {
        label: 'CRM',
        href: '/dashboards/crm'
      },
      {
        label: 'Analytics',
        href: '/dashboards/analytics'
      },
      {
        label: 'eCommerce',
        href: '/dashboards/ecommerce'
      },
      {
        label: 'Academy',
        href: '/dashboards/academy'
      },
      {
        label: 'Logistics',
        href: '/dashboards/logistics'
      }
    ]
  },
  {
    label: 'Apps',
    icon: 'bx-cart-alt',
    children: [
      {
        label: 'Email',
        href: '/apps/email'
      },
      {
        label: 'Chat',
        href: '/apps/chat'
      },
      {
        label: 'Calendar',
        href: '/apps/calendar'
      },
      {
        label: 'Kanban',
        href: '/apps/kanban'
      },
      {
        label: 'Invoice List',
        href: '/apps/invoice/list'
      },
      {
        label: 'User List',
        href: '/apps/user/list'
      }
    ]
  },
  {
    label: 'Pages',
    icon: 'bx-dock-top',
    children: [
      {
        label: 'User Profile',
        href: '/pages/user-profile'
      },
      {
        label: 'Account Settings',
        href: '/pages/account-settings'
      },
      {
        label: 'FAQ',
        href: '/pages/faq'
      },
      {
        label: 'Pricing',
        href: '/pages/pricing'
      }
    ]
  },
  {
    label: 'Forms & Tables',
    icon: 'bx-detail',
    children: [
      {
        label: 'Form Layouts',
        href: '/forms/form-layouts'
      },
      {
        label: 'Form Validation',
        href: '/forms/form-validation'
      },
      {
        label: 'Form Wizard',
        href: '/forms/form-wizard'
      },
      {
        label: 'React Table',
        href: '/react-table'
      }
    ]
  }
]

export default horizontalMenuData
