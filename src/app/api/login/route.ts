// Next Imports
import { NextRequest, NextResponse } from 'next/server'

import type { UserTable } from './users'

type ResponseUser = Omit<UserTable, 'password'>

// Mock data for demo purpose
import { users } from './users'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Простая проверка для демо
    if (email === 'go@osama.agency' && password === 'sfera13') {
      return NextResponse.json({
        id: '1',
        name: 'Root Admin',
        email: 'go@osama.agency',
        role: 'admin'
      })
    }

    // Дополнительные тестовые пользователи
    if (email === 'admin@test.com' && password === 'admin123') {
      return NextResponse.json({
        id: '2',
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'admin'
      })
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
