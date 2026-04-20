import Image from 'next/image'

type Props = {
  photos: string[]
  tourName: string
  priority?: boolean
}

type Section =
  | { type: 'single' | 'closing'; photoIndex: number }
  | { type: 'pair'; photoIndex: number }

// Compose a cinematic layout from N photos:
//   opening single → pair → middle single → pair → ... → closing single?
// The opening & closing are full-width heroes. Pairs are asymmetric (7/5
// then 5/7 alternating) on desktop, stacked on mobile. The algorithm
// alternates pair/single in the middle and ends with a closing hero only
// when there's one photo left over.
function buildLayout(count: number): Section[] {
  if (count === 0) return []
  if (count === 1) return [{ type: 'single', photoIndex: 0 }]
  if (count === 2) return [
    { type: 'single', photoIndex: 0 },
    { type: 'closing', photoIndex: 1 },
  ]

  const sections: Section[] = [{ type: 'single', photoIndex: 0 }]
  let used = 1
  let wantPair = true

  while (count - used > 1) {
    if (wantPair && count - used >= 2) {
      sections.push({ type: 'pair', photoIndex: used })
      used += 2
    } else {
      sections.push({ type: 'single', photoIndex: used })
      used += 1
    }
    wantPair = !wantPair
  }

  if (used < count) {
    sections.push({ type: 'closing', photoIndex: used })
  }

  return sections
}

// Height per section type. Reduced from full-viewport cinematic to a more
// restrained magazine-editorial scale — photos still dominant, but leave
// breathing room above/below the fold. Closing is tallest so the scroll
// ends on a strong beat.
const HEIGHT = {
  openingSingle: 'h-[74vh] min-h-[520px]',
  middleSingle: 'h-[68vh] min-h-[480px]',
  pair: 'md:h-[62vh] md:min-h-[520px]',
  closing: 'h-[78vh] min-h-[540px]',
} as const

// Asymmetric proportions for pairs. Alternates 7/5 then 5/7 so successive
// pairs don't feel mirrored. grid-cols uses explicit fr tracks so the
// ratio is controllable per pair, unlike a plain 2-column grid.
const PAIR_PROPORTIONS = ['md:grid-cols-[7fr_5fr]', 'md:grid-cols-[5fr_7fr]'] as const

export default function TourGallery({ photos, tourName, priority = false }: Props) {
  if (photos.length === 0) return null

  const layout = buildLayout(photos.length)
  let pairIdx = 0 // tracks how many pairs we've rendered for the proportion cycle

  // Escape parent horizontal padding so the gallery goes true full-bleed
  // regardless of how the parent section is wrapped. Vertical rhythm is
  // owned by the parent (py-16 md:py-24 on tour pages).
  return (
    <div className="-mx-6 md:-mx-12 lg:-mx-16 xl:-mx-24 space-y-1">
      {layout.map((section, sectionIndex) => {
        const isFirstSection = sectionIndex === 0

        if (section.type === 'pair') {
          const proportion = PAIR_PROPORTIONS[pairIdx % PAIR_PROPORTIONS.length]
          pairIdx += 1
          const a = photos[section.photoIndex]
          const b = photos[section.photoIndex + 1]
          // When proportion is 7/5, the first image is the wider one (58%);
          // when 5/7, the second image is wider. Sizes hint reflects that.
          const isFirstWide = proportion.endsWith('[7fr_5fr]')
          return (
            <div
              key={`pair-${section.photoIndex}`}
              className={`grid grid-cols-1 ${proportion} gap-1`}
            >
              <div className={`relative w-full aspect-[3/4] md:aspect-auto ${HEIGHT.pair} bg-[#111]`}>
                <Image
                  src={a}
                  alt={`${tourName} — photo ${section.photoIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes={`(max-width: 768px) 100vw, ${isFirstWide ? '58vw' : '42vw'}`}
                />
              </div>
              <div className={`relative w-full aspect-[3/4] md:aspect-auto ${HEIGHT.pair} bg-[#111]`}>
                <Image
                  src={b}
                  alt={`${tourName} — photo ${section.photoIndex + 2}`}
                  fill
                  className="object-cover"
                  sizes={`(max-width: 768px) 100vw, ${isFirstWide ? '42vw' : '58vw'}`}
                />
              </div>
            </div>
          )
        }

        const heightClass =
          section.type === 'closing'
            ? HEIGHT.closing
            : isFirstSection
              ? HEIGHT.openingSingle
              : HEIGHT.middleSingle

        return (
          <div
            key={`single-${section.photoIndex}`}
            className={`relative w-full ${heightClass} bg-[#111]`}
          >
            <Image
              src={photos[section.photoIndex]}
              alt={`${tourName} — photo ${section.photoIndex + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={isFirstSection && priority}
            />
          </div>
        )
      })}
    </div>
  )
}
