import { notFound } from 'next/navigation'

// Catch-all that fires the closest not-found.tsx boundary (i.e.
// app/[locale]/not-found.tsx) when a request inside a locale doesn't
// match any defined route. Required by next-intl App Router pattern —
// without this, unknown paths like /lol-not-real fall through to the
// framework default `/_not-found` page, bypassing our branded 404.
//
// Reference : https://next-intl.dev/docs/environments/error-files
export default function CatchAll(): never {
  notFound()
}
