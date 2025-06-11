import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  async rewrites() {
    return [
      {
        source: '/api/login',
        destination: '/api/login' // Keep login route handled by Next.js
      },
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*' // NextAuth остается локальным
      },
      {
        source: '/api/purchases/:path*',
        destination: 'http://localhost:3010/api/purchases/:path*' // Purchases API на порту 3010
      },
      {
        source: '/api/purchases',
        destination: 'http://localhost:3010/api/purchases' // Purchases API на порту 3010
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3011/api/:path*'
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/ru/dashboards/crm',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(ru|tr)',
        destination: '/:lang/dashboards/crm',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:ru|tr|front-pages|favicon.ico)\\b)):path',
        destination: '/ru/:path',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
