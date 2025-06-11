import createCache from '@emotion/cache'

const isBrowser = typeof document !== 'undefined'

// Create a client-side cache with a consistent key
export function createEmotionCache() {
  let insertionPoint

  if (isBrowser) {
    const emotionInsertionPoint = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]'
    )

    insertionPoint = emotionInsertionPoint ?? undefined
  }

  return createCache({
    key: 'css', // Use consistent key
    insertionPoint,
    prepend: true
  })
}

// Export the client-side cache
const clientSideEmotionCache = createEmotionCache()

export default clientSideEmotionCache
