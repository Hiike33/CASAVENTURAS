/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

module.exports = nextConfig
