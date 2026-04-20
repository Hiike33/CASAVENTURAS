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
  const page = legalFor(locale, 'terms')
  const siteConfig = siteConfigFor(locale)
  const t = await getTranslations({ locale, namespace: 'Legal.terms' })
  return {
    title: t('title'),
    description: page.metaDescription,
    alternates: { canonical: `${siteConfig.url}/terms` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${t('title')} · Casa Venturas`,
      description: page.metaDescription,
      url: `${siteConfig.url}/terms`,
      type: 'website',
    },
  }
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const page = legalFor(locale, 'terms')
  const tLegal = await getTranslations({ locale, namespace: 'Legal' })
  const tTerms = await getTranslations({ locale, namespace: 'Legal.terms' })

  return (
    <>
      <SchemaOrg
        webPage={{ path: '/terms', name: `${tTerms('title')} · Casa Venturas`, dateModified: page.lastUpdated }}
        locale={locale}
      />
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: tTerms('title'), url: '/terms' },
        ]}
      />
      <Nav />
      <LegalPageLayout
        eyebrow={tLegal('eyebrow')}
        lastUpdatedLabel={tLegal('lastUpdatedLabel')}
        title={tTerms('title')}
        intro={tTerms('intro')}
        page={page}
        footerLinks={[
          { label: tTerms('relatedPrivacy'), href: '/privacy' },
          { label: tTerms('relatedContact'), href: '/contact' },
        ]}
      />
      <Footer />
    </>
  )
}
