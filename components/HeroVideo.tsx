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
      <source src={src} type="video/mp4" />
    </video>
  )
}
