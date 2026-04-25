import { Link } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'

// 404 page rendered when a route inside [locale] doesn't match anything.
// next-intl's middleware routes unknown paths to the closest not-found.tsx;
// for a locale-prefixed app this file catches every miss within a locale.
//
// Pattern aligned with app/[locale]/tours/*/page.tsx — inline COPY object
// per locale rather than messages/*.json. Trade-off: no missing-key risk
// at runtime, at the cost of duplicating the i18n machinery for one page.
//
// Style is LIGHT-FIRST per CLAUDE.md design system : white background,
// brand accent #248D6C on links, Figtree weights, no hero image.

const COPY = {
  en: {
    eyebrow: '404',
    heading: 'Off the beaten path',
    body: 'This page does not exist — or it sailed off without us. Let us point you back to where the experiences are.',
    home: '← Back to home',
    tours: 'View experiences →',
  },
  es: {
    eyebrow: '404',
    heading: 'Fuera de ruta',
    body: 'Esta página no existe — o zarpó sin nosotros. Te llevamos de vuelta al sitio donde están las experiencias.',
    home: '← Volver al inicio',
    tours: 'Ver experiencias →',
  },
  fr: {
    eyebrow: '404',
    heading: 'Hors des sentiers battus',
    body: "Cette page n'existe pas — ou elle a levé l'ancre sans nous. On te ramène vers les expériences.",
    home: "← Retour à l'accueil",
    tours: 'Voir les expériences →',
  },
} as const

function resolveLocale(raw: string): Locale {
  return (routing.locales as readonly string[]).includes(raw) ? (raw as Locale) : routing.defaultLocale
}

export default async function NotFound() {
  const raw = await getLocale()
  const locale = resolveLocale(raw)
  const t = COPY[locale]

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
          <Link
            href="/"
            className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#248D6C] hover:text-[#1C6E54] transition-colors"
          >
            {t.home}
          </Link>
          <span className="hidden sm:inline text-[#E5E5E5]">·</span>
          <Link
            href="/#tours"
            className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#248D6C] hover:text-[#1C6E54] transition-colors"
          >
            {t.tours}
          </Link>
        </div>
      </div>
    </main>
  )
}
