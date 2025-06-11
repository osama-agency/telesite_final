import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()

    const response = await fetch(`http://localhost:3011/api/purchases/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error updating purchase status:', error)

    return NextResponse.json({
      success: false,
      error: 'Ошибка обновления статуса закупки'
    }, { status: 500 })
  }
}
