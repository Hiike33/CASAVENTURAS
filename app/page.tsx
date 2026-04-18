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
import { tours, reviews, siteConfig } from '@/lib/tours'

export const metadata: Metadata = {
  alternates: { canonical: siteConfig.url },
}

export default function Home() {
  return (
    <>
      <SchemaOrg />
      <Nav />
      <Hero />

      {/* INTRO + STATS */}
      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-12 md:py-16 text-center border-b border-[#E5E5E5]">
        <p className="text-[9px] font-normal tracking-[0.22em] uppercase text-[#888] mb-2.5">Puerto Rico — Since 2018</p>
        <h2 className="text-[28px] font-light text-[#111] tracking-tight mb-3">The island, beyond the tourist trail</h2>
        <p className="text-[13px] font-light text-[#888] leading-relaxed max-w-xl mx-auto mb-6">
          Small-group adventures with guides who grew up here. Rainforest hikes, private sailing to Vieques, rooftop salsa at sunset — transport from your hotel, groups capped at 13.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[#e8e8e8] pt-6">
          {[
            { n: `${siteConfig.tripAdvisor.rating}★`, l: `${siteConfig.tripAdvisor.reviews.toLocaleString('en-US')} reviews` },
            { n: siteConfig.tripAdvisor.ranking.split(' ')[0], l: `of 152 in San Juan` },
            { n: '≤ 13', l: 'per group' },
            { n: '100%', l: 'hotel pickup' },
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
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-1.5">Our experiences</p>
            <h2 className="text-[28px] font-light text-[#111] tracking-tight">Choose your adventure</h2>
          </div>
          <a href="#booking" className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#248D6C] border-b border-[#248D6C]/40 pb-0.5 hover:border-[#248D6C] transition-colors">
            Reserve any tour ↓
          </a>
        </div>
        <div className="flex flex-col">
          {tours.map((tour, i) => (
            <div key={tour.slug}>
              <div className="border-t border-[#e5e5e5] px-6 md:px-12 lg:px-16 xl:px-24 py-5 md:py-6 flex items-baseline gap-5 md:gap-8">
                <span className="text-[11px] md:text-[12px] font-medium tracking-[0.28em] text-[#248D6C] tabular-nums">
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

      {/* STORY — A1 Aman-style quote moment + full-width video */}
      <section className="bg-[#f5f5f5] border-t border-[#E5E5E5]" id="story">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-20 md:py-28 text-center">
          <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-[#248D6C] mb-5">
            Behind the experience
          </p>
          <h2 className="text-[#111] font-light tracking-tight mb-6 leading-[1.15]" style={{ fontSize: 'clamp(32px, 3.6vw, 48px)' }}>
            Why we do what we do
          </h2>
          <p className="text-[16px] md:text-[17px] font-light text-[#354040] leading-[1.75] mb-8 italic">
            &ldquo;We grew up here. El Yunque is our backyard, San Juan is our city. Every tour is the version we&apos;d give to a friend visiting for the first time.&rdquo;
          </p>
          <a
            href="https://www.youtube.com/watch?v=_qz8fcMaor8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[10px] font-semibold tracking-[0.22em] uppercase text-[#248D6C] border-b border-[#248D6C]/40 pb-1 hover:border-[#248D6C] transition-colors"
          >
            Watch on YouTube →
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
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-1.5">What travelers say</p>
            <h2 className="text-[28px] font-light text-[#111] tracking-tight">
              {siteConfig.tripAdvisor.reviews.toLocaleString('en-US')} reviews · {siteConfig.tripAdvisor.rating.toFixed(1)}★
            </h2>
          </div>
          <a
            href={siteConfig.tripAdvisor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9.5px] font-medium tracking-[0.12em] uppercase text-[#248D6C] border-b border-[#248D6C]/40 pb-0.5 hover:border-[#248D6C] transition-colors"
          >
            All {siteConfig.tripAdvisor.reviews.toLocaleString('en-US')} reviews →
          </a>
        </div>
        <ReviewsStrip reviews={reviews} />
      </section>

      {/* BOOKING + AI */}
      <section className="bg-[#FAFAFA] border-t border-[#E5E5E5] px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24" id="booking">
        <div className="mb-9">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">Direct booking — no commission</p>
          <h2 className="text-[28px] font-light text-[#111] tracking-tight mb-2">Reserve your experience</h2>
          <p className="text-[13px] font-light text-[#717170]">Book direct · 24h free cancel · AI assistant 24/7</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <HomeBookingForm />
          <ChatWidget />
        </div>
      </section>

      <Footer />
    </>
  )
}
