import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-aware navigation helpers. `Link` auto-prefixes the current locale
// (except `defaultLocale` under `localePrefix: 'as-needed'`), `usePathname`
// returns the path stripped of the locale segment, and `useRouter` accepts
// an optional `{ locale }` option for switching languages.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
