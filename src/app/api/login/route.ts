import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Учетные данные администратора согласно памяти
    if (email === 'go@osama.agency' && password === 'sfera13') {
      return NextResponse.json({
        id: 'admin_user',
        name: 'Root Admin',
        email: 'go@osama.agency',
        role: 'administrator'
      })
    }

    return NextResponse.json(
      { error: 'Неверные учетные данные' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
