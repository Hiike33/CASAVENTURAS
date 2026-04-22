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
    heroIntro: "A 40-ft Bali catamaran, just your group, sailing to one of the Caribbean's most secluded beaches.",
    bookThis: 'Book this tour',
    allExperiences: '← All experiences',
    perPerson: 'Per person',
    durationLabel: 'Duration',
    guestsMax: 'Guests max',
    private: 'Private',
    justYourGroup: 'Just your group',
    reviewsLabel: 'reviews',
    aboutEyebrow: 'About this experience',
    aboutHeading: 'The most exclusive\nday on the water',
    aboutP1: 'Step aboard a 40-foot Bali catamaran and enjoy an unforgettable private sailing experience through the pristine waters of Vieques. Designed for comfort, space, and style, this exclusive charter accommodates groups of up to 12 guests seeking relaxation, adventure, and a truly elevated day at sea.',
    aboutP2: "Your experience begins as you set sail featuring panoramic ocean views, spacious decks, and shaded lounge areas ideal for socializing or simply unwinding. As you cruise toward Punta Arena, one of Vieques' most stunning and secluded beaches, you'll be surrounded by crystal-clear turquoise waters and refreshing Caribbean breezes.",
    aboutP3: "Once anchored at Punta Arena, the fun truly begins. Guests can swim, float, paddle, and lounge in calm, shallow waters. As the day closes, you'll sail back under a breathtaking Caribbean sunset, watching the sky shift into vibrant gold, pink, and orange.",
    includedHeader: "What's included",
    goodToKnowHeader: 'Good to know',
    weatherNote: 'Tour runs regardless of weather unless sea conditions are unsafe.',
    marinaNote: 'Marina: Plaza Mayor, Palmas del Mar, Humacao, 1h from San Juan. Private transport from San Juan available on request.',
    transportEyebrow: 'Need transport from San Juan?',
    transportBody: 'The marina is in Humacao. We arrange private pickup from San Juan, ask Cavi or contact us directly.',
    contactUs: 'Contact us →',
    whatTravelersSay: 'What travelers say',
    reviewsHeader: 'Casa Venturas reviews',
    otherEyebrow: 'Other experiences',
    otherHeading: 'Explore more adventures',
    viewAll: 'View all →',
    fromPrice: 'From ${price}',
    book: 'Book',
  },
  es: {
    heroIntro: 'Un catamarán Bali de 40 pies, solo para tu grupo, navegando a una de las playas más escondidas del Caribe.',
    bookThis: 'Reserva este tour',
    allExperiences: '← Todas las experiencias',
    perPerson: 'Por persona',
    durationLabel: 'Duración',
    guestsMax: 'Máx. de personas',
    private: 'Privado',
    justYourGroup: 'Solo tu grupo',
    reviewsLabel: 'reseñas',
    aboutEyebrow: 'Sobre esta experiencia',
    aboutHeading: 'El día más exclusivo\nsobre el agua',
    aboutP1: 'Sube a bordo de un catamarán Bali de 40 pies y vive una experiencia privada inolvidable por las aguas cristalinas de Vieques. Diseñado para tu comodidad, amplitud y estilo, este chárter exclusivo acomoda grupos de hasta 12 personas que buscan relajarse, aventurarse y vivir un día diferente en el mar.',
    aboutP2: 'La experiencia empieza al zarpar, con vistas panorámicas del océano, cubiertas amplias y zonas de lounge con sombra, ideales para conversar o relajarte. Mientras navegas hacia Punta Arena, una de las playas más espectaculares y escondidas de Vieques, te rodean aguas turquesas y la brisa caribeña.',
    aboutP3: 'Ya anclado en Punta Arena, empieza la verdadera diversión. Puedes nadar, flotar, hacer paddle y descansar en aguas tranquilas y poco profundas. Al final del día, regresas bajo un atardecer caribeño espectacular, con el cielo tiñéndose de dorado, rosado y naranja.',
    includedHeader: 'Qué está incluido',
    goodToKnowHeader: 'Bueno saber',
    weatherNote: 'El tour sale salvo que las condiciones del mar sean inseguras.',
    marinaNote: 'Marina: Plaza Mayor, Palmas del Mar, Humacao, a 1h de San Juan. Transporte privado desde San Juan bajo petición.',
    transportEyebrow: '¿Necesitas transporte desde San Juan?',
    transportBody: 'La marina está en Humacao. Coordinamos recogida privada desde San Juan, pregúntale a Cavi o escríbenos directo.',
    contactUs: 'Contáctanos →',
    whatTravelersSay: 'Lo que dicen los viajeros',
    reviewsHeader: 'Reseñas de Casa Venturas',
    otherEyebrow: 'Otras experiencias',
    otherHeading: 'Explora más aventuras',
    viewAll: 'Ver todas →',
    fromPrice: 'Desde ${price}',
    book: 'Reserva',
  },
  fr: {
    heroIntro: "Un catamaran Bali de 40 pieds, juste pour ton groupe, voguant vers l'une des plages les plus isolées des Caraïbes.",
    bookThis: 'Réserver ce tour',
    allExperiences: '← Toutes les expériences',
    perPerson: 'Par personne',
    durationLabel: 'Durée',
    guestsMax: 'Invités max',
    private: 'Privé',
    justYourGroup: 'Ton groupe seul',
    reviewsLabel: 'avis',
    aboutEyebrow: 'À propos de cette expérience',
    aboutHeading: "La journée la plus exclusive\nsur l'eau",
    aboutP1: "Monte à bord d'un catamaran Bali de 40 pieds et vis une expérience privée inoubliable sur les eaux cristallines de Vieques. Conçu pour le confort, l'espace et le style, ce charter exclusif accueille des groupes de 12 personnes maximum qui cherchent à se détendre, à s'aventurer et à vivre une journée d'exception en mer.",
    aboutP2: "L'expérience commence dès le départ, avec des vues panoramiques sur l'océan, des ponts spacieux et des zones lounge à l'ombre, parfaites pour socialiser ou simplement te détendre. En cinglant vers Punta Arena, l'une des plages les plus belles et isolées de Vieques, tu es entouré d'eaux turquoise cristallines et de la brise caribéenne.",
    aboutP3: "Une fois ancré à Punta Arena, la vraie détente commence. Tu peux nager, flotter, pagayer et te reposer dans des eaux calmes et peu profondes. À la fin de la journée, tu rentres sous un coucher de soleil caribéen spectaculaire, avec le ciel qui vire au doré, au rose et à l'orange.",
    includedHeader: 'Ce qui est inclus',
    goodToKnowHeader: 'Bon à savoir',
    weatherNote: "Le tour part quelle que soit la météo, sauf si les conditions de mer sont dangereuses.",
    marinaNote: "Marina : Plaza Mayor, Palmas del Mar, Humacao, à 1h de San Juan. Transport privé depuis San Juan sur demande.",
    transportEyebrow: 'Besoin de transport depuis San Juan ?',
    transportBody: "La marina est à Humacao. On organise une prise en charge privée depuis San Juan, demande à Cavi ou écris-nous directement.",
    contactUs: 'Contacte-nous →',
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
  const [tour, siteConfig] = await Promise.all([cms.getTour('catamaran', locale), cms.getSiteConfig(locale)])
  if (!tour) return {}
  const title = locale === 'es'
    ? 'Catamarán privado a Vieques | Casa Venturas'
    : locale === 'fr'
      ? 'Catamaran privé pour Vieques | Casa Venturas'
      : 'Private Catamaran to Vieques | Casa Venturas'
  return {
    title,
    description: tour.description,
    alternates: localizedAlternates('/tours/catamaran', locale as Locale, siteConfig.url),
    openGraph: {
      title: tour.name,
      description: tour.description,
      url: `${siteConfig.url}/tours/catamaran`,
      images: [{ url: tour.photos[0], width: 1200, height: 800 }],
      type: 'website',
    },
  }
}

