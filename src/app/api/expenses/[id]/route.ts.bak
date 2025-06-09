// Proxy API route для работы с конкретным расходом по ID
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3011'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const backendUrl = `${BACKEND_URL}/api/expenses/${params.id}`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    // Маппим данные: преобразуем comment в description для фронтенда
    if (data.success && data.data) {
      data.data = {
        ...data.data,
        description: data.data.comment || '',
        amount: parseFloat(data.data.amount) || 0
      }
    }

    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Error proxying GET /api/expenses/:id:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch expense' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json()
    const backendUrl = `${BACKEND_URL}/api/expenses/${params.id}`

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (data.success && data.data) {
      data.data = {
        ...data.data,
        description: data.data.comment || '',
        amount: parseFloat(data.data.amount) || 0
      }
    }

    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Error proxying PUT /api/expenses/:id:', error)
    return Response.json(
      { success: false, error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const backendUrl = `${BACKEND_URL}/api/expenses/${params.id}`

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Error proxying DELETE /api/expenses/:id:', error)
    return Response.json(
      { success: false, error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
