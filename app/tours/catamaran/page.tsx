import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ReviewsStrip from '@/components/ReviewsStrip'
import TourGallery from '@/components/TourGallery'
import BookingSidebar from '@/components/BookingSidebar'
import SchemaOrg from '@/components/SchemaOrg'
import Breadcrumb from '@/components/Breadcrumb'
import StickyMobileCTA from '@/components/StickyMobileCTA'
import HeroVideo from '@/components/HeroVideo'
import { tours, reviews, siteConfig } from '@/lib/tours'
import { tourFaqs } from '@/lib/cms/data/faqs'
import { guides } from '@/lib/cms/data/guides'

const tour = tours.find(t => t.slug === 'catamaran')!
const catamaranFaqs = tourFaqs['catamaran']
const catamaranGuides = guides.filter(g => g.tours?.includes('catamaran'))

export function generateMetadata(): Metadata {
  return {
    title: 'Private Catamaran to Vieques | Casa Venturas',
    description: '40-ft Bali catamaran private charter to Punta Arena, Vieques. Up to 12 guests, open bar, lunch, snorkeling, sunset return. Book direct from $249/person.',
    keywords: 'private catamaran Vieques, Bali catamaran Puerto Rico, Punta Arena Vieques, luxury sailing San Juan, private charter Caribbean',
    alternates: { canonical: `${siteConfig.url}/tours/catamaran` },
    openGraph: {
      title: 'Private Catamaran to Vieques — Casa Venturas',
      description: '40-ft Bali catamaran, your group only, all-inclusive.',
      url: `${siteConfig.url}/tours/catamaran`,
      images: [{ url: tour.photos[0], width: 1200, height: 800 }],
      type: 'website',
    },
  }
}

