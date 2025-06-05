// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Types Imports
import type { ThemeColor } from '@core/types'

type dataTypes = {
  title: string
  value: string
  change: number
  icon: string
  color: ThemeColor
}

const deliveryData: dataTypes[] = [
  { title: 'Packages in transit', value: '10k', change: 25.8, icon: 'bx-cube', color: 'primary' },
  { title: 'Packages out for delivery', value: '5k', change: 4.3, icon: 'bx-bxs-truck', color: 'info' },
  { title: 'Packages delivered', value: '15k', change: -12.5, icon: 'bx-check-circle', color: 'success' },
  { title: 'Delivery success rate', value: '95%', change: 35.6, icon: 'bx-bxs-offer', color: 'warning' },
  { title: 'Average delivery time', value: '2.5 Days', change: -2.15, icon: 'bx-time-five', color: 'secondary' },
  { title: 'Customer satisfaction', value: '4.5/5', change: 5.7, icon: 'bx-group', color: 'error' }
]

const LogisticsDeliveryPerformance = () => {
  return (
    <Card>
      <CardHeader
        title='Delivery Performance'
        subheader='12% increase in this month'
        action={<OptionMenu options={['Select All', 'Refresh', 'Share']} />}
      />
      <CardContent className='flex flex-col gap-[1.45rem]'>
        {deliveryData.map((data, index) => (
          <div key={index} className='flex items-center gap-4'>
            <CustomAvatar skin='light' color={data.color} variant='rounded'>
              <i className={data.icon} />
            </CustomAvatar>
            <div className='flex justify-between items-center gap-4 is-full'>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='line-clamp-1'>
                  {data.title}
                </Typography>
                <div className='flex items-center gap-1'>
                  <i
                    className={classnames(
                      data.change > 0 ? 'bx-chevron-up text-success' : 'bx-chevron-down text-error'
                    )}
                  />
                  <Typography color={data.change > 0 ? 'success.main' : 'error.main'}>{data.change}%</Typography>
                </div>
              </div>
              <Typography variant='h6' className='text-nowrap'>
                {data.value}
              </Typography>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default LogisticsDeliveryPerformance
