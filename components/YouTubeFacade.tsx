'use client'
import { useState } from 'react'
import Image from 'next/image'

type Props = {
  videoId: string
  title: string
  className?: string
  aspectRatio?: 'video' | 'square'
}

export default function YouTubeFacade({ videoId, title, className = '', aspectRatio = 'video' }: Props) {
  const [loaded, setLoaded] = useState(false)
  const poster = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  const ratio = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video'

  return (
    <div className={`relative ${ratio} w-full overflow-hidden bg-[#1a1a1a] ${className}`}>
      {loaded ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full group"
          aria-label={`Play video: ${title}`}
        >
          <Image
            src={poster}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover opacity-70 group-hover:opacity-85 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-[#248D6C] flex items-center justify-center group-hover:bg-[#1C6E54] transition-colors">
              <svg width="22" height="24" viewBox="0 0 22 24" fill="white" aria-hidden="true">
                <path d="M2 2L20 12L2 22Z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-left">
            <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-white/60">
              Watch · YouTube
            </span>
            <p className="text-white text-sm font-light mt-1 line-clamp-2">{title}</p>
          </div>
        </button>
      )}
    </div>
  )
}
