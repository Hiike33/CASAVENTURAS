import { defineRouting } from 'next-intl/routing'

// Supported locales for Casa Venturas.
// EN is the default and the fallback when a translation is missing.
// Order matters for the middleware's language negotiation — EN first
// so unknown Accept-Language headers default to it.
export const routing = defineRouting({
  locales: ['en', 'es', 'fr'] as const,
  defaultLocale: 'en',
  // "as-needed": default locale (EN) served at /, others under /es/ and /fr/.
  // No forced redirect for EN users landing on the bare URL.
  localePrefix: 'as-needed',
  // NEXT_LOCALE cookie hardening : Secure flag in production so the cookie
  // is never transmitted over plain HTTP (HSTS already blocks this at the
  // browser level, but defense-in-depth is cheap). NODE_ENV is statically
  // replaced at build time by Next ; in dev (localhost HTTP) the flag is
  // turned off so browsers actually accept the cookie. SameSite=lax is the
  // next-intl default and is appropriate for a non-auth preference cookie.
  // No maxAge set — session cookie keeps GDPR compliance simple (no consent
  // banner needed for session-only locale persistence).
  localeCookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
})

export type Locale = (typeof routing.locales)[number]
