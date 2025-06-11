import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Заглушка данных о валютах (те же данные, что в useCurrencyApi.ts)
    const mockCurrencyData = {
      current: 2.0252,
      currentWithBuffer: 2.1264, // current * 1.05
      average30Days: 2.03,
      buffer: 5, // 5%
      lastUpdate: new Date().toISOString(),
      source: 'Mock API (для тестирования)',
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // завтра
    }

    return NextResponse.json({
      success: true,
      data: mockCurrencyData
    })
  } catch (error) {
    console.error('❌ Currency API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch currency rates',
        data: null
      },
      { status: 500 }
    )
  }
}
