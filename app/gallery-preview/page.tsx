import Image from 'next/image'
import Link from 'next/link'

// DEV-ONLY preview page — 4 candidate gallery patterns rendered with real
// Casa Venturas photos. NOT linked from the site nav. Remove once a pattern
// is chosen and ported into `components/TourGallery.tsx`.

const ELYUNQUE = [
  '/images/tours/el-yunque/dsc8314-hd.jpg',
  '/images/tours/el-yunque/dsc8278-hd.jpg',
  '/images/tours/el-yunque/dsc8267-hd.jpg',
  '/images/tours/el-yunque/dsc8332-hd.jpg',
  '/images/tours/el-yunque/dsc8354-hd.jpg',
  '/images/tours/el-yunque/dsc8453-hd.jpg',
  '/images/tours/el-yunque/dsc8463-hd.jpg',
]

const CATAMARAN = [
  '/images/tours/catamaran/bali2-hd.jpg',
  '/images/tours/catamaran/bali1-hd.jpg',
  '/images/tours/catamaran/bali3-hd.jpg',
  '/images/tours/catamaran/bali4-hd.jpg',
  '/images/tours/catamaran/bali5-hd.jpg',
  '/images/tours/catamaran/bathroom-hd.jpg',
  '/images/tours/catamaran/customer1-hd.jpg',
  '/images/tours/catamaran/customer2-hd.jpg',
]

const SALSA = [
  '/images/tours/salsa/salsapic3-hd.jpg',
  '/images/tours/salsa/salsapic5-hd.jpg',
  '/images/tours/salsa/salsapic6-hd.jpg',
  '/images/tours/salsa/salsapic7-hd.jpg',
  '/images/tours/salsa/salsapic8-hd.jpg',
  '/images/tours/salsa/salsasite1-hd.jpg',
]

