import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import TourCard from '@/components/TourCard'
import ChatWidget from '@/components/ChatWidget'
import Footer from '@/components/Footer'
import ReviewsStrip from '@/components/ReviewsStrip'
import SchemaOrg from '@/components/SchemaOrg'
import YouTubeFacade from '@/components/YouTubeFacade'
import HomeBookingForm from '@/components/HomeBookingForm'
import { getCMS } from '@/lib/cms'
import { routing, type Locale } from '@/i18n/routing'
import { localizedAlternates } from '@/lib/seo/alternates'
import { setRequestLocale } from 'next-intl/server'

type Props = { params: Promise<{ locale: string }> }

// Copy dictionaries for section headers, intros, and static labels that
// aren't stored in the CMS. Keyed by locale. Next phase (2b) will migrate
// these to messages/*.json so translators have a single file to edit.
const COPY = {
  en: {
    eyebrow: 'Puerto Rico, since 2018',
    heading: 'The island, beyond the tourist trail',
    intro: "Small-group adventures with guides who grew up here. Rainforest hikes, private sailing to Vieques, rooftop salsa at sunset. Transport from your hotel, groups capped at 13.",
    statPerGroup: 'per group',
    statPickup: 'hotel pickup',
    reviewsLabel: 'reviews',
    statOf152: 'of 152 in San Juan',
    ourExperiences: 'Our experiences',
    chooseYourAdventure: 'Choose your adventure',
    reserveAnyTour: 'Reserve any tour ↓',
    behindTheExperience: 'Behind the experience',
    whyWeDoIt: 'Why we do what we do',
    storyQuote: '"We grew up here. El Yunque is our backyard, San Juan is our city. Every tour is the version we\u2019d give to a friend visiting for the first time."',
    watchYoutube: 'Watch on YouTube →',
    whatTravelersSay: 'What travelers say',
    allReviews: 'All {count} reviews →',
    directNoCommission: 'Direct booking, no commission',
    reserveYourExperience: 'Reserve your experience',
    reserveSub: 'Book direct · 24h free cancel · Cavi answers 24/7',
  },
  es: {
    eyebrow: 'Puerto Rico, desde 2018',
    heading: 'La isla, más allá del circuito turístico',
    intro: 'Aventuras en grupos pequeños con guías que crecieron aquí. Caminatas por la selva, navegación privada a Vieques y salsa en la azotea al atardecer. Transporte desde tu hotel, grupos de hasta 13 personas.',
    statPerGroup: 'por grupo',
    statPickup: 'recogida en hotel',
    reviewsLabel: 'reseñas',
    statOf152: 'de 152 en San Juan',
    ourExperiences: 'Nuestras experiencias',
    chooseYourAdventure: 'Elige tu aventura',
    reserveAnyTour: 'Reserva cualquier tour ↓',
    behindTheExperience: 'Detrás de la experiencia',
    whyWeDoIt: 'Por qué hacemos lo que hacemos',
    storyQuote: '"Crecimos aquí. El Yunque es nuestro patio, San Juan es nuestra ciudad. Cada tour es la versión que le daríamos a un amigo que viene por primera vez."',
    watchYoutube: 'Ver en YouTube →',
    whatTravelersSay: 'Lo que dicen los viajeros',
    allReviews: 'Ver las {count} reseñas →',
    directNoCommission: 'Reserva directa, sin comisión',
    reserveYourExperience: 'Reserva tu experiencia',
    reserveSub: 'Reserva directo · Cancelación gratis 24h · Cavi responde 24/7',
  },
  fr: {
    eyebrow: 'Porto Rico, depuis 2018',
    heading: "L'île, au-delà du sentier touristique",
    intro: "Des aventures en petits groupes avec des guides qui ont grandi ici. Randonnées dans la forêt, navigation privée vers Vieques, salsa sur le rooftop au coucher du soleil. Transport depuis ton hôtel, groupes de 13 personnes maximum.",
    statPerGroup: 'par groupe',
    statPickup: 'ramassage à l\u2019hôtel',
    reviewsLabel: 'avis',
    statOf152: 'sur 152 à San Juan',
    ourExperiences: 'Nos expériences',
    chooseYourAdventure: 'Choisis ton aventure',
    reserveAnyTour: 'Réserve un tour ↓',
    behindTheExperience: "Derrière l'expérience",
    whyWeDoIt: 'Pourquoi on le fait',
    storyQuote: "\u00ab On a grandi ici. El Yunque, c'est notre arrière-cour. San Juan, c'est notre ville. Chaque tour, c'est la version qu'on proposerait à un ami qui vient pour la première fois. \u00bb",
    watchYoutube: 'Regarder sur YouTube →',
    whatTravelersSay: 'Ce que disent les voyageurs',
    allReviews: 'Voir les {count} avis →',
    directNoCommission: 'Réservation directe, sans commission',
    reserveYourExperience: "Réserve ton expérience",
    reserveSub: 'Réserve direct · Annulation gratuite sous 24h · Cavi répond 24/7',
  },
} as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const cms = getCMS()
  const loc = (routing.locales as readonly string[]).includes(locale) ? (locale as Locale) : routing.defaultLocale
  const siteConfig = await cms.getSiteConfig(loc)
  return { alternates: localizedAlternates('/', loc, siteConfig.url) }
}

