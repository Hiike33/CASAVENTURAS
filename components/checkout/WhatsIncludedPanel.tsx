'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { htmlToList } from '@/lib/html/to-list'
import { ChevronIcon } from './icons'

// ─── What's Included accordion ─────────────────────────────────────────
// Collapsible block surfacing Bokun-curated tour metadata (included,
// excluded, attention notes, requirements). Each section is rendered
// from raw HTML strings via htmlToList — defensive parser tolerates
// vendor formatting drift.
//
// Extracted from components/CheckoutPanel.tsx during the split phase 1
// (audit 2026-04-26). State is purely local (open/closed accordion);
// no data flows back to the parent.

type T = ReturnType<typeof useTranslations<'CheckoutPanel'>>

export type WhatsIncludedPanelProps = {
  included?: string
  excluded?: string
  attention?: string
  requirements?: string
  t: T
}

export default function WhatsIncludedPanel({
  included,
  excluded,
  attention,
  requirements,
  t,
}: WhatsIncludedPanelProps) {
  const [open, setOpen] = useState(false)
  const includedList = htmlToList(included)
  const excludedList = htmlToList(excluded)
  const attentionList = htmlToList(attention)
  const requirementsList = htmlToList(requirements)
  const hasAny =
    includedList.length || excludedList.length || attentionList.length || requirementsList.length
  if (!hasAny) return null
  return (
    <div className="border border-[#E5E5E5]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#FAFAFA] transition-colors"
      >
        <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#248D6C]">
          {t('included')}
        </span>
        <span
          className={`text-[#717170] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <ChevronIcon />
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4">
          {includedList.length > 0 && (
            <IncludeExcludeList title={t('includedTitle')} items={includedList} positive />
          )}
          {excludedList.length > 0 && (
            <IncludeExcludeList title={t('notIncluded')} items={excludedList} positive={false} />
          )}
          {attentionList.length > 0 && (
            <div>
              <p className="text-[9px] font-medium tracking-[0.14em] uppercase text-[#717170] mb-2">
                {t('pleaseNote')}
              </p>
              <ul className="space-y-1.5">
                {attentionList.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12px] font-light text-[#4F4F4E] leading-[1.5]"
                  >
                    <span className="inline-block w-1 h-1 bg-[#717170] mt-[7px] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {requirementsList.length > 0 && (
            <div>
              <p className="text-[9px] font-medium tracking-[0.14em] uppercase text-[#717170] mb-2">
                {t('requirements')}
              </p>
              <p className="text-[12px] font-light text-[#4F4F4E] leading-[1.6]">
                {requirementsList.join(' ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Private helper — only used inside the accordion above. Kept colocated
// rather than re-exported because the parent doesn't need it directly.
function IncludeExcludeList({
  title,
  items,
  positive,
}: {
  title: string
  items: string[]
  positive: boolean
}) {
  return (
    <div>
      <p className="text-[9px] font-medium tracking-[0.14em] uppercase text-[#717170] mb-2">
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[12px] font-light text-[#4F4F4E] leading-[1.5]"
          >
            {positive ? (
              <span className="text-[#248D6C] mt-[-1px] font-medium">✓</span>
            ) : (
              <span className="text-[#717170] mt-[-1px]">×</span>
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
