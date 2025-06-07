import { useState, useEffect, useCallback } from 'react'

export interface CurrencyRates {
  current: number
  currentWithBuffer: number
  average30Days: number
  buffer: number
  lastUpdate: string
  source: string
  nextUpdate: string
}

export interface CurrencyApiResponse {
  success: boolean
  data: CurrencyRates
}

export interface UseCurrencyApiReturn {
  data: CurrencyRates | null
  loading: boolean
  error: string | null
  refreshCurrencyRates: () => Promise<void>
}

export const useCurrencyApi = (): UseCurrencyApiReturn => {
  const [data, setData] = useState<CurrencyRates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCurrencyRates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:3011/api/currency/rates')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: CurrencyApiResponse = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        throw new Error('Failed to fetch currency rates')
      }
    } catch (err) {
      console.error('Currency API Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')

      // Fallback данные при ошибке
      setData({
        current: 2.05,
        currentWithBuffer: 2.15,
        average30Days: 2.03,
        buffer: 0.05,
        lastUpdate: new Date().toISOString(),
        source: 'Fallback',
        nextUpdate: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshCurrencyRates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Обновляем курсы через API
      const refreshResponse = await fetch('http://localhost:3011/api/currency/refresh', {
        method: 'POST'
      })

      if (refreshResponse.ok) {
        // Получаем обновленные курсы
        await fetchCurrencyRates()
      } else {
        throw new Error('Failed to refresh currency rates')
      }
    } catch (err) {
      console.error('Currency Refresh Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [fetchCurrencyRates])

  // Загрузка курсов при монтировании компонента
  useEffect(() => {
    fetchCurrencyRates()
  }, [fetchCurrencyRates])

  // Автообновление каждые 30 минут
  useEffect(() => {
    const interval = setInterval(fetchCurrencyRates, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchCurrencyRates])

  return {
    data,
    loading,
    error,
    refreshCurrencyRates
  }
}

export default useCurrencyApi
