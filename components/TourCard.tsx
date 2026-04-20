import Link from 'next/link'
import Image from 'next/image'
import type { Tour } from '@/lib/tours'

export default function TourCard({ tour, featured = false }: { tour: Tour; featured?: boolean }) {
  const metaParts = [
    tour.duration,
    tour.groupSize,
    tour.level ?? tour.includes,
  ].filter(Boolean) as string[]

  const titleLines =
    tour.shortName === 'Catamaran'
      ? ['Private Catamaran', 'to Vieques']
      : tour.name === 'El Yunque Vivid Day Tour'
      ? ['El Yunque', 'Vivid Day Tour']
      : tour.name === 'Sunset Salsa Rooftop'
      ? ['Sunset Salsa', 'Rooftop']
      : [tour.name]
  const hero = tour.photos[0]

  return (
    <Link
      href={`/tours/${tour.slug}`}
      data-test={`tour-card-${tour.slug}`}
      className="relative block w-full h-[88vh] min-h-[640px] lg:h-[100vh] overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#248D6C] focus-visible:ring-offset-0"
      style={{ background: tour.thumbBg }}
    >
      {hero && (
        <Image
          src={hero}
          alt={tour.name}
          fill
          priority={featured}
          sizes="100vw"
          className="object-cover group-hover:scale-[1.04] transition-transform duration-[900ms] ease-out"
        />
      )}

      {/* Top gradient — carries the "Most booked" badge */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" aria-hidden />
      {/* Bottom gradient — carries the full text block */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" aria-hidden />

      {featured && (
        <span className="absolute top-8 left-6 md:top-12 md:left-12 lg:top-14 lg:left-16 xl:left-24 bg-[#248D6C] text-white text-[9px] md:text-[10px] font-semibold tracking-[0.18em] uppercase px-3 py-1.5 z-20">
          Most booked
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 px-6 md:px-10 lg:px-14 xl:px-16 py-10 md:py-14 lg:py-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8 md:gap-12 z-10">
        <div className="max-w-4xl lg:max-w-5xl">
          <p
            className="text-[10px] md:text-[11px] font-medium tracking-[0.22em] uppercase mb-4"
            style={{ color: tour.tagColor }}
          >
            {tour.category}
          </p>
          <h3
            className="text-white font-light leading-[0.95] tracking-tight mb-6"
            style={{ fontSize: 'clamp(36px, 5.5vw, 72px)' }}
          >
            {titleLines.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h3>
          <p className="text-[9.5px] md:text-[10.5px] font-medium tracking-[0.22em] uppercase text-white/70 mb-4">
            {metaParts.join(' · ')}
          </p>
          <p className="text-[13px] md:text-[14px] font-light text-white/70 leading-relaxed max-w-xl">
            {tour.description.slice(0, 120)}…
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-end md:items-end gap-6 md:gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="text-[34px] md:text-[44px] font-light text-white leading-none tracking-tight">
              ${tour.price}
            </div>
            <div className="text-[9px] md:text-[10px] text-white/60 mt-2 font-light tracking-wide">
              {tour.priceNote}
            </div>
          </div>
          <span className="inline-flex items-center text-[10px] md:text-[11px] font-semibold tracking-[0.22em] uppercase text-white border-b border-white/60 pb-1.5 group-hover:border-white group-hover:text-white transition-colors">
            Explore&nbsp;→
          </span>
        </div>
      </div>
    </Link>
  )
}
