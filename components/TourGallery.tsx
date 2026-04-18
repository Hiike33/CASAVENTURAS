import Image from 'next/image'

type Props = {
  photos: string[]
  tourName: string
  priority?: boolean
}

export default function TourGallery({ photos, tourName, priority = false }: Props) {
  if (photos.length === 0) return null
  const [hero, ...rest] = photos
  const grid = rest.slice(0, 4)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-px bg-[#e8e8e8] md:h-[480px]">
      <div className="col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto">
        <Image
          src={hero}
          alt={`${tourName} — main photo`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
          className="object-cover"
        />
      </div>
      {grid.map((src, i) => (
        <div key={src} className="relative aspect-[4/3] md:aspect-auto">
          <Image
            src={src}
            alt={`${tourName} — photo ${i + 2}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