export default function CatamaranPage() {
  return (
    <>
      <SchemaOrg tour={tour} faqs={catamaranFaqs} guides={catamaranGuides} />
      <Breadcrumb items={[
        { name: 'Home', url: '/' },
        { name: 'Experiences', url: '/#tours' },
        { name: tour.shortName, url: `/tours/${tour.slug}` },
      ]} />
      <Nav />

      <section
        className="relative flex flex-col justify-end overflow-hidden pt-[120px] pb-12 px-6 md:pt-[140px] md:pb-[60px] md:px-[52px] min-h-[65vh]"
        style={{ background: '#0A141E' }}
      >
        <HeroVideo
          src="/videos/hero-catamaran.mp4"
          poster="/images/posters/hero-catamaran.jpg"
          alt="Private catamaran sailing aerial drone view"
          opacity={0.7}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050e18]/95 via-[#050e18]/40 to-transparent" />
        <div className="relative z-10">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#72C4D4] mb-5 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#72C4D4]" />
            {tour.heroTag}
          </p>
          <h1 className="text-white font-light leading-none tracking-tight mb-6 whitespace-pre-line" style={{ fontSize: 'clamp(40px, 7vw, 72px)' }}>
            {`Private Catamaran\nto Vieques`}
          </h1>
          <p className="text-white/60 text-[15px] font-light max-w-lg leading-relaxed mb-10">
            A 40-ft Bali catamaran, just your group, sailing to one of the Caribbean&apos;s most secluded beaches.
          </p>
          <div className="flex items-center gap-7 flex-wrap">
            <a href="#book" className="bg-white text-black text-[10.5px] font-semibold tracking-[0.15em] uppercase px-8 py-3.5 hover:bg-[#f0f0f0] transition-colors">
              Book this tour — ${tour.price}
            </a>
            <Link href="/#tours" className="text-white/70 text-[10.5px] font-medium tracking-[0.14em] uppercase border-b border-white/20 pb-1 hover:text-white hover:border-white/60 transition-colors">
              ← All experiences
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8e8e8]">
        {[
          { n: `$${tour.price}`, l: 'Per person' },
          { n: tour.duration, l: 'Duration' },
          { n: tour.groupSize, l: 'Guests max' },
          { n: 'Private', l: 'Just your group' },
        ].map((s, i) => (
          <div key={i} className="bg-[#f5f5f5] text-center py-6 px-4">
            <p className="text-[22px] font-light text-[#111] tracking-tight leading-tight">{s.n}</p>
            <p className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24" aria-label="Tour gallery">
        <TourGallery photos={tour.galleryPhotos ?? tour.photos} tourName={tour.name} priority />
      </section>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 pb-24 md:pb-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_380px] items-start">
          <article>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2.5">About this experience</p>
            <h2 className="text-[#111] text-[clamp(28px,3.2vw,40px)] font-light tracking-tight mb-6 leading-tight">
              The most exclusive<br/>day on the water
            </h2>

            <div className="text-[15px] font-light text-[#354040] leading-[1.8] space-y-5">
              <p>Step aboard a <strong className="font-medium text-[#111]">40-foot Bali catamaran</strong> and enjoy an unforgettable private sailing experience through the pristine waters of Vieques. Designed for comfort, space, and style — this exclusive charter accommodates <strong className="font-medium text-[#111]">groups of up to 12 guests</strong> seeking relaxation, adventure, and a truly elevated day at sea.</p>
              <p>Your experience begins as you set sail featuring panoramic ocean views, spacious decks, and shaded lounge areas ideal for socializing or simply unwinding. As you cruise toward <strong className="font-medium text-[#111]">Punta Arena</strong> — one of Vieques&apos; most stunning and secluded beaches — you&apos;ll be surrounded by crystal-clear turquoise waters and refreshing Caribbean breezes.</p>
              <p>Once anchored at Punta Arena, the fun truly begins. Guests can swim, float, paddle, and lounge in calm, shallow waters. As the day closes, you&apos;ll sail back under a breathtaking Caribbean sunset, watching the sky shift into vibrant gold, pink, and orange.</p>
            </div>

            <div className="mt-8 p-5 bg-[#f5f5f5] border-l-[3px] border-[#248D6C] text-[13.5px] font-light text-[#354040] leading-[1.7]">
              <strong className="font-medium text-[#111]">Marina:</strong> Plaza Mayor, Palmas del Mar, Humacao — 1h from San Juan. Private transport from San Juan available on request.
            </div>

            <h3 className="text-[#111] text-[22px] font-light mt-10 mb-4">What&apos;s included</h3>
            <ul className="space-y-2.5">
              {tour.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
                  <span className="inline-block w-1.5 h-1.5 bg-[#248D6C] mt-2 flex-shrink-0" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>

            <h3 className="text-[#111] text-[22px] font-light mt-10 mb-4">Good to know</h3>
            <ul className="space-y-2.5">
              {tour.whatToBring?.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
                  <span className="inline-block w-1.5 h-1.5 bg-[#111] mt-2 flex-shrink-0" aria-hidden />
                  {h}
                </li>
              ))}
              <li className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
                <span className="inline-block w-1.5 h-1.5 bg-[#111] mt-2 flex-shrink-0" aria-hidden />
                Tour runs regardless of weather unless sea conditions are unsafe.
              </li>
            </ul>
          </article>

          <div id="book">
            <BookingSidebar tour={tour} />

            <div className="mt-4 p-5 bg-[#E6F3EE] border border-[#B8D9CF]">
              <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mb-2">Need transport from San Juan?</p>
              <p className="text-[12.5px] font-light text-[#354040] leading-relaxed mb-3">
                Marina is in Humacao. We arrange private pickup from San Juan — ask Cavi or contact us directly.
              </p>
              <Link href="/contact" className="inline-block bg-[#248D6C] text-white text-[10px] font-semibold tracking-[0.14em] uppercase px-5 py-2.5 hover:bg-[#1C6E54] transition-colors">
                Contact us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f5] py-14">
        <div className="px-6 md:px-[52px] mb-8">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">What travelers say</p>
          <h2 className="text-[#111] text-[28px] font-light tracking-tight">Casa Venturas reviews</h2>
        </div>
        <ReviewsStrip reviews={reviews} />
      </section>

      <section className="bg-[#FAFAFA] border-t border-[#E5E5E5] px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24">
        <div className="flex justify-between items-end mb-7 flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">Other experiences</p>
            <h2 className="text-[#111] text-[28px] font-light tracking-tight">Explore more adventures</h2>
          </div>
          <Link href="/#tours" className="bg-[#248D6C] text-white text-[10px] font-semibold tracking-[0.16em] uppercase px-6 py-3 hover:bg-[#1C6E54] transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-[#E5E5E5]">
          {tours.filter(t => t.slug !== 'catamaran').map(t => (
            <Link key={t.slug} href={`/tours/${t.slug}`} className="bg-white hover:bg-[#E6F3EE] transition-colors p-6 flex items-center gap-5">
              <div
                className="relative w-[120px] h-[90px] md:w-[140px] md:h-[105px] flex-shrink-0 overflow-hidden"
                style={{ background: t.thumbBg }}
              >
                <Image
                  src={t.photos[0]}
                  alt={t.name}
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mb-1">{t.category}</p>
                <p className="text-[#111] text-[18px] font-light">{t.name}</p>
                <p className="text-[#1C6E54] text-[12px] mt-1">From ${t.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
      <StickyMobileCTA fromPrice={tour.price} href="#book" label={`Book · $${tour.price}`} />
    </>
  )
}
