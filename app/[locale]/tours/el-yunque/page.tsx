import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ReviewsStrip from '@/components/ReviewsStrip'
import TourGallery from '@/components/TourGallery'
import YouTubeFacade from '@/components/YouTubeFacade'
import BookingSidebar from '@/components/BookingSidebar'
import SchemaOrg from '@/components/SchemaOrg'
import Breadcrumb from '@/components/Breadcrumb'
import StickyMobileCTA from '@/components/StickyMobileCTA'
import HeroVideo from '@/components/HeroVideo'
import { getCMS } from '@/lib/cms'
import { localizedAlternates } from '@/lib/seo/alternates'
import { routing, type Locale } from '@/i18n/routing'

// ISR — see app/[locale]/page.tsx for rationale. Aligns with the 60 s
// TTL on getLiveStartingPrice so price displays stay fresh.
export const revalidate = 60

type Props = { params: Promise<{ locale: string }> }

// Tour-page copy that isn't already in the CMS (section headers, intro
// paragraphs). Keyed by locale. Will migrate to messages/*.json in a
// Phase 2b pass so translators edit one file only.
const COPY = {
  en: {
    heroIntro: 'The only tropical rainforest in the US National Forest system, and we take you to spots no bus tour ever reaches.',
    bookThis: 'Book this tour',
    allExperiences: '← All experiences',
    perPerson: 'Per person',
    durationLabel: 'Duration',
    groupLabel: 'Group size',
    reviewsLabel: 'reviews',
    aboutEyebrow: 'About this experience',
    aboutHeading: 'The rainforest,\nbeyond the tourist trail',
    aboutP1: 'This is an adventure for travelers who want real nature, not a theme-park version of it. Our guides, born and raised in Puerto Rico, take you to the perfect spots: the natural waterslide, rope swing, and cliff jumps that no organized bus tour ever finds.',
    aboutP2: 'Transport is included. We pick you up at your hotel in the San Juan area. Throughout the trip, your guide shares history and ecosystem facts. El Yunque is the only tropical national forest in the United States, and the only one with parrots, coquíes, and 300-year-old trees.',
    aboutP3: 'The trail involves a moderate hike through muddy, beautiful jungle paths to reach the river. Come prepared: water shoes, a change of clothes, sunscreen. The river has options for every confidence level, no pressure to jump from anywhere you are not comfortable.',
    experienceHeader: "What you will experience",
    whatToBringHeader: 'What to bring',
    watchTour: 'Watch the tour',
    askCaviEyebrow: 'Questions? Ask Cavi',
    askCaviBody: 'Our instant guide answers 24/7 about fitness level, what to bring, pickup, family fit.',
    chatCavi: 'Chat with Cavi →',
    reviewsHeader: 'El Yunque reviews',
    whatTravelersSay: 'What travelers say',
    reviewsOnTripadvisor: '{count} reviews on TripAdvisor →',
    otherEyebrow: 'Other experiences',
    otherHeading: 'Explore more adventures',
    viewAll: 'View all →',
    fromPrice: 'From ${price}',
  },
  es: {
    heroIntro: 'La única selva tropical del sistema de Bosques Nacionales de EE.UU., y te llevamos a rincones a los que ningún tour en autobús llega.',
    bookThis: 'Reserva este tour',
    allExperiences: '← Todas las experiencias',
    perPerson: 'Por persona',
    durationLabel: 'Duración',
    groupLabel: 'Tamaño del grupo',
    reviewsLabel: 'reseñas',
    aboutEyebrow: 'Sobre esta experiencia',
    aboutHeading: 'La selva,\nmás allá del circuito turístico',
    aboutP1: 'Una aventura para viajeros que quieren naturaleza real, no una versión tipo parque temático. Nuestros guías, nacidos y criados en Puerto Rico, te llevan a los mejores puntos: el tobogán natural, la liana sobre el río y los saltos de acantilado que ningún tour en autobús encuentra.',
    aboutP2: 'El transporte está incluido. Te recogemos en tu hotel del área de San Juan. Durante el viaje, tu guía comparte historia y datos del ecosistema. El Yunque es la única selva tropical del sistema de Bosques Nacionales de Estados Unidos, la única con loros, coquíes y árboles de 300 años.',
    aboutP3: 'La caminata es moderada por senderos embarrados y hermosos hasta llegar al río. Ven preparado: zapatos de agua, ropa de cambio, protector solar. El río tiene opciones para cada nivel de confianza, sin presión de saltar desde donde no te sientas cómodo.',
    experienceHeader: 'Qué vas a vivir',
    whatToBringHeader: 'Qué llevar',
    watchTour: 'Mira el tour',
    askCaviEyebrow: '¿Preguntas? Habla con Cavi',
    askCaviBody: 'Nuestra guía instantánea responde 24/7 sobre nivel físico, qué llevar, recogida y si el tour es apto para familias.',
    chatCavi: 'Habla con Cavi →',
    reviewsHeader: 'Reseñas de El Yunque',
    whatTravelersSay: 'Lo que dicen los viajeros',
    reviewsOnTripadvisor: '{count} reseñas en TripAdvisor →',
    otherEyebrow: 'Otras experiencias',
    otherHeading: 'Explora más aventuras',
    viewAll: 'Ver todas →',
    fromPrice: 'Desde ${price}',
  },
  fr: {
    heroIntro: "La seule forêt tropicale du système des Forêts Nationales américaines, et on t'emmène aux endroits qu'aucun tour en bus n'atteint.",
    bookThis: 'Réserver ce tour',
    allExperiences: '← Toutes les expériences',
    perPerson: 'Par personne',
    durationLabel: 'Durée',
    groupLabel: 'Taille du groupe',
    reviewsLabel: 'avis',
    aboutEyebrow: 'À propos de cette expérience',
    aboutHeading: 'La forêt,\nau-delà du sentier touristique',
    aboutP1: "C'est une aventure pour les voyageurs qui veulent de la vraie nature, pas une version parc à thème. Nos guides, nés et élevés à Porto Rico, t'emmènent aux meilleurs endroits: le toboggan naturel, la liane au-dessus de la rivière, et les sauts de falaise qu'aucun tour en bus ne trouve.",
    aboutP2: "Le transport est inclus. On passe te chercher à ton hôtel dans la région de San Juan. Pendant le trajet, ton guide partage l'histoire et des faits sur l'écosystème. El Yunque est la seule forêt tropicale nationale des États-Unis, la seule avec des perroquets, des coquíes et des arbres de 300 ans.",
    aboutP3: "La randonnée est modérée, par des sentiers boueux et magnifiques jusqu'à la rivière. Viens préparé: chaussures d'eau, change, crème solaire. La rivière a des options pour chaque niveau de confiance, zéro pression pour sauter d'où tu n'es pas à l'aise.",
    experienceHeader: 'Ce que tu vas vivre',
    whatToBringHeader: "Ce qu'il faut apporter",
    watchTour: 'Regarder le tour',
    askCaviEyebrow: 'Des questions ? Parle à Cavi',
    askCaviBody: "Notre guide instantané répond 24/7 sur le niveau physique, ce qu'il faut apporter, le ramassage et si le tour convient aux familles.",
    chatCavi: 'Parler à Cavi →',
    reviewsHeader: "Avis d'El Yunque",
    whatTravelersSay: 'Ce que disent les voyageurs',
    reviewsOnTripadvisor: '{count} avis sur TripAdvisor →',
    otherEyebrow: 'Autres expériences',
    otherHeading: "Explore d'autres aventures",
    viewAll: 'Voir toutes →',
    fromPrice: 'À partir de {price}$',
  },
} as const

