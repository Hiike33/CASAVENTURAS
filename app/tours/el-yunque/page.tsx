import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
import { tours, reviews, siteConfig } from '@/lib/tours'
import { tourFaqs } from '@/lib/cms/data/faqs'
import { guides } from '@/lib/cms/data/guides'

const tour = tours.find(t => t.slug === 'el-yunque')!
const elYunqueFaqs = tourFaqs['el-yunque']
const elYunqueGuides = guides.filter(g => g.tours?.includes('el-yunque'))

export function generateMetadata(): Metadata {
  return {
    title: 'El Yunque Rainforest Tour San Juan | Casa Venturas',
    description: 'Small-group El Yunque rainforest tour from San Juan: natural waterslide, cliff jumps from 5–20ft, rope swing, guided hike. Transport incl. 5.0★ · 1,458 reviews.',
    keywords: 'El Yunque tour San Juan, natural waterslide Puerto Rico, cliff jumping El Yunque, small group rainforest tour, rope swing Puerto Rico',
    alternates: { canonical: `${siteConfig.url}/tours/el-yunque` },
    openGraph: {
      title: 'El Yunque Vivid Day Tour — Casa Venturas',
      description: 'Natural waterslide, cliff jumps, rope swing. The rainforest beyond the tourist trail.',
      url: `${siteConfig.url}/tours/el-yunque`,
      images: [{ url: tour.photos[0], width: 1200, height: 800 }],
      type: 'website',
    },
  }
}

