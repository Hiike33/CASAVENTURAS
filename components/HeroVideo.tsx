'use client'
import { useEffect, useRef } from 'react'

type Props = {
  src: string
  poster: string
  alt: string
  className?: string
  opacity?: number
}

export default function HeroVideo({ src, poster, alt, className = '', opacity = 0.75 }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Safari sometimes refuses autoplay until we call .play() explicitly,
    // even when muted+autoPlay attributes are set.
    ref.current?.play().catch(() => {})
  }, [])

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={alt}
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      style={{ opacity }}
    >
      {/* AV1 first — Chrome 70+ / Firefox 100+ / Safari 17+ pick this
          (-29% bandwidth vs H.264 on average). Older browsers skip the
          unknown codec string and fall through to the H.264 source. */}
      <source src={src.replace(/\.mp4(\?.*)?$/, '.av1.mp4$1')} type='video/mp4; codecs="av01.0.05M.08"' />
      <source src={src} type="video/mp4" />
    </video>
  )
}