export default async function Home({ params }: Props) {
  const { locale: rawLocale } = await params
  const locale: Locale = (routing.locales as readonly string[]).includes(rawLocale) ? (rawLocale as Locale) : routing.defaultLocale
  setRequestLocale(locale)

  const cms = getCMS()
  const [tours, reviews, siteConfig, generalFaqs] = await Promise.all([
    cms.getTours(locale),
    cms.getReviews(undefined, locale),
    cms.getSiteConfig(locale),
    cms.getFaqs(undefined, locale),
  ])

  const t = COPY[locale]

  return (
    <>
      <SchemaOrg website faqs={generalFaqs} itemList={tours} locale={locale} />
      <Nav />
      <main>
      <Hero />

      {/* INTRO + STATS */}
      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-12 md:py-16 text-center border-b border-[#E5E5E5]">
        <p className="text-[9px] font-normal tracking-[0.22em] uppercase text-[#888] mb-2.5">{t.eyebrow}</p>
        <h2 className="text-[28px] font-light text-[#111] tracking-tight mb-3">{t.heading}</h2>
        <p className="text-[13px] font-light text-[#888] leading-relaxed max-w-xl mx-auto mb-6">
          {t.intro}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[#e8e8e8] pt-6">
          {[
            { n: `${siteConfig.tripAdvisor.rating}★`, l: `${siteConfig.tripAdvisor.reviews.toLocaleString(locale === 'en' ? 'en-US' : locale)} ${t.reviewsLabel}` },
            { n: siteConfig.tripAdvisor.rankings[0].split(' ')[0], l: t.statOf152 },
            { n: '≤ 13', l: t.statPerGroup },
            { n: '100%', l: t.statPickup },
          ].map((s, i) => (
            <div key={i} className="text-center px-4 py-3 md:py-0 md:border-r md:border-[#e8e8e8] md:last:border-r-0">
              <div className="text-[22px] font-light text-[#111] tracking-tight">{s.n}</div>
              <div className="text-[8.5px] font-medium tracking-[0.14em] uppercase text-[#888] mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOURS */}
      <section className="pt-16 md:pt-24 pb-0" id="tours">
        <div className="px-6 md:px-12 lg:px-16 xl:px-24 mb-12 md:mb-16 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-1.5">{t.ourExperiences}</p>
            <h2 className="text-[28px] font-light text-[#111] tracking-tight">{t.chooseYourAdventure}</h2>
          </div>
          <a href="#booking" className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] border-b border-[#248D6C]/40 pb-0.5 hover:border-[#248D6C] transition-colors">
            {t.reserveAnyTour}
          </a>
        </div>
        <div className="flex flex-col">
          {tours.map((tour, i) => (
            <div key={tour.slug}>
              <div className="border-t border-[#e5e5e5] px-6 md:px-12 lg:px-16 xl:px-24 py-5 md:py-7 flex items-baseline gap-6 md:gap-8">
                <span className="font-serif italic font-light text-[22px] md:text-[28px] text-[#248D6C] leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-[11px] font-medium tracking-[0.22em] uppercase text-[#888]">
                  {tour.category.split(' · ')[0]}
                </span>
              </div>
              <TourCard tour={tour} featured={i === 0} />
            </div>
          ))}
          <div className="border-t border-[#e5e5e5]" aria-hidden />
        </div>
      </section>

      {/* STORY */}
      <section className="bg-[#f5f5f5] border-t border-[#E5E5E5]" id="story">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-20 md:py-28 text-center">
          <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-[#248D6C] mb-5">
            {t.behindTheExperience}
          </p>
          <h2 className="text-[#111] font-light tracking-tight mb-6 leading-[1.15]" style={{ fontSize: 'clamp(32px, 3.6vw, 48px)' }}>
            {t.whyWeDoIt}
          </h2>
          <p className="text-[16px] md:text-[17px] font-light text-[#354040] leading-[1.75] mb-8 italic">
            {t.storyQuote}
          </p>
          <a
            href="https://www.youtube.com/watch?v=_qz8fcMaor8"
            target="_blank"
            rel="noopener noreferrer"
            className="link-sweep cta-breathe inline-block text-[10px] font-semibold tracking-[0.22em] uppercase text-[#248D6C] pb-1"
          >
            {t.watchYoutube}
          </a>
        </div>
        <div className="w-full aspect-video">
          <YouTubeFacade
            videoId="_qz8fcMaor8"
            title="El Yunque Puerto Rico Jungle adventure with Casa Venturas"
            className="h-full"
          />
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-16 md:py-24" id="reviews">
        <div className="flex justify-between items-end px-6 md:px-12 lg:px-16 xl:px-24 mb-8">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-1.5">{t.whatTravelersSay}</p>
            <h2 className="text-[28px] font-light text-[#111] tracking-tight">
              {siteConfig.tripAdvisor.reviews.toLocaleString(locale === 'en' ? 'en-US' : locale)} {t.reviewsLabel} · {siteConfig.tripAdvisor.rating.toFixed(1)}★
            </h2>
          </div>
          <a
            href={siteConfig.tripAdvisor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-sweep text-[9.5px] font-medium tracking-[0.12em] uppercase text-[#248D6C] pb-0.5"
          >
            {t.allReviews.replace('{count}', siteConfig.tripAdvisor.reviews.toLocaleString(locale === 'en' ? 'en-US' : locale))}
          </a>
        </div>
        <ReviewsStrip reviews={reviews} />
      </section>

      {/* BOOKING + AI */}
      <section className="bg-[#FAFAFA] border-t border-[#E5E5E5] px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24" id="booking">
        <div className="mb-9">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">{t.directNoCommission}</p>
          <h2 className="text-[28px] font-light text-[#111] tracking-tight mb-2">{t.reserveYourExperience}</h2>
          <p className="text-[13px] font-light text-[#717170]">{t.reserveSub}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <HomeBookingForm />
          <ChatWidget />
        </div>
      </section>

      </main>
      <Footer />
    </>
  )
}
