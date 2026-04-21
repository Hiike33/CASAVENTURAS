const createNextIntlPlugin = require('next-intl/plugin')

// next-intl resolves messages per locale via i18n/request.ts at the path below.
const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so file tracing doesn't walk up to $HOME where
  // stale empty package-lock.json files can mislead Next's autodetection.
  outputFileTracingRoot: __dirname,
  // Suppress the X-Powered-By: Next.js header at the framework level so
  // middleware.delete('X-Powered-By') isn't racing against the runtime.
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
