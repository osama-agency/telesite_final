// Next Imports
import type { Metadata } from 'next'

// Component Imports
import ForgotPassword from '@views/ForgotPassword'

export const metadata: Metadata = {
  title: 'Забыли пароль',
  description: 'Восстановление пароля к вашему аккаунту'
}

const ForgotPasswordPage = () => {
  return <ForgotPassword />
}

export default ForgotPasswordPage
