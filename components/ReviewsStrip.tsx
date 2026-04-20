'use client'
import { useRef, useState, useEffect } from 'react'
import type { Review } from '@/lib/tours'

type Props = {
  reviews: Review[]
  filterTour?: string
  className?: string
}

export default function ReviewsStrip({ reviews, filterTour, className = '' }: Props) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ startX: number; scrollLeft: number } | null>(null)

  const list = filterTour
    ? reviews.filter(r => r.tour.toLowerCase().includes(filterTour.toLowerCase()))
    : reviews

  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const onMouseLeave = () => setDrag(null)
    el.addEventListener('mouseleave', onMouseLeave)
    return () => el.removeEventListener('mouseleave', onMouseLeave)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    const el = stripRef.current
    if (!el) return
    setDrag({ startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft })
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag) return
    const el = stripRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    el.scrollLeft = drag.scrollLeft - (x - drag.startX) * 1.5
  }
  const onMouseUp = () => setDrag(null)

  return (
    <div
      ref={stripRef}
      className={`reviews-strip flex gap-px bg-[#e8e8e8] ${className}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      role="region"
      aria-label="Customer reviews"
    >
      {list.map((r, i) => (
        <article
          key={r.url + i}
          className="min-w-[280px] max-w-[340px] bg-white p-6 flex-shrink-0 flex flex-col"
        >
          <div className="text-[10px] text-[#F5A623] tracking-widest mb-3" aria-label={`${r.rating} out of 5 stars`}>
            ★★★★★
          </div>
          <p className="text-[16px] md:text-[17px] font-serif italic font-light text-[#2a2a2a] leading-relaxed mb-4 flex-1">
            &ldquo;{r.text}&rdquo;
          </p>
          <div className="text-[9px] font-normal tracking-[0.1em] uppercase text-[#bbb] mb-2">
            {r.author} · <span className="text-[#888]">{r.tour}</span>
            {r.guide && <span className="block mt-0.5 text-[#248D6C] normal-case tracking-normal not-italic">Guide: {r.guide}</span>}
          </div>
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] font-medium tracking-[0.12em] uppercase text-[#248D6C] border-b border-[#248D6C]/30 pb-0.5 self-start hover:border-[#248D6C] transition-colors"
          >
            Read on TripAdvisor →
          </a>
        </article>
      ))}
    </div>
  )
}