export default function ElYunquePage() {
  return (
    <>
      <SchemaOrg tour={tour} faqs={elYunqueFaqs} guides={elYunqueGuides} />
      <Breadcrumb items={[
        { name: 'Home', url: '/' },
        { name: 'Experiences', url: '/#tours' },
        { name: tour.shortName, url: `/tours/${tour.slug}` },
      ]} />
      <Nav />

      <main>
      {/* HERO */}
      <section
        className="relative flex flex-col justify-end overflow-hidden pt-[120px] pb-12 px-6 md:pt-[140px] md:pb-[60px] md:px-[52px] min-h-[65vh]"
        style={{ background: '#111E14' }}
      >
        <HeroVideo
          src="/videos/hero-el-yunque.mp4"
          poster="/images/posters/hero-el-yunque.jpg"
          alt="El Yunque jungle waterslide and cliff jumps"
          opacity={0.75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0f]/95 via-[#0a1a0f]/40 to-transparent" />
        <div className="relative z-10">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#72D4A0] mb-5 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#72D4A0]" />
            {tour.heroTag}
          </p>
          <h1 className="text-white font-light leading-none tracking-tight mb-6 whitespace-pre-line"
              style={{ fontSize: 'clamp(40px, 7vw, 72px)' }}>
            {`El Yunque\nVivid Day Tour`}
          </h1>
          <p className="text-white/60 text-[15px] font-light max-w-lg leading-relaxed mb-10">
            The only tropical rainforest in the US National Forest system — and we take you to spots no bus tour ever reaches.
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

      {/* HIGHLIGHTS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e8e8e8]">
        {[
          { n: `$${tour.price}`, l: 'Per person' },
          { n: tour.duration, l: 'Duration' },
          { n: tour.groupSize, l: 'Group size' },
          { n: `${siteConfig.tripAdvisor.rating}★`, l: `${siteConfig.tripAdvisor.reviews.toLocaleString('en-US')} reviews` },
        ].map((s, i) => (
          <div key={i} className="bg-[#f5f5f5] text-center py-6 px-4">
            <p className="text-[22px] font-light text-[#111] tracking-tight leading-tight">{s.n}</p>
            <p className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mt-1">{s.l}</p>
          </div>
        ))}
      </div>

      {/* ABOUT */}
      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2.5">About this experience</p>
          <h2 className="text-[#111] text-[clamp(28px,3.2vw,40px)] font-light tracking-tight mb-6 leading-tight">
            The rainforest,<br/>beyond the tourist trail
          </h2>
          <div className="text-[15px] font-light text-[#354040] leading-[1.8] space-y-5 text-left md:text-center">
            <p>This is an adventure for travelers who want real nature, not a theme-park version of it. Our guides — born and raised in Puerto Rico — take you to the perfect spots: the natural waterslide, rope swing, and cliff jumps that no organized bus tour ever finds.</p>
            <p>Transport is included. We pick you up at your hotel in the San Juan area. Throughout the trip, your guide shares history and ecosystem facts — El Yunque is the only tropical national forest in the United States, and the only one with parrots, coquís, and 300-year-old trees.</p>
            <p>The trail involves a moderate hike through muddy, beautiful jungle paths to reach the river. Come prepared: water shoes, a change of clothes, sunscreen. The river has options for every confidence level — there&apos;s no pressure to jump from anywhere you&apos;re not comfortable.</p>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24" aria-label="Tour gallery">
        <TourGallery photos={tour.galleryPhotos ?? tour.photos} tourName={tour.name} priority />
      </section>

      {/* LISTES */}
      <section className="px-6 md:px-12 lg:px-16 xl:px-24 pb-16 md:pb-24">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-[#111] text-[22px] font-light mb-4">What you&apos;ll experience</h3>
          <ul className="space-y-2.5">
            {tour.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-[13.5px] font-light text-[#354040] leading-[1.65]">
                <span className="inline-block w-1.5 h-1.5 bg-[#248D6C] mt-2 flex-shrink-0" aria-hidden />
                {h}
              </li>
            ))}
          </ul>

          <h3 className="text-[#111] text-[22px] font-light mt-10 mb-4">What to bring</h3>
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

      {/* MAIN CONTENT GRID */}
      <section className="px-6 md:px-12 lg:px-16 xl:px-24 pb-24 md:pb-32">
        <div className="grid gap-14 lg:grid-cols-[1fr_380px] items-start">
          {/* Prose */}
          <article>
            {/* Video */}
            {tour.video && (
              <div>
                <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-3">Watch the tour</p>
                <YouTubeFacade videoId="_qz8fcMaor8" title="El Yunque Puerto Rico Jungle adventure tour with Casa Venturas" />
              </div>
            )}
          </article>

          {/* Booking sidebar */}
          <div id="book">
            <BookingSidebar tour={tour} />

            <div className="mt-4 p-5 bg-[#E6F3EE] border border-[#B8D9CF]">
              <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] mb-2">Questions? Ask Cavi</p>
              <p className="text-[12.5px] font-light text-[#354040] leading-relaxed mb-3">
                Our AI guide answers 24/7 — fitness level, what to bring, pickup location, family suitability.
              </p>
              <Link href="/#booking" className="inline-block bg-[#248D6C] text-white text-[10px] font-semibold tracking-[0.14em] uppercase px-5 py-2.5 hover:bg-[#1C6E54] transition-colors">
                Chat with Cavi →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-[#f5f5f5] py-14">
        <div className="px-6 md:px-[52px] mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">What travelers say</p>
            <h2 className="text-[#111] text-[28px] font-light tracking-tight">El Yunque reviews</h2>
          </div>
          <a
            href={siteConfig.tripAdvisor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] border-b border-[#248D6C]/30 pb-0.5 hover:border-[#248D6C] transition-colors"
          >
            {siteConfig.tripAdvisor.reviews.toLocaleString('en-US')} reviews on TripAdvisor →
          </a>
        </div>
        <ReviewsStrip reviews={reviews} filterTour="El Yunque" />
      </section>

      {/* OTHER EXPERIENCES */}
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
          {tours.filter(t => t.slug !== 'el-yunque').map(t => (
            <Link
              key={t.slug}
              href={`/tours/${t.slug}`}
              className="bg-white hover:bg-[#E6F3EE] transition-colors p-6 flex items-center gap-5"
            >
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

      </main>
      <Footer />
      <StickyMobileCTA fromPrice={tour.price} href="#book" label={`Book · $${tour.price}`} />
    </>
  )
}