export default async function CatamaranPage({ params }: Props) {
  const { locale: raw } = await params
  const locale = resolveLocale(raw)
  setRequestLocale(locale)

  const cms = getCMS()
  const [tour, tours, reviews, siteConfig, faqs, guides] = await Promise.all([
    cms.getTour('catamaran', locale),
    cms.getTours(locale),
    cms.getReviews(undefined, locale),
    cms.getSiteConfig(locale),
    cms.getFaqs('catamaran', locale),
    cms.getGuides('catamaran', locale),
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
        style={{ background: '#0A141E' }}
      >
        <HeroVideo src="/videos/hero-catamaran.mp4" poster="/images/posters/hero-catamaran.jpg" alt={tour.name} opacity={0.7} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050e18]/95 via-[#050e18]/40 to-transparent" />
        <div className="relative z-10">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#72C4D4] mb-5 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#72C4D4]" />
            {tour.heroTag}
          </p>
          <h1 className="text-white font-light leading-[1.05] tracking-tight mb-6" style={{ fontSize: 'clamp(40px, 7vw, 72px)' }}>
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
          { n: tour.groupSize, l: t.guestsMax },
          { n: t.private, l: t.justYourGroup },
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

          <h3 className="text-[#111] text-[22px] font-light mt-10 mb-4">{t.goodToKnowHeader}</h3>
          <ul className="space-y-2.5">
            {tour.whatToBring?.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
                <span className="inline-block w-1.5 h-1.5 bg-[#111] mt-2 flex-shrink-0" aria-hidden />
                {h}
              </li>
            ))}
            <li className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
              <span className="inline-block w-1.5 h-1.5 bg-[#111] mt-2 flex-shrink-0" aria-hidden />
              {t.weatherNote}
            </li>
            <li className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
              <span className="inline-block w-1.5 h-1.5 bg-[#111] mt-2 flex-shrink-0" aria-hidden />
              {t.marinaNote}
            </li>
          </ul>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 pb-24 md:pb-32">
        <div id="book" className="max-w-md mx-auto">
          <div className="mb-4 p-5 bg-[#E6F3EE] border border-[#B8D9CF]">
            <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mb-2">{t.transportEyebrow}</p>
            <p className="text-[12.5px] font-light text-[#354040] leading-relaxed mb-3">
              {t.transportBody}
            </p>
            <Link href="/contact" className="cta-smoke cta-breathe inline-block text-white text-[10px] font-semibold tracking-[0.14em] uppercase px-5 py-2.5">
              {t.contactUs}
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
          <Link href="/#tours" className="cta-smoke cta-breathe text-white text-[10px] font-semibold tracking-[0.16em] uppercase px-6 py-3">
            {t.viewAll}
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-[#E5E5E5]">
          {tours.filter(x => x.slug !== 'catamaran').map(x => (
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
