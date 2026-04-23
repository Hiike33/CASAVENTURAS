import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaOrg from '@/components/SchemaOrg'
import ArticleCard from '@/components/ArticleCard'
import { articlesFor, siteConfigFor } from '@/lib/cms/client'
import { localizedAlternates } from '@/lib/seo/alternates'
import type { Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Guides' })
  const siteConfig = siteConfigFor(locale)
  return {
    title: t('indexTitle'),
    description: t('indexDescription'),
    alternates: localizedAlternates('/guides', locale, siteConfig.url),
    robots: { index: true, follow: true },
    openGraph: {
      title: `${t('indexTitle')} · Casa Venturas`,
      description: t('indexDescription'),
      url: `${siteConfig.url}/guides`,
      type: 'website',
    },
  }
}

export default async function GuidesIndexPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const articles = articlesFor(locale)
  const t = await getTranslations({ locale, namespace: 'Guides' })

  return (
    <>
      <SchemaOrg webPage={{ path: '/guides', name: `${t('indexTitle')} · Casa Venturas` }} locale={locale} />
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: t('eyebrow'), url: '/guides' },
        ]}
      />
      <Nav />
      <main>
        <section className="bg-white pt-[120px] pb-14 px-6 md:px-[52px] border-b border-[#E5E5E5]">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#248D6C]" />
            {t('eyebrow')}
          </p>
          <h1
            className="text-[#111] font-light leading-none tracking-tight mb-5"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
          >
            {t('indexTitle')}
          </h1>
          <p className="text-[#717170] text-[14px] font-light max-w-xl leading-[1.75]">
            {t('indexIntro')}
          </p>
        </section>

        <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[1100px]">
            {articles.map(article => (
              <ArticleCard key={article.slug} article={article} readLabel={t('readLabel')} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
