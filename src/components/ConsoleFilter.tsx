'use client'

import { useEffect } from 'react'

const ConsoleFilter = () => {
  useEffect(() => {
    // Only filter console warnings in development mode
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn
      const originalLog = console.log
      const originalInfo = console.info

      console.warn = (...args) => {
        // Filter out the specific Next.js 15 params enumeration warning
        const message = args.join(' ')

        if (
          message.includes('params are being enumerated') ||
          message.includes('params should be unwrapped with React.use()') ||
          message.toLowerCase().includes('static route')
        ) {
          return
        }

        originalWarn(...args)
      }

      console.log = (...args) => {
        const message = args.join(' ')

        if (message.toLowerCase().includes('static route')) {
          return
        }

        originalLog(...args)
      }

      console.info = (...args) => {
        const message = args.join(' ')

        if (message.toLowerCase().includes('static route')) {
          return
        }

        originalInfo(...args)
      }

      // Cleanup function to restore original console methods
      return () => {
        console.warn = originalWarn
        console.log = originalLog
        console.info = originalInfo
      }
    }
  }, [])

  return null
}

export default ConsoleFilter
