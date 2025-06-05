import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
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
