import { NextResponse } from 'next/server'

// GET /api/products - получить список товаров
export async function GET() {
  try {
    // Проксируем запрос на backend сервер
    const response = await fetch('http://localhost:3011/api/products', {
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
    console.error('Error fetching products:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
