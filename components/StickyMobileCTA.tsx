'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Props = {
  label?: string
  fromPrice: number
  href: string
}

export default function StickyMobileCTA({ label = 'Book now', fromPrice, href }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      aria-hidden={!visible}
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 bg-white border-t border-[#e8e8e8] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-transform duration-200 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium tracking-[0.16em] uppercase text-[#888]">From</p>
          <p className="text-[20px] font-light text-[#111] leading-none">${fromPrice}<span className="text-[11px] text-[#888] ml-1 font-light">/person</span></p>
        </div>
        <Link
          href={href}
          className="bg-[#248D6C] text-white text-[11px] font-semibold tracking-[0.14em] uppercase px-6 py-3 hover:bg-[#1C6E54] transition-colors"
        >
          {label}
        </Link>
      </div>
    </div>
  )
}
