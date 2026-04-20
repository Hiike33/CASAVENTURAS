import type { LegalPage, LegalBlock } from '@/lib/types/cms'
import { renderInline } from '@/lib/html/inline'

// Shared shell for /privacy, /terms, /cookies. Sections are numbered 1.,
// 2., 3. and rendered from the typed CMS content; inline markup (strong,
// em, a, code, br) is parsed by lib/html/inline.tsx into React elements.
// No raw HTML injection, no user input path into the DOM.
export type LegalPageLayoutProps = {
  eyebrow: string
  lastUpdatedLabel: string
  title: string
  intro: string
  page: LegalPage
  footerLinks: Array<{ label: string; href: string }>
}

export default function LegalPageLayout({
  eyebrow,
  lastUpdatedLabel,
  title,
  intro,
  page,
  footerLinks,
}: LegalPageLayoutProps) {
  return (
    <main>
      <section className="bg-white pt-[120px] pb-14 px-6 md:px-[52px] border-b border-[#E5E5E5]">
        <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4 flex items-center gap-3">
          <span className="inline-block w-7 h-px bg-[#248D6C]" />
          {eyebrow}
        </p>
        <h1
          className="text-[#111] font-light leading-none tracking-tight mb-5"
          style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
        >
          {title}
        </h1>
        <p className="text-[#717170] text-[14px] font-light max-w-md leading-[1.75]">
          {lastUpdatedLabel}: {page.lastUpdated}. {intro}
        </p>
      </section>

      <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24 max-w-[860px]">
        <p className="text-[14px] font-light text-[#4F4F4E] leading-[1.85] mb-10">
          {renderInline(page.introHtml)}
        </p>

        {page.sections.map(section => (
          <section key={section.n} className="mb-10">
            <h2 className="text-[#111] text-[22px] md:text-[26px] font-light tracking-tight mb-4">
              <span className="text-[#248D6C] font-medium mr-3">{section.n}.</span>
              {section.title}
            </h2>
            <div className="text-[14px] font-light text-[#4F4F4E] leading-[1.85] space-y-4">
              {section.blocks.map((block, i) => renderBlock(block, i))}
            </div>
          </section>
        ))}

        {footerLinks.length > 0 && (
          <div className="mt-14 pt-8 border-t border-[#E5E5E5] flex flex-wrap gap-6 text-[11px] font-medium tracking-[0.16em] uppercase">
            {footerLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#248D6C] hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function renderBlock(block: LegalBlock, key: number) {
  if (block.kind === 'p') {
    return <p key={key}>{renderInline(block.html)}</p>
  }
  return (
    <ul key={key} className="list-disc pl-5 space-y-2">
      {block.items.map((item, i) => (
        <li key={i}>{renderInline(item)}</li>
      ))}
    </ul>
  )
}
