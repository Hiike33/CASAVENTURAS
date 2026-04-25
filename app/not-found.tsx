import Link from 'next/link'

// Root-level fallback for paths the next-intl middleware can't route into
// a locale (e.g. malformed URLs, paths bypassing the matcher). The locale-
// aware branded 404 lives at app/[locale]/not-found.tsx — that one fires
// for any unknown path inside a locale via the [...rest] catch-all. This
// file is reached only when no locale segment was resolved.
//
// Reference : https://next-intl.dev/docs/environments/error-files

export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#FFFFFF',
          color: '#111111',
          padding: '24px',
        }}
      >
        <div style={{ maxWidth: '520px', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#248D6C',
              marginBottom: '16px',
            }}
          >
            404
          </p>
          <h1
            style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 300,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: '0 0 24px',
            }}
          >
            Off the beaten path
          </h1>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 300,
              color: '#4F4F4E',
              lineHeight: 1.6,
              marginBottom: '40px',
            }}
          >
            This page doesn&apos;t exist. Let us point you back.
          </p>
          <Link
            href="/"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#248D6C',
              textDecoration: 'none',
            }}
          >
            ← Back to home
          </Link>
        </div>
      </body>
    </html>
  )
}