export default function GalleryPreview() {
  return (
    <main className="bg-white">
      {/* TOC */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] px-6 py-4">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#248D6C] mr-3">Preview</span>
          {[
            { id: 'pattern-1', label: '1 · Editorial Cinema' },
            { id: 'pattern-2', label: '2 · Horizontal Scroll' },
            { id: 'pattern-3', label: '3 · Sticky + Scroll' },
            { id: 'pattern-4', label: '4 · Bento Asymmetric' },
            { id: 'pattern-5', label: '5 · Editorial Bento ★' },
          ].map(t => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#4F4F4E] hover:text-[#248D6C] border border-[#E5E5E5] hover:border-[#248D6C] px-3 py-1.5 transition-colors"
            >
              {t.label}
            </a>
          ))}
          <Link
            href="/tours/catamaran"
            className="ml-auto text-[10px] font-medium tracking-[0.14em] uppercase text-[#888] hover:text-[#248D6C] transition-colors"
          >
            ← Back to tours
          </Link>
        </div>
      </nav>

      {/* INTRO */}
      <section className="px-6 md:px-12 pt-16 pb-10 max-w-[900px]">
        <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4">Design exploration</p>
        <h1 className="text-[clamp(36px,5vw,56px)] font-light text-[#111] tracking-tight leading-[1.05] mb-6">
          4 gallery patterns<br/>for tour pages
        </h1>
        <p className="text-[15px] font-light text-[#4F4F4E] leading-[1.75] max-w-[620px]">
          Goal: make photos carry more weight on tour pages, shift the feel toward editorial / luxe
          adventure brands (Surf-Spirit, Aman, Airbnb Luxe, Canopy &amp; Stars). Each pattern below
          uses actual Casa Venturas photos so you can judge in context. Click a card in the top bar to
          jump between patterns.
        </p>
      </section>

      {/* ========== PATTERN 1 — EDITORIAL CINEMA ========== */}
      <PatternHeader
        id="pattern-1"
        num="01"
        title="Editorial Cinema"
        desc="Full-bleed photos alternating with narrative chapters. Each scroll reveals a beat of the story — like a magazine long-read. Best for storytelling-heavy tours (El Yunque)."
        refs={['Canopy & Stars', 'Pelagic', 'NYT "Snow Fall"']}
        tour="El Yunque"
      />
      <EditorialCinema photos={ELYUNQUE} />

      {/* ========== PATTERN 2 — HORIZONTAL SCROLL ========== */}
      <PatternHeader
        id="pattern-2"
        num="02"
        title="Horizontal Scroll Magazine"
        desc="Large photos in a single row that you drag / swipe through. Snap points center each image. Invites active exploration — mirrors the ReviewsStrip already on the site."
        refs={['surf-spirit.com', 'Rapha Stories', 'Carv']}
        tour="Salsa"
      />
      <HorizontalScroll photos={SALSA} />

      {/* ========== PATTERN 3 — STICKY TEXT + SCROLL ========== */}
      <PatternHeader
        id="pattern-3"
        num="03"
        title="Sticky Text + Scrolling Images"
        desc="Left column stays fixed with the tour story; right column scrolls through a vertical photo stack. Apple product-page energy. On mobile, falls back to a simple vertical carousel."
        refs={['apple.com/iphone', 'Airbnb Luxe', 'Rimowa']}
        tour="Catamaran"
      />
      <StickyScroll photos={CATAMARAN} />

      {/* ========== PATTERN 4 — BENTO ASYMMETRIC ========== */}
      <PatternHeader
        id="pattern-4"
        num="04"
        title="Bento Luxe Asymmetric"
        desc="Irregular grid with deliberate variations in photo size, portrait/landscape mix, and generous white-space. Magazine editorial feel. Works great when you have 6-8 varied photos."
        refs={['airbnb.com/luxe', 'aman.com', 'eleven.co']}
        tour="Catamaran"
      />
      <BentoAsymmetric photos={CATAMARAN} />

      {/* ========== PATTERN 5 — EDITORIAL BENTO HYBRID ========== */}
      <PatternHeader
        id="pattern-5"
        num="05"
        title="Editorial Bento Hybrid  ★"
        desc="Asymmetric photo clusters alternating with narrative chapter blocks. The cadence image-dense → breathing text → image-dense is the signature rhythm of high-end travel magazines (Condé Nast, Kinfolk, Monocle). Combines your two favourites: the luxe variety of Bento + the storytelling beats of Editorial Cinema, with generous white-space between clusters."
        refs={['Condé Nast Traveler', 'Kinfolk', 'Monocle', 'Eleven.co']}
        tour="El Yunque"
      />
      <EditorialBento photos={ELYUNQUE} />

      {/* FOOT */}
      <section className="px-6 md:px-12 py-16 max-w-[900px] border-t border-[#E5E5E5] mt-20">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-3">Next step</p>
        <h2 className="text-[28px] font-light text-[#111] tracking-tight mb-4">Pick one (or mix)</h2>
        <p className="text-[14px] font-light text-[#4F4F4E] leading-[1.75] max-w-[620px]">
          Tell me the pattern number (or a mix — e.g. &ldquo;1 for El Yunque, 4 for Catamaran, 2 for Salsa&rdquo;).
          I&apos;ll port it into <code className="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">components/TourGallery.tsx</code>
          and wire it up on the 3 tour pages. This preview page gets deleted once a choice is made.
        </p>
      </section>
    </main>
  )
}

