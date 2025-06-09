import { NextRequest } from 'next/server'

// In-memory storage for purchases
let purchases: any[] = []
let purchaseIdCounter = 1

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const status = searchParams.get('status')

    let filteredPurchases = [...purchases]

    // Filter by status if provided
    if (status && status !== 'all') {
      filteredPurchases = filteredPurchases.filter(purchase => purchase.status === status)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    const paginatedPurchases = filteredPurchases.slice(offset, offset + limit)

    return Response.json({
      success: true,
      data: {
        purchases: paginatedPurchases,
        total: filteredPurchases.length,
        page,
        limit,
        totalPages: Math.ceil(filteredPurchases.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplier, items, totalAmount, expectedDeliveryDate, comments, priority } = body

    // Create new purchase record
    const newPurchase = {
      id: purchaseIdCounter++,
      supplier: supplier || 'Неизвестный поставщик',
      items: items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName, // Добавляем название товара
        quantity: item.quantity,
        costTry: item.costTry,
        costRub: item.costRub,
        totalCost: item.costRub * item.quantity
      })),
      totalAmount: totalAmount || 0,
      status: 'в_пути',
      createdAt: new Date().toISOString(),
      expectedDeliveryDate: expectedDeliveryDate,
      comments: comments || '',
      priority: priority || 'normal'
    }

    // Add to storage
    purchases.push(newPurchase)

    console.log('💾 Создана новая закупка:', {
      id: newPurchase.id,
      supplier: newPurchase.supplier,
      itemsCount: newPurchase.items.length,
      totalAmount: newPurchase.totalAmount
    })

    return Response.json({
      success: true,
      data: newPurchase,
      message: 'Закупка успешно создана'
    })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
