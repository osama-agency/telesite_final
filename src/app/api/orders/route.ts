import { NextResponse } from 'next/server'

// GET /api/orders - получить список заказов
export async function GET() {
  try {
    // Проксируем запрос на backend сервер
    const response = await fetch('http://localhost:3011/api/orders', {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching orders:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
