import { useEffect, useState } from 'react'

/**
 * Hook to check if component is mounted on client side
 * Prevents hydration mismatches by ensuring client-only rendering
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

export default useClientOnly