// ─────────────────────────────────────────────────────────
// Pattern header — shared metadata block above each sample
// ─────────────────────────────────────────────────────────
function PatternHeader({
  id, num, title, desc, refs, tour,
}: { id: string; num: string; title: string; desc: string; refs: string[]; tour: string }) {
  return (
    <section id={id} className="px-6 md:px-12 pt-20 pb-8 max-w-[900px] scroll-mt-20">
      <div className="flex items-baseline gap-5 mb-4">
        <span className="text-[56px] font-light text-[#248D6C] leading-none">{num}</span>
        <div>
          <p className="text-[9px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-1">Tour used · {tour}</p>
          <h2 className="text-[32px] font-light text-[#111] tracking-tight leading-none">{title}</h2>
        </div>
      </div>
      <p className="text-[14px] font-light text-[#4F4F4E] leading-[1.75] mb-3 max-w-[620px]">{desc}</p>
      <p className="text-[10px] tracking-[0.16em] uppercase text-[#888]">
        Refs : {refs.join(' · ')}
      </p>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Pattern 1 — Editorial Cinema (full-bleed + narrative)
// ─────────────────────────────────────────────────────────
function EditorialCinema({ photos }: { photos: string[] }) {
  const chapters = [
    { title: 'Beyond the trail', body: 'Our guides — born and raised in Puerto Rico — take you past the tourist path. Natural waterslide, cliff jumps, rope swing.' },
    { title: 'Into the water', body: 'Crystal-clear river pools where you can swim, jump, and float. Every spot has an option for every confidence level.' },
    { title: 'The rainforest floor', body: 'Muddy jungle paths, 300-year-old trees, coquí frogs and Puerto Rican parrots overhead.' },
    { title: 'Back together', body: 'Transport from your hotel, photos shared at the end, no rush, no scripts.' },
  ]
  return (
    <div className="space-y-0">
      {chapters.map((ch, i) => (
        <div key={ch.title}>
          <div className="relative w-full h-[70vh] min-h-[480px]">
            <Image
              src={photos[i % photos.length]}
              alt={`${ch.title}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />
          </div>
          <div className="px-6 md:px-12 py-16 md:py-24 max-w-[720px] mx-auto text-center">
            <p className="text-[9.5px] font-medium tracking-[0.24em] uppercase text-[#248D6C] mb-3">
              Chapter {i + 1} of {chapters.length}
            </p>
            <h3 className="text-[clamp(28px,4vw,42px)] font-light text-[#111] tracking-tight leading-[1.1] mb-5">
              {ch.title}
            </h3>
            <p className="text-[15px] font-light text-[#4F4F4E] leading-[1.8]">{ch.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Pattern 2 — Horizontal Scroll Magazine (snap-x)
// ─────────────────────────────────────────────────────────
function HorizontalScroll({ photos }: { photos: string[] }) {
  return (
    <div className="pb-20">
      <div className="overflow-x-auto snap-x snap-mandatory scroll-px-6 md:scroll-px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-3 md:gap-4 px-6 md:px-12">
          {photos.map((src, i) => (
            <div
              key={src}
              className="relative flex-shrink-0 snap-center w-[85vw] md:w-[62vw] lg:w-[48vw] xl:w-[42vw] h-[68vh] md:h-[78vh] min-h-[500px] bg-[#111]"
            >
              <Image
                src={src}
                alt={`Salsa ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 85vw, (max-width: 1024px) 62vw, 48vw"
                priority={i === 0}
              />
              <div className="absolute bottom-5 left-5 text-white">
                <p className="text-[9px] font-medium tracking-[0.24em] uppercase opacity-80 mb-1">
                  {i + 1} / {photos.length}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] tracking-[0.16em] uppercase text-[#888] text-center mt-5">
        ← drag to explore →
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Pattern 3 — Sticky Text + Scrolling Images
// ─────────────────────────────────────────────────────────
function StickyScroll({ photos }: { photos: string[] }) {
  return (
    <section className="px-6 md:px-12 py-8">
      <div className="grid lg:grid-cols-[360px_1fr] gap-10 lg:gap-16">
        {/* Sticky left */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-3">Sailing · Luxury</p>
          <h3 className="text-[36px] font-light text-[#111] tracking-tight leading-[1.05] mb-5">
            A 40-ft Bali,<br/>yours for a day
          </h3>
          <p className="text-[14.5px] font-light text-[#4F4F4E] leading-[1.8] mb-6">
            Private charter sailing from Humacao to Punta Arena — one of the most secluded beaches of
            Vieques. Open bar, lunch on deck, swim and snorkel in translucent water, return under
            sunset.
          </p>
          <ul className="space-y-2 text-[13px] font-light text-[#354040]">
            {['Up to 12 guests', 'Full day', 'Captain + crew', 'All-inclusive'].map(l => (
              <li key={l} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[#248D6C] rounded-full" /> {l}
              </li>
            ))}
          </ul>
        </div>

        {/* Scrolling right */}
        <div className="space-y-4">
          {photos.slice(0, 6).map((src, i) => (
            <div key={src} className="relative w-full aspect-[4/3] bg-[#111]">
              <Image
                src={src}
                alt={`Catamaran ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Pattern 4 — Bento Luxe Asymmetric (irregular grid)
// ─────────────────────────────────────────────────────────
function BentoAsymmetric({ photos }: { photos: string[] }) {
  const p = photos
  return (
    <section className="px-6 md:px-12 py-8">
      <div className="grid grid-cols-12 auto-rows-[16vw] md:auto-rows-[9vw] gap-3 md:gap-4">
        {/* Row 1: large hero (8 cols × 2 rows) + portrait (4 cols × 2 rows) */}
        <Cell src={p[0]} alt="Hero" span="col-span-12 md:col-span-8 row-span-2" />
        <Cell src={p[1]} alt="Portrait" span="col-span-6 md:col-span-4 row-span-2" />

        {/* Row 2: two squares side by side (6+6 mobile, 4+4+4 desktop) */}
        <Cell src={p[2]} alt="Detail" span="col-span-6 md:col-span-4 row-span-1 md:row-span-2" />
        <Cell src={p[3]} alt="Detail" span="col-span-6 md:col-span-4 row-span-1 md:row-span-2" />
        <Cell src={p[4]} alt="Panoramic" span="col-span-12 md:col-span-4 row-span-1 md:row-span-2" />

        {/* Row 3: panoramic full-width + two squares */}
        <Cell src={p[5]} alt="Wide" span="col-span-12 md:col-span-8 row-span-1 md:row-span-2" />
        <Cell src={p[6]} alt="Close-up" span="col-span-6 md:col-span-4 row-span-1 md:row-span-2" />
        <Cell src={p[7] ?? p[0]} alt="Close-up" span="col-span-6 md:col-span-4 row-span-1 md:row-span-2" />
      </div>
    </section>
  )
}

function Cell({ src, alt, span }: { src: string; alt: string; span: string }) {
  return (
    <div className={`relative ${span} bg-[#111] overflow-hidden`}>
      <Image src={src} alt={alt} fill className="object-cover hover:scale-[1.02] transition-transform duration-500" sizes="(max-width: 768px) 50vw, 33vw" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Pattern 5 — Editorial Bento (surf-spirit pure)
// Just XXL photos stacked vertically, no side text column.
// Alternates single full-width heroes with 50/50 pairs for rhythm.
// Generous breathing between sections, closing full-bleed.
// ─────────────────────────────────────────────────────────
function EditorialBento({ photos }: { photos: string[] }) {
  // Option B-soft — cinematic flow with a 4px hair-line between photos
  // (gap-1 and space-y-1) to mark separation without "tile mosaic" merge.
  // Heights unchanged (88 / 80 / 85 / 80 / 92 vh).
  return (
    <div className="space-y-1">
      {/* Hero single — 88vh */}
      <div className="relative w-full h-[88vh] min-h-[560px] bg-[#111]">
        <Image src={photos[0]} alt="" fill className="object-cover" sizes="100vw" priority />
      </div>

      {/* 50/50 pair — 80vh each, gap-0 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <div className="relative w-full aspect-[3/4] md:aspect-auto md:h-[80vh] md:min-h-[640px] bg-[#111]">
          <Image src={photos[1]} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="relative w-full aspect-[3/4] md:aspect-auto md:h-[80vh] md:min-h-[640px] bg-[#111]">
          <Image src={photos[2]} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      </div>

      {/* Hero single — 85vh */}
      <div className="relative w-full h-[85vh] min-h-[560px] bg-[#111]">
        <Image src={photos[3]} alt="" fill className="object-cover" sizes="100vw" />
      </div>

      {/* 50/50 pair — 80vh each, gap-0 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <div className="relative w-full aspect-[3/4] md:aspect-auto md:h-[80vh] md:min-h-[640px] bg-[#111]">
          <Image src={photos[4] ?? photos[0]} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="relative w-full aspect-[3/4] md:aspect-auto md:h-[80vh] md:min-h-[640px] bg-[#111]">
          <Image src={photos[5] ?? photos[1]} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      </div>

      {/* Closing full-bleed — 92vh */}
      <div className="relative w-full h-[92vh] min-h-[580px] bg-[#111]">
        <Image src={photos[6] ?? photos[0]} alt="" fill className="object-cover" sizes="100vw" />
      </div>
    </div>
  )
}
