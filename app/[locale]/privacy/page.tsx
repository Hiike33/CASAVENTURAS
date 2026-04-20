import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import SchemaOrg from '@/components/SchemaOrg'
import LegalPageLayout from '@/components/LegalPageLayout'
import { legalFor, siteConfigFor } from '@/lib/cms/client'
import { localizedAlternates } from '@/lib/seo/alternates'
import type { Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const page = legalFor(locale, 'privacy')
  const siteConfig = siteConfigFor(locale)
  const t = await getTranslations({ locale, namespace: 'Legal.privacy' })
  return {
    title: t('title'),
    description: page.metaDescription,
    alternates: localizedAlternates('/privacy', locale, siteConfig.url),
    robots: { index: true, follow: true },
    openGraph: {
      title: `${t('title')} · Casa Venturas`,
      description: page.metaDescription,
      url: `${siteConfig.url}/privacy`,
      type: 'website',
    },
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const page = legalFor(locale, 'privacy')
  const tLegal = await getTranslations({ locale, namespace: 'Legal' })
  const tPrivacy = await getTranslations({ locale, namespace: 'Legal.privacy' })

  return (
    <>
      <SchemaOrg
        webPage={{ path: '/privacy', name: `${tPrivacy('title')} · Casa Venturas`, dateModified: page.lastUpdated }}
        locale={locale}
      />
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: tPrivacy('title'), url: '/privacy' },
        ]}
      />
      <Nav />
      <LegalPageLayout
        eyebrow={tLegal('eyebrow')}
        lastUpdatedLabel={tLegal('lastUpdatedLabel')}
        title={tPrivacy('title')}
        intro={tPrivacy('intro')}
        page={page}
        footerLinks={[
          { label: tPrivacy('relatedTerms'), href: '/terms' },
          { label: tPrivacy('relatedContact'), href: '/contact' },
        ]}
      />
      <Footer />
    </>
  )
}
