'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

const HomePage = () => {
  const router = useRouter()

  useEffect(() => {
    // Автоматический редирект на /ru/dashboard
    router.replace('/ru/dashboard')
  }, [router])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      Перенаправление на дашборд...
    </div>
  )
}

export default HomePage