function resolveLocale(raw: string): Locale {
  return (routing.locales as readonly string[]).includes(raw) ? (raw as Locale) : routing.defaultLocale
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params
  const locale = resolveLocale(raw)
  const cms = getCMS()
  const [tour, siteConfig] = await Promise.all([cms.getTour('el-yunque', locale), cms.getSiteConfig(locale)])
  if (!tour) return {}
  // Bare title — the layout template '%s · Casa Venturas' (set in
  // app/[locale]/layout.tsx) appends the brand suffix automatically.
  // Including it here would yield "X | Casa Venturas · Casa Venturas".
  const title = locale === 'es'
    ? 'Tour de El Yunque desde San Juan'
    : locale === 'fr'
      ? "Tour d'El Yunque depuis San Juan"
      : 'El Yunque Rainforest Tour San Juan'
  return {
    title,
    description: tour.description,
    alternates: localizedAlternates('/tours/el-yunque', locale as Locale, siteConfig.url),
    openGraph: {
      title: tour.name,
      description: tour.description,
      url: `${siteConfig.url}/tours/el-yunque`,
      images: [{ url: tour.photos[0], width: 1200, height: 800 }],
      type: 'website',
    },
  }
}

export default async function ElYunquePage({ params }: Props) {
  const { locale: raw } = await params
  const locale = resolveLocale(raw)
  setRequestLocale(locale)

  const cms = getCMS()
  const [tour, tours, reviews, siteConfig, faqs, guides] = await Promise.all([
    cms.getTour('el-yunque', locale),
    cms.getTours(locale),
    cms.getReviews('El Yunque', locale),
    cms.getSiteConfig(locale),
    cms.getFaqs('el-yunque', locale),
    cms.getGuides('el-yunque', locale),
  ])
  if (!tour) notFound()

  const t = COPY[locale]
  const fmtCount = (n: number) => n.toLocaleString(locale === 'en' ? 'en-US' : locale)

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
        style={{ background: '#111E14' }}
      >
        <HeroVideo
          src="/videos/hero-el-yunque.mp4"
          poster="/images/posters/hero-el-yunque.jpg"
          alt={tour.name}
          opacity={0.75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0f]/95 via-[#0a1a0f]/40 to-transparent" />
        <div className="relative z-10">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#72D4A0] mb-5 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#72D4A0]" />
            {tour.heroTag}
          </p>
          <h1 className="text-white font-light leading-[1.05] tracking-tight mb-6"
              style={{ fontSize: 'clamp(40px, 7vw, 72px)' }}>
            {tour.name}
          </h1>
          <p className="text-white/60 text-[15px] font-light max-w-lg leading-relaxed mb-10">
            {t.heroIntro}
          </p>
          <div className="flex items-center gap-7 flex-wrap">
            <a href="#book" className="cta-smoke cta-breathe text-white text-[10.5px] font-semibold tracking-[0.15em] uppercase px-8 py-3.5">
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
          { n: tour.groupSize, l: t.groupLabel },
          { n: `${siteConfig.tripAdvisor.rating}★`, l: `${fmtCount(siteConfig.tripAdvisor.reviews)} ${t.reviewsLabel}` },
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
          <h3 className="text-[#111] text-[22px] font-light mb-4">{t.experienceHeader}</h3>
          <ul className="space-y-2.5">
            {tour.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
                <span className="inline-block w-1.5 h-1.5 bg-[#248D6C] mt-2 flex-shrink-0" aria-hidden />
                {h}
              </li>
            ))}
          </ul>

          <h3 className="text-[#111] text-[22px] font-light mt-10 mb-4">{t.whatToBringHeader}</h3>
          <ul className="space-y-2.5">
            {tour.whatToBring?.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
                <span className="inline-block w-1.5 h-1.5 bg-[#111] mt-2 flex-shrink-0" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 pb-24 md:pb-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_380px] items-start">
          <article>
            {tour.video && (
              <div>
                <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-3">{t.watchTour}</p>
                <YouTubeFacade videoId="_qz8fcMaor8" title={tour.name} />
              </div>
            )}
          </article>

          <div id="book">
            <div className="mb-4 p-5 bg-[#E6F3EE] border border-[#B8D9CF]">
              <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mb-2">{t.askCaviEyebrow}</p>
              <p className="text-[12.5px] font-light text-[#354040] leading-relaxed mb-3">
                {t.askCaviBody}
              </p>
              <Link href="/#booking" className="cta-smoke cta-breathe inline-block text-white text-[10px] font-semibold tracking-[0.14em] uppercase px-5 py-2.5">
                {t.chatCavi}
              </Link>
            </div>

            <BookingSidebar tour={tour} />
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f5] py-14">
        <div className="px-6 md:px-[52px] mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">{t.whatTravelersSay}</p>
            <h2 className="text-[#111] text-[28px] font-light tracking-tight">{t.reviewsHeader}</h2>
          </div>
          <a
            href={siteConfig.tripAdvisor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] border-b border-[#248D6C]/30 pb-0.5 hover:border-[#248D6C] transition-colors"
          >
            {t.reviewsOnTripadvisor.replace('{count}', fmtCount(siteConfig.tripAdvisor.reviews))}
          </a>
        </div>
        <ReviewsStrip reviews={reviews} filterTour="El Yunque" />
      </section>

      <section className="bg-[#FAFAFA] border-t border-[#E5E5E5] px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24">
        <div className="flex justify-between items-end mb-7 flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">{t.otherEyebrow}</p>
            <h2 className="text-[#111] text-[28px] font-light tracking-tight">{t.otherHeading}</h2>
          </div>
          <Link href="/#tours" className="cta-smoke cta-breathe text-white text-[10px] font-semibold tracking-[0.16em] uppercase px-6 py-3">
            {t.viewAll}
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-[#E5E5E5]">
          {tours.filter(x => x.slug !== 'el-yunque').map(x => (
            <Link
              key={x.slug}
              href={`/tours/${x.slug}`}
              className="bg-white hover:bg-[#E6F3EE] transition-colors p-6 flex items-center gap-5"
            >
              <div
                className="relative w-[120px] h-[90px] md:w-[140px] md:h-[105px] flex-shrink-0 overflow-hidden"
                style={{ background: x.thumbBg }}
              >
                <Image
                  src={x.photos[0]}
                  alt={x.name}
                  fill
                  sizes="140px"
                  className="object-cover"
                />
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
      <StickyMobileCTA fromPrice={tour.price} href="#book" label={t.bookThis} />
    </>
  )
}
