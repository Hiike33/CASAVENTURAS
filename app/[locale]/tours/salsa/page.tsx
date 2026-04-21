import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ReviewsStrip from '@/components/ReviewsStrip'
import TourGallery from '@/components/TourGallery'
import BookingSidebar from '@/components/BookingSidebar'
import SchemaOrg from '@/components/SchemaOrg'
import Breadcrumb from '@/components/Breadcrumb'
import StickyMobileCTA from '@/components/StickyMobileCTA'
import HeroVideo from '@/components/HeroVideo'
import { getCMS } from '@/lib/cms'
import { localizedAlternates } from '@/lib/seo/alternates'
import { routing, type Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: string }> }

const COPY = {
  en: {
    heroIntro: "Todo suena mejor con salsa. Even if you've never danced before.",
    bookThis: 'Book this tour',
    allExperiences: '← All experiences',
    perPerson: 'Per person',
    durationLabel: 'Duration',
    daily: 'Daily',
    beginner: 'Beginner',
    noExperience: 'No experience',
    aboutEyebrow: 'About this experience',
    aboutHeading: 'Dance. Laugh.\nSip. Repeat.',
    aboutP1: "Even if you've never danced before, our professional instructor Zoe will have you moving to the rhythm in no time. Have a blast, get some exercise, meet new people, and gain confidence with the power of Latin dance.",
    aboutP2: 'Zoe loves teaching beginners because she knows the first impression salsa makes stays forever. She has the skills to make that first impression memorable, enjoyable, and fun, in a social atmosphere that feels nothing like a formal class.',
    aboutP3: "The class takes place on the rooftop of Casa Santurce at sunset: city panorama, warm breeze, golden light. At the end you enjoy a free Piña Colada while the sun dips into the San Juan skyline.",
    includedHeader: "What's included",
    gettingThereHeader: 'Getting there',
    uberNote: '20-min Uber or taxi from Old San Juan.',
    afterBooking: 'After booking, go directly to 1050 Calle Marianna, 00907 San Juan, Casa Santurce Rooftop. Zoe will be waiting at 5 PM.',
    fullDayEyebrow: 'Make it a full day',
    fullDayBody: 'Combine with an El Yunque morning tour, back by 3 PM, salsa at 5 PM. Cavi can plan the whole day.',
    planCavi: 'Plan with Cavi →',
    whatTravelersSay: 'What travelers say',
    reviewsHeader: 'Casa Venturas reviews',
    otherEyebrow: 'Other experiences',
    otherHeading: 'Explore more adventures',
    viewAll: 'View all →',
    fromPrice: 'From ${price}',
    book: 'Book',
  },
  es: {
    heroIntro: 'Todo suena mejor con salsa, aunque nunca hayas bailado antes.',
    bookThis: 'Reserva este tour',
    allExperiences: '← Todas las experiencias',
    perPerson: 'Por persona',
    durationLabel: 'Duración',
    daily: 'Todos los días',
    beginner: 'Principiante',
    noExperience: 'Sin experiencia',
    aboutEyebrow: 'Sobre esta experiencia',
    aboutHeading: 'Baila. Ríe.\nBrinda. Repite.',
    aboutP1: 'Aunque nunca hayas bailado, nuestra instructora profesional Zoe te tiene moviéndote al ritmo en un ratito. Diviértete, haz algo de ejercicio, conoce gente nueva y gana confianza con la fuerza del baile latino.',
    aboutP2: 'A Zoe le encanta enseñar a principiantes porque sabe que la primera impresión que deja la salsa se queda para siempre. Tiene el toque para que esa primera impresión sea inolvidable, divertida y ligera, en un ambiente social que no tiene nada que ver con una clase formal de estudio.',
    aboutP3: 'La clase es en la azotea de Casa Santurce al atardecer: panorama urbano, brisa cálida, luz dorada. Al final, te tomas una piña colada gratis mientras el sol se mete por el skyline de San Juan.',
    includedHeader: 'Qué está incluido',
    gettingThereHeader: 'Cómo llegar',
    uberNote: 'Uber o taxi de 20 minutos desde el Viejo San Juan.',
    afterBooking: 'Después de reservar, ve directo a 1050 Calle Marianna, 00907 San Juan, Casa Santurce Rooftop. Zoe te espera a las 5 PM.',
    fullDayEyebrow: 'Haz un día completo',
    fullDayBody: 'Combínalo con un tour de El Yunque en la mañana: de vuelta a las 3 PM, salsa a las 5 PM. Cavi te arma el plan completo.',
    planCavi: 'Arma el plan con Cavi →',
    whatTravelersSay: 'Lo que dicen los viajeros',
    reviewsHeader: 'Reseñas de Casa Venturas',
    otherEyebrow: 'Otras experiencias',
    otherHeading: 'Explora más aventuras',
    viewAll: 'Ver todas →',
    fromPrice: 'Desde ${price}',
    book: 'Reserva',
  },
  fr: {
    heroIntro: "Todo suena mejor con salsa. Même si tu n'as jamais dansé.",
    bookThis: 'Réserver ce tour',
    allExperiences: '← Toutes les expériences',
    perPerson: 'Par personne',
    durationLabel: 'Durée',
    daily: 'Tous les jours',
    beginner: 'Débutant',
    noExperience: 'Aucune expérience',
    aboutEyebrow: 'À propos de cette expérience',
    aboutHeading: 'Danse. Ris.\nSirote. Recommence.',
    aboutP1: "Même si tu n'as jamais dansé, notre instructrice pro Zoe te fait bouger sur le rythme en un rien de temps. Amuse-toi, bouge un peu, rencontre du monde, et prends confiance avec la force de la danse latine.",
    aboutP2: "Zoe adore enseigner aux débutants parce qu'elle sait que la première impression que la salsa laisse reste pour toujours. Elle a le tact pour rendre cette première impression mémorable, agréable et décontractée, dans une ambiance sociale qui n'a rien d'un cours de studio formel.",
    aboutP3: "Le cours se passe sur le rooftop de Casa Santurce au coucher du soleil : panorama urbain, brise tiède, lumière dorée. À la fin, tu profites d'une piña colada offerte pendant que le soleil glisse sur le skyline de San Juan.",
    includedHeader: 'Ce qui est inclus',
    gettingThereHeader: 'Comment y aller',
    uberNote: 'Uber ou taxi de 20 minutes depuis le Vieux San Juan.',
    afterBooking: "Après la réservation, va directement au 1050 Calle Marianna, 00907 San Juan, Casa Santurce Rooftop. Zoe t'attend à 17h.",
    fullDayEyebrow: "Fais-en une journée complète",
    fullDayBody: "Combine avec un tour d'El Yunque le matin : retour à 15h, salsa à 17h. Cavi te monte la journée complète.",
    planCavi: 'Monte le plan avec Cavi →',
    whatTravelersSay: 'Ce que disent les voyageurs',
    reviewsHeader: 'Avis Casa Venturas',
    otherEyebrow: 'Autres expériences',
    otherHeading: "Explore d'autres aventures",
    viewAll: 'Voir toutes →',
    fromPrice: 'À partir de {price}$',
    book: 'Réserve',
  },
} as const

