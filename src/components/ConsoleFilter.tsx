'use client'

import { useEffect } from 'react'

const ConsoleFilter = () => {
  useEffect(() => {
    // Only filter console warnings in development mode
    if (process.env.NODE_ENV === 'development') {
      const originalWarn = console.warn

      console.warn = (...args) => {
        // Filter out the specific Next.js 15 params enumeration warning
        const message = args.join(' ')

        if (
          message.includes('params are being enumerated') ||
          message.includes('params should be unwrapped with React.use()')
        ) {
          return
        }

        originalWarn(...args)
      }

      // Cleanup function to restore original console.warn
      return () => {
        console.warn = originalWarn
      }
    }
  }, [])

  return null
}

export default ConsoleFilter
