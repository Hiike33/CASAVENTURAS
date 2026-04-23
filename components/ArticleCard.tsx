import { Link } from '@/i18n/navigation'
import type { Article } from '@/lib/types/cms'

export default function ArticleCard({ article, readLabel }: { article: Article; readLabel: string }) {
  return (
    <article className="border border-[#E5E5E5] hover:border-[#248D6C] transition-colors bg-white">
      <Link
        href={`/guides/${article.slug}`}
        className="block p-6 md:p-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#248D6C]"
      >
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-3">
          {article.lastUpdated}
        </p>
        <h3 className="text-[20px] md:text-[22px] font-light text-[#111] tracking-tight leading-[1.2] mb-3">
          {article.title}
        </h3>
        <p className="text-[13.5px] font-light text-[#717170] leading-[1.65] mb-5">
          {article.excerpt}
        </p>
        <span className="inline-flex text-[10px] font-semibold tracking-[0.22em] uppercase text-[#248D6C]">
          {readLabel} →
        </span>
      </Link>
    </article>
  )
}
