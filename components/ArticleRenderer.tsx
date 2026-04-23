import type { ArticleBlock } from '@/lib/types/cms'
import { renderInline } from '@/lib/html/inline'

// Renders the body of a TOFU article. Mirrors LegalPageLayout's block pattern
// (p/ul) and adds h2 + callout variants specific to editorial content.
// HTML inside blocks is parsed by `renderInline` (closed safelist: strong,
// em, code, a, br). No dangerouslySetInnerHTML path.
export default function ArticleRenderer({ body }: { body: ArticleBlock[] }) {
  return (
    <div className="space-y-6">
      {body.map((block, i) => {
        switch (block.kind) {
          case 'h2':
            return (
              <h2
                key={i}
                className="text-[22px] md:text-[26px] font-light text-[#111] tracking-tight mt-10 mb-2"
              >
                {block.text}
              </h2>
            )
          case 'p':
            return (
              <p
                key={i}
                className="text-[15px] md:text-[16px] font-light text-[#4F4F4E] leading-[1.75]"
              >
                {renderInline(block.html)}
              </p>
            )
          case 'ul':
            return (
              <ul key={i} className="space-y-2.5 pl-5">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-[14.5px] md:text-[15.5px] font-light text-[#4F4F4E] leading-[1.7] list-disc marker:text-[#248D6C]"
                  >
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            )
          case 'callout': {
            const bg =
              block.variant === 'warning'
                ? 'bg-[#FDF3E6] border-[#E8C89C]'
                : 'bg-[#E6F3EE] border-[#B8D9CF]'
            return (
              <aside
                key={i}
                className={`border-l-2 ${bg} px-5 py-4 text-[14.5px] font-light text-[#111] leading-[1.65]`}
              >
                {renderInline(block.html)}
              </aside>
            )
          }
        }
      })}
    </div>
  )
}
