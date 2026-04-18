'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  src: string
  poster: string
  alt: string
  className?: string
  opacity?: number
}

export default function HeroVideo({ src, poster, alt, className = '', opacity = 0.75 }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // If already loaded (fast connection / cache), set state immediately
    if (el.readyState >= 2) setLoaded(true)
    const onLoaded = () => setLoaded(true)
    el.addEventListener('loadeddata', onLoaded)
    // Safari sometimes refuses autoplay until we call .play() explicitly
    el.play().catch(() => {})
    return () => el.removeEventListener('loadeddata', onLoaded)
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
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${className}`}
      style={{ opacity: loaded ? opacity : 0 }}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
