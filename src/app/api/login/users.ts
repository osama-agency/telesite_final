// ** Fake user data and data type

// ** Please remove below user data and data type in production and verify user with Real Database
export type UserTable = {
  id: number
  name: string
  email: string
  image: string
  password: string
}

/*
  Fake Database Service
  This service is for default app authentication using Credential Provider
*/

// =============== Fake Data ============================

export const users: UserTable[] = [
  {
    id: 1,
    name: 'Эльдар Администратор',
    password: 'sfera13',
    email: 'go@osama.agency',
    image: '/images/avatars/1.png'
  }
]
