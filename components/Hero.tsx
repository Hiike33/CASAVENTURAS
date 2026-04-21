'use client'
import Link from 'next/link'
import HeroVideo from '@/components/HeroVideo'
import { tours, siteConfig } from '@/lib/tours'

const icons: Record<string, React.ReactNode> = {
  'el-yunque': (
    <svg viewBox="0 0 32 32" fill="white" width="28" height="28" aria-hidden>
      <path d="M16 3C13 7 9 9 9 14C9 18 11 21 14 22.5L14 29L16 29L16 24L18 24L18 29L20 29L20 22.5C23 21 25 18 25 14C25 9 21 7 16 3Z"/>
    </svg>
  ),
  catamaran: (
    <svg viewBox="0 0 32 32" fill="white" width="28" height="28" aria-hidden>
      <path d="M4 21L16 5L28 21Z M2 25C2 23 6 21 16 21C26 21 30 23 30 25C30 27 26 29 16 29C6 29 2 27 2 25Z"/>
    </svg>
  ),
  salsa: (
    <svg viewBox="0 0 32 32" fill="white" width="28" height="28" aria-hidden>
      <circle cx="16" cy="7" r="4.5"/>
      <path d="M10 13L7 29L13 27L16 18L19 27L25 29L22 13C20 15.5 18 17 16 17C14 17 12 15.5 10 13Z"/>
    </svg>
  ),
}

export default function Hero() {
  return (
    <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden bg-[#111E14]">
      <HeroVideo
        src="/videos/hero-home.mp4?v=5"
        poster="/images/posters/hero-home.jpg?v=5"
        alt="El Yunque rainforest adventure — Casa Venturas"
        opacity={0.75}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/70" aria-hidden />

      <div className="relative z-10 text-center px-8">
        <p className="text-[10px] font-medium tracking-[0.28em] uppercase text-[#72D4A0] mb-5 flex items-center justify-center gap-3">
          <span className="inline-block w-7 h-px bg-[#72D4A0]" />
          {siteConfig.location} · Est. 2018
          <span className="inline-block w-7 h-px bg-[#72D4A0]" />
        </p>
        <h1 className="text-[clamp(48px,8vw,88px)] font-light text-white leading-[0.98] tracking-[-0.03em] mb-4">
          {siteConfig.name}
        </h1>
        <p className="text-[18px] md:text-[22px] font-light text-white tracking-[-0.01em] mb-3 max-w-xl mx-auto">
          Small-group Puerto Rico experiences — rainforest, sailing, salsa.
        </p>
        <p className="text-[13.5px] font-light text-white/70 tracking-[0.04em] mb-9 max-w-md mx-auto leading-relaxed">
          {siteConfig.tagline}
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <a
            href="#tours"
            className="inline-block text-[10.5px] font-semibold tracking-[0.16em] uppercase text-white bg-[#248D6C] px-8 py-3.5 hover:bg-[#1C6E54] transition-colors"
          >
            Find your experience
          </a>
          <a
            href="#reviews"
            className="text-[10.5px] font-medium tracking-[0.14em] uppercase text-white/80 border-b border-white/30 pb-1 hover:text-white hover:border-white/70 transition-colors"
          >
            {siteConfig.tripAdvisor.reviews.toLocaleString('en-US')} reviews · {siteConfig.tripAdvisor.rating}★ →
          </a>
        </div>
      </div>

      {/* Tour selector — surf-spirit style */}
      <div className="absolute bottom-0 left-0 right-0 flex border-t border-white/10 bg-black/20 backdrop-blur-sm">
        {tours.map(tour => (
          <Link
            key={tour.slug}
            href={`/tours/${tour.slug}`}
            className="flex-1 flex flex-col items-center gap-2 py-4 px-3 border-r border-white/10 last:border-r-0 hover:bg-white/10 transition-colors"
          >
            <span className="opacity-70">{icons[tour.slug]}</span>
            <span className="text-[8.5px] font-medium tracking-[0.14em] uppercase text-white/70 text-center leading-tight">
              {tour.shortName}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
