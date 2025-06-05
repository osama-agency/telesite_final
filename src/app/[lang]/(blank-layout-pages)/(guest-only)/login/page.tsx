// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Login from '@views/Login'

export const metadata: Metadata = {
  title: 'Вход',
  description: 'Войдите в свой аккаунт'
}

const LoginPage = () => {
  return <Login />
}

export default LoginPage
