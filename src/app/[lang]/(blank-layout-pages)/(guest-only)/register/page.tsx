// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Register from '@views/Register'

export const metadata: Metadata = {
  title: 'Регистрация',
  description: 'Зарегистрируйте свой аккаунт'
}

const RegisterPage = () => {
  return <Register />
}

export default RegisterPage
