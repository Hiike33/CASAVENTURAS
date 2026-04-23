import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaOrg from '@/components/SchemaOrg'
import ArticleRenderer from '@/components/ArticleRenderer'
import { Link } from '@/i18n/navigation'
import { articleBySlug, articlesFor, siteConfigFor, toursFor } from '@/lib/cms/client'
import { localizedAlternates } from '@/lib/seo/alternates'
import { routing, type Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: Locale; slug: string }> }

export async function generateStaticParams() {
  // Slugs are identical across locales (see articles.*.ts), so one locale
  // is enough to enumerate all (slug, locale) pairs.
  const slugs = articlesFor(routing.defaultLocale).map(a => a.slug)
  return slugs.flatMap(slug =>
    routing.locales.map(locale => ({ locale, slug })),
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = articleBySlug(locale, slug)
  const siteConfig = siteConfigFor(locale)
  if (!article) return { title: 'Not found' }
  return {
    title: article.title,
    description: article.metaDescription,
    alternates: localizedAlternates(`/guides/${slug}`, locale, siteConfig.url),
    robots: { index: true, follow: true },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      url: `${siteConfig.url}/guides/${slug}`,
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const article = articleBySlug(locale, slug)
  if (!article) notFound()
  const t = await getTranslations({ locale, namespace: 'Guides' })
  const relatedTour = article.relatedTourSlug
    ? toursFor(locale).find(tour => tour.slug === article.relatedTourSlug)
    : undefined

  return (
    <>
      <SchemaOrg
        locale={locale}
        webPage={{ path: `/guides/${slug}`, name: article.title, dateModified: article.lastUpdated }}
        article={{ article, path: `/guides/${slug}` }}
      />
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: t('eyebrow'), url: '/guides' },
          { name: article.title, url: `/guides/${slug}` },
        ]}
      />
      <Nav />
      <main>
        <section className="bg-white pt-[120px] pb-10 px-6 md:px-[52px] border-b border-[#E5E5E5]">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#248D6C]" />
            {t('eyebrow')} · {article.lastUpdated}
          </p>
          <h1
            className="text-[#111] font-light leading-[1.05] tracking-tight mb-5 max-w-[920px]"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
          >
            {article.title}
          </h1>
          <p className="text-[#717170] text-[14.5px] font-light max-w-2xl leading-[1.75]">
            {article.excerpt}
          </p>
        </section>

        <article className="px-6 md:px-12 lg:px-16 xl:px-24 py-14 md:py-20 max-w-[780px]">
          <ArticleRenderer body={article.body} />

          {relatedTour && (
            <aside className="mt-16 border-t border-[#E5E5E5] pt-8">
              <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-3">
                {t('relatedTourEyebrow')}
              </p>
              <Link
                href={`/tours/${relatedTour.slug}`}
                className="inline-flex items-center justify-between gap-6 border border-[#E5E5E5] hover:border-[#248D6C] bg-white px-6 py-5 transition-colors group max-w-lg"
              >
                <div>
                  <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-1">
                    {relatedTour.category}
                  </p>
                  <p className="text-[17px] font-light text-[#111] tracking-tight">
                    {relatedTour.name}
                  </p>
                </div>
                <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#248D6C] group-hover:translate-x-0.5 transition-transform">
                  ${relatedTour.price} →
                </span>
              </Link>
            </aside>
          )}
        </article>
      </main>
      <Footer />
    </>
  )
}
