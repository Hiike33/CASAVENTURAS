'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

// Runtime error boundary for routes inside [locale]. Must be a Client
// Component because Next requires `reset` and the boundary itself runs
// on the client to recover. Logs the error to the console (and via that
// to Cloudflare Workers logs since observability.enabled=true in
// wrangler.jsonc) so we can investigate post-mortem.
//
// Out of scope : capturing the error to an external sink (Sentry/Datadog).
// CSP already allows the violation reporter, but no APM is wired yet.

const COPY = {
  en: {
    eyebrow: 'Error',
    heading: 'Choppy waters',
    body: "Something went sideways on our end. Try again — usually it's a one-off. If it sticks, write to us and we'll sort it.",
    retry: 'Try again',
    home: '← Back to home',
    contact: 'Contact us →',
  },
  es: {
    eyebrow: 'Error',
    heading: 'Aguas turbulentas',
    body: 'Algo salió mal de nuestro lado. Intenta de nuevo — normalmente es puntual. Si persiste, escríbenos y lo arreglamos.',
    retry: 'Reintentar',
    home: '← Volver al inicio',
    contact: 'Contáctanos →',
  },
  fr: {
    eyebrow: 'Erreur',
    heading: 'Mer agitée',
    body: "Quelque chose a dérapé chez nous. Réessaie — c'est souvent ponctuel. Si ça persiste, écris-nous et on règle ça.",
    retry: 'Réessayer',
    home: "← Retour à l'accueil",
    contact: 'Contacte-nous →',
  },
} as const

function resolveLocale(raw: string): Locale {
  return (routing.locales as readonly string[]).includes(raw) ? (raw as Locale) : routing.defaultLocale
}

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const locale = resolveLocale(useLocale())
  const t = COPY[locale]

  useEffect(() => {
    // Prefix log so it stands out in CF Workers observability logs alongside
    // the [csp-violation] / [contact] / [bokun/...] tags used elsewhere.
    console.error('[error-boundary]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-24 bg-white">
      <div className="max-w-xl text-center">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-4">
          {t.eyebrow}
        </p>
        <h1 className="text-[clamp(40px,6vw,72px)] font-light text-[#111] leading-[1.05] tracking-[-0.02em] mb-6">
          {t.heading}
        </h1>
        <p className="text-[16px] font-light text-[#4F4F4E] leading-relaxed mb-12">
          {t.body}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            type="button"
            onClick={reset}
            className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white bg-[#248D6C] hover:bg-[#1C6E54] transition-colors px-8 py-3"
          >
            {t.retry}
          </button>
          <Link
            href="/"
            className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#248D6C] hover:text-[#1C6E54] transition-colors"
          >
            {t.home}
          </Link>
          <span className="hidden sm:inline text-[#E5E5E5]">·</span>
          <Link
            href="/contact"
            className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#248D6C] hover:text-[#1C6E54] transition-colors"
          >
            {t.contact}
          </Link>
        </div>
      </div>
    </main>
  )
}