function resolveLocale(raw: string): Locale {
  return (routing.locales as readonly string[]).includes(raw) ? (raw as Locale) : routing.defaultLocale
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale = resolveLocale(raw)
  const cms = getCMS()
  const [tour, siteConfig] = await Promise.all([cms.getTour('salsa', locale), cms.getSiteConfig(locale)])
  if (!tour) return {}
  const title = locale === 'es'
    ? 'Clase de salsa en azotea San Juan | Casa Venturas'
    : locale === 'fr'
      ? 'Cours de salsa sur rooftop à San Juan | Casa Venturas'
      : 'Sunset Salsa Lesson San Juan Rooftop | Casa Venturas'
  return {
    title,
    description: tour.description,
    alternates: localizedAlternates('/tours/salsa', locale as Locale, siteConfig.url),
    openGraph: {
      title: tour.name,
      description: tour.description,
      url: `${siteConfig.url}/tours/salsa`,
      images: [{ url: tour.photos[0], width: 1200, height: 800 }],
      type: 'website',
    },
  }
}

export default async function SalsaPage({ params }: Props) {
  const { locale: raw } = await params
  const locale = resolveLocale(raw)
  setRequestLocale(locale)

  const cms = getCMS()
  const [tour, tours, reviews, siteConfig, faqs, guides] = await Promise.all([
    cms.getTour('salsa', locale),
    cms.getTours(locale),
    cms.getReviews(undefined, locale),
    cms.getSiteConfig(locale),
    cms.getFaqs('salsa', locale),
    cms.getGuides('salsa', locale),
  ])
  if (!tour) notFound()

  const t = COPY[locale]

  return (
    <>
      <SchemaOrg tour={tour} faqs={faqs} guides={guides} locale={locale} />
      <Breadcrumb items={[
        { name: 'Home', url: '/' },
        { name: 'Experiences', url: '/#tours' },
        { name: tour.shortName, url: `/tours/${tour.slug}` },
      ]} />
      <Nav />

      <main>
      <section
        className="relative flex flex-col justify-end overflow-hidden pt-[120px] pb-12 px-6 md:pt-[140px] md:pb-[60px] md:px-[52px] min-h-[65vh]"
        style={{ background: '#1E0E08' }}
      >
        <HeroVideo src="/videos/hero-salsa.mp4" poster="/images/posters/hero-salsa.jpg" alt={tour.name} opacity={0.7} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0704]/95 via-[#0f0704]/40 to-transparent" />
        <div className="relative z-10">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#D4A872] mb-5 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#D4A872]" />
            {tour.heroTag}
          </p>
          <h1 className="text-white font-light leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(40px, 7vw, 72px)' }}>
            {tour.name}
          </h1>
          <p className="text-white/60 text-[15px] font-light max-w-lg leading-relaxed mb-10 italic">
            {t.heroIntro}
          </p>
          <div className="flex items-center gap-7 flex-wrap">
            <a href="#book" className="bg-[#248D6C] text-white text-[10.5px] font-semibold tracking-[0.15em] uppercase px-8 py-3.5 hover:bg-[#1C6E54] transition-colors">
              {t.bookThis}
            </a>
            <Link href="/#tours" className="text-white/70 text-[10.5px] font-medium tracking-[0.14em] uppercase border-b border-white/20 pb-1 hover:text-white hover:border-white/60 transition-colors">
              {t.allExperiences}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8e8e8]">
        {[
          { n: `$${tour.price}`, l: t.perPerson },
          { n: tour.duration, l: t.durationLabel },
          { n: '5 PM', l: t.daily },
          { n: t.beginner, l: t.noExperience },
        ].map((s, i) => (
          <div key={i} className="bg-[#f5f5f5] text-center py-6 px-4">
            <p className="text-[22px] font-light text-[#111] tracking-tight leading-tight">{s.n}</p>
            <p className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2.5">{t.aboutEyebrow}</p>
          <h2 className="text-[#111] text-[clamp(28px,3.2vw,40px)] font-light tracking-tight mb-6 leading-tight whitespace-pre-line">
            {t.aboutHeading}
          </h2>
          <div className="text-[15px] font-light text-[#354040] leading-[1.8] space-y-5 text-left md:text-center">
            <p>{t.aboutP1}</p>
            <p>{t.aboutP2}</p>
            <p>{t.aboutP3}</p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24" aria-label={tour.name}>
        <TourGallery photos={tour.galleryPhotos ?? tour.photos} tourName={tour.name} priority />
      </section>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 pb-16 md:pb-24">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-[#111] text-[22px] font-light mb-4">{t.includedHeader}</h3>
          <ul className="space-y-2.5">
            {tour.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
                <span className="inline-block w-1.5 h-1.5 bg-[#248D6C] mt-2 flex-shrink-0" aria-hidden />
                {h}
              </li>
            ))}
          </ul>

          <h3 className="text-[#111] text-[22px] font-light mt-10 mb-4">{t.gettingThereHeader}</h3>
          <ul className="space-y-2.5">
            {tour.whatToBring?.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
                <span className="inline-block w-1.5 h-1.5 bg-[#111] mt-2 flex-shrink-0" aria-hidden />
                {h}
              </li>
            ))}
            <li className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
              <span className="inline-block w-1.5 h-1.5 bg-[#111] mt-2 flex-shrink-0" aria-hidden />
              {t.uberNote}
            </li>
            <li className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
              <span className="inline-block w-1.5 h-1.5 bg-[#111] mt-2 flex-shrink-0" aria-hidden />
              {t.afterBooking}
            </li>
          </ul>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 pb-24 md:pb-32">
        <div id="book" className="max-w-md mx-auto">
          <div className="mb-4 p-5 bg-[#E6F3EE] border border-[#B8D9CF]">
            <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mb-2">{t.fullDayEyebrow}</p>
            <p className="text-[12.5px] font-light text-[#354040] leading-relaxed mb-3">
              {t.fullDayBody}
            </p>
            <Link href="/#booking" className="inline-block bg-[#248D6C] text-white text-[10px] font-semibold tracking-[0.14em] uppercase px-5 py-2.5 hover:bg-[#1C6E54] transition-colors">
              {t.planCavi}
            </Link>
          </div>

          <BookingSidebar tour={tour} />
        </div>
      </section>

      <section className="bg-[#f5f5f5] py-14">
        <div className="px-6 md:px-[52px] mb-8">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">{t.whatTravelersSay}</p>
          <h2 className="text-[#111] text-[28px] font-light tracking-tight">{t.reviewsHeader}</h2>
        </div>
        <ReviewsStrip reviews={reviews} />
      </section>

      <section className="bg-[#FAFAFA] border-t border-[#E5E5E5] px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24">
        <div className="flex justify-between items-end mb-7 flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">{t.otherEyebrow}</p>
            <h2 className="text-[#111] text-[28px] font-light tracking-tight">{t.otherHeading}</h2>
          </div>
          <Link href="/#tours" className="bg-[#248D6C] text-white text-[10px] font-semibold tracking-[0.16em] uppercase px-6 py-3 hover:bg-[#1C6E54] transition-colors">
            {t.viewAll}
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-[#E5E5E5]">
          {tours.filter(x => x.slug !== 'salsa').map(x => (
            <Link key={x.slug} href={`/tours/${x.slug}`} className="bg-white hover:bg-[#E6F3EE] transition-colors p-6 flex items-center gap-5">
              <div className="relative w-[120px] h-[90px] md:w-[140px] md:h-[105px] flex-shrink-0 overflow-hidden" style={{ background: x.thumbBg }}>
                <Image src={x.photos[0]} alt={x.name} fill sizes="140px" className="object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mb-1">{x.category}</p>
                <p className="text-[#111] text-[18px] font-light">{x.name}</p>
                <p className="text-[#1C6E54] text-[12px] mt-1">{t.fromPrice.replace('{price}', String(x.price))}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      </main>
      <Footer />
      <StickyMobileCTA fromPrice={tour.price} href="#book" label={`${t.book} · $${tour.price}`} />
    </>
  )
}
