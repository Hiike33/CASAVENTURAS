import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaOrg from '@/components/SchemaOrg'
import LegalPageLayout from '@/components/LegalPageLayout'
import { legalFor, siteConfigFor } from '@/lib/cms/client'
import type { Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const page = legalFor(locale, 'cookies')
  const siteConfig = siteConfigFor(locale)
  const t = await getTranslations({ locale, namespace: 'Legal.cookies' })
  return {
    title: t('title'),
    description: page.metaDescription,
    alternates: { canonical: `${siteConfig.url}/cookies` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${t('title')} · Casa Venturas`,
      description: page.metaDescription,
      url: `${siteConfig.url}/cookies`,
      type: 'website',
    },
  }
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const page = legalFor(locale, 'cookies')
  const tLegal = await getTranslations({ locale, namespace: 'Legal' })
  const tCookies = await getTranslations({ locale, namespace: 'Legal.cookies' })

  return (
    <>
      <SchemaOrg
        webPage={{ path: '/cookies', name: `${tCookies('title')} · Casa Venturas`, dateModified: page.lastUpdated }}
        locale={locale}
      />
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: tCookies('title'), url: '/cookies' },
        ]}
      />
      <Nav />
      <LegalPageLayout
        eyebrow={tLegal('eyebrow')}
        lastUpdatedLabel={tLegal('lastUpdatedLabel')}
        title={tCookies('title')}
        intro={tCookies('intro')}
        page={page}
        footerLinks={[
          { label: tCookies('relatedPrivacy'), href: '/privacy' },
          { label: tCookies('relatedTerms'), href: '/terms' },
        ]}
      />
      <Footer />
    </>
  )
}
