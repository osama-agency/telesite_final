import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for purchases
let purchases: any[] = []
let purchaseIdCounter = 1

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const backendUrl = `http://localhost:3011/api/purchases${queryString ? `?${queryString}` : ''}`

    const response = await fetch(backendUrl)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying purchases request:', error)
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения закупок'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch('http://localhost:3011/api/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json({
      success: false,
      error: 'Ошибка создания закупки'
    }, { status: 500 })
  }
}
