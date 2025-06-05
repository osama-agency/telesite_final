// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'
import TextField from '@mui/material/TextField'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { NotificationsType } from '@components/layout/shared/NotificationsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import Logo from '@components/layout/shared/Logo'
import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'
import { getLocalizedUrl } from '@/utils/i18n'

// Store Imports
import { useDateRangeStore } from '@/store/dateRangeStore'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Vars
const notifications: NotificationsType[] = [
  {
    avatarImage: '/images/avatars/8.png',
    title: 'Congratulations Flora 🎉',
    subtitle: 'Won the monthly bestseller gold badge',
    time: '1h ago',
    read: false
  },
  {
    title: 'Cecilia Becker',
    avatarColor: 'secondary',
    subtitle: 'Accepted your connection',
    time: '12h ago',
    read: false
  },
  {
    avatarImage: '/images/avatars/3.png',
    title: 'Bernard Woods',
    subtitle: 'You have new message from Bernard Woods',
    time: 'May 18, 8:26 AM',
    read: true
  },
  {
    avatarIcon: 'bx-bar-chart',
    title: 'Monthly report generated',
    subtitle: 'July month financial report is generated',
    avatarColor: 'info',
    time: 'Apr 24, 10:30 AM',
    read: true
  },
  {
    avatarText: 'MG',
    title: 'Application has been approved 🚀',
    subtitle: 'Your Meta Gadgets project application has been approved.',
    avatarColor: 'success',
    time: 'Feb 17, 12:17 PM',
    read: true
  },
  {
    avatarIcon: 'bx-envelope',
    title: 'New message from Harry',
    subtitle: 'You have new message from Harry',
    avatarColor: 'error',
    time: 'Jan 6, 1:48 PM',
    read: true
  }
]

const NavbarContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()
  const { lang: locale } = useParams()
  const { range, setRange } = useDateRangeStore()

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
        {/* Hide Logo on Smaller screens */}
        {!isBreakpointReached && (
          <Link href={getLocalizedUrl('/', locale as Locale)}>
            <Logo />
          </Link>
        )}
      </div>

      <div className='flex items-center'>
        <span style={{color: 'red', marginRight: '10px'}}>TEST DATEPICKER HERE:</span>
        <AppReactDatepicker
          selected={new Date()}
          onChange={(date) => console.log('Date changed:', date)}
        />
        <AppReactDatepicker
          selectsRange
          startDate={range.start ?? undefined}
          endDate={range.end ?? undefined}
          onChange={(dates: [Date | null, Date | null]) => setRange({ start: dates[0], end: dates[1] })}
          customInput={
            <TextField
              size="small"
              variant="outlined"
              value={
                (range.start ? range.start.toLocaleDateString() : 'Начало') +
                ' — ' +
                (range.end ? range.end.toLocaleDateString() : 'Конец')
              }
              sx={{
                minWidth: 220,
                mr: 2,
                background: 'rgba(35,39,47,0.9)',
                borderRadius: 2,
                input: { color: 'white', cursor: 'pointer' },
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#DF4C9D' }
              }}
              InputProps={{
                startAdornment: <i className="bx-calendar text-xl" style={{ marginRight: 8, color: '#DF4C9D' }} />,
                readOnly: true
              }}
            />
          }
          dateFormat="dd.MM.yyyy"
          popperPlacement="bottom-end"
        />
        <LanguageDropdown />
        <ModeDropdown />
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
        {/* Language Dropdown, Notification Dropdown, quick access menu dropdown, user dropdown will be placed here */}
      </div>
    </div>
  )
}

export default NavbarContent
