'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

type ApiStatus = 'connected' | 'disconnected' | 'checking'

export const useApiStatus = () => {
  const [status, setStatus] = useState<ApiStatus>('checking')

  const checkApiStatus = useCallback(async () => {
    try {
      setStatus('checking')

      // Проверяем реальные API endpoints, которые используются приложением
      const [productsResponse, ordersResponse] = await Promise.allSettled([
        fetch('/api/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        }),
        fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        })
      ])

      // Проверяем, что хотя бы один endpoint работает
      let hasWorkingEndpoint = false

            if (productsResponse.status === 'fulfilled' && productsResponse.value.ok) {
        const data = await productsResponse.value.json()

        if (data.success !== false) {
          hasWorkingEndpoint = true
        }
      }

      if (ordersResponse.status === 'fulfilled' && ordersResponse.value.ok) {
        const data = await ordersResponse.value.json()

        if (data.success !== false) {
          hasWorkingEndpoint = true
        }
      }

      if (hasWorkingEndpoint) {
        setStatus('connected')
      } else {
        setStatus('disconnected')
      }
    } catch (error) {
      console.error('API Status Check Error:', error)
      setStatus('disconnected')
    }
  }, [])

  useEffect(() => {
    // Проверяем статус при монтировании
    checkApiStatus()

    // Периодически проверяем статус каждые 30 секунд
    const interval = setInterval(checkApiStatus, 30000)

    return () => clearInterval(interval)
  }, [checkApiStatus])

  return {
    status,
    checkStatus: checkApiStatus
  }
}
