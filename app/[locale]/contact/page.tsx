import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import SchemaOrg from '@/components/SchemaOrg'
import Breadcrumb from '@/components/Breadcrumb'
import ContactForm from '@/components/ContactForm'
import { toursFor, siteConfigFor } from '@/lib/cms/client'
import { generalFaqs as generalFaqsEn } from '@/lib/cms/data/faqs.en'
import { generalFaqs as generalFaqsEs } from '@/lib/cms/data/faqs.es'
import type { Locale } from '@/i18n/routing'

type Props = { params: Promise<{ locale: Locale }> }

const FAQS_BY_LOCALE = {
  en: generalFaqsEn,
  es: generalFaqsEs,
  fr: generalFaqsEn,
} as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const siteConfig = siteConfigFor(locale)
  const t = await getTranslations({ locale, namespace: 'ContactPage' })
  const title = `${t('eyebrow')} · Casa Venturas`
  const description = `${t('eyebrow')} Casa Venturas. ${siteConfig.email} · ${siteConfig.phone}. ${siteConfig.location}. ${siteConfig.hours}.`
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/contact` },
    openGraph: {
      title,
      description: t('intro'),
      url: `${siteConfig.url}/contact`,
      type: 'website',
      images: [
        {
          url: '/images/og/og-1200.jpg',
          width: 1200,
          height: 1600,
          alt: 'Casa Venturas, Puerto Rico experiences',
        },
      ],
    },
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const tours = toursFor(locale)
  const siteConfig = siteConfigFor(locale)
  const t = await getTranslations({ locale, namespace: 'ContactPage' })
  const faqs = FAQS_BY_LOCALE[locale]

  const info = [
    { k: t('lbl_email'), v: <a href={`mailto:${siteConfig.email}`} className="text-[#248D6C] hover:underline">{siteConfig.email}</a> },
    { k: t('lbl_phone'), v: <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="text-[#248D6C] hover:underline">{siteConfig.phone}</a> },
    { k: t('lbl_location'), v: siteConfig.location },
    { k: t('lbl_hours'), v: siteConfig.hours },
    { k: t('lbl_salsa'), v: t('salsaAddress') },
    { k: t('lbl_catamaran'), v: t('catamaranAddress') },
  ]

  return (
    <>
      <SchemaOrg faqs={faqs} locale={locale} />
      <Breadcrumb items={[
        { name: 'Home', url: '/' },
        { name: t('eyebrow'), url: '/contact' },
      ]} />
      <Nav />

      <main>
        <section className="bg-white pt-[120px] pb-14 px-6 md:px-[52px] border-b border-[#E5E5E5]">
          <p className="text-[10px] font-medium tracking-[0.26em] uppercase text-[#248D6C] mb-4 flex items-center gap-3">
            <span className="inline-block w-7 h-px bg-[#248D6C]" />
            {t('eyebrow')}
          </p>
          <h1 className="text-[#111] font-light leading-none tracking-tight mb-5 whitespace-pre-line" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
            {`${t('h1Line1')}\n${t('h1Line2')}`}
          </h1>
          <p className="text-[#717170] text-[15px] font-light max-w-md leading-[1.75]">
            {t('intro')}
          </p>
        </section>

        <section className="px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24">
          <div className="grid gap-20 lg:grid-cols-2">
            <div>
              <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-2">{t('reachUsEyebrow')}</p>
              <h2 className="text-[#111] text-[32px] font-light tracking-tight mb-5">{t('reachUsHeadline')}</h2>
              <p className="text-[14px] font-light text-[#888] leading-[1.75] mb-7">{t('reachUsIntro')}</p>

              <dl className="border-t border-[#e8e8e8]">
                {info.map(({ k, v }) => (
                  <div key={k} className="flex items-start gap-5 py-4 border-b border-[#e8e8e8]">
                    <dt className="text-[9px] font-medium tracking-[0.18em] uppercase text-[#888] min-w-[110px] pt-0.5">{k}</dt>
                    <dd className="text-[14px] font-light text-[#111]">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-9 p-5 bg-[#E6F3EE] border border-[#B8D9CF] flex items-center gap-5">
                <div className="text-center min-w-[64px]">
                  <p className="text-[32px] font-light text-[#111] leading-none">{siteConfig.tripAdvisor.rating.toFixed(1)}</p>
                  <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#248D6C] mt-1">TripAdvisor</p>
                </div>
                <div>
                  <p className="text-[13px] text-[#111] font-medium mb-1">{siteConfig.tripAdvisor.ranking}</p>
                  <p className="text-[12px] font-light text-[#888]">
                    {t('reviewsSuffix', { count: siteConfig.tripAdvisor.reviews.toLocaleString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-PR' : 'fr-FR') })}{' '}
                    <a href={siteConfig.tripAdvisor.url} target="_blank" rel="noopener noreferrer" className="text-[#248D6C] hover:underline">
                      {t('seeAll')}
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-4 p-5 bg-[#FAFAFA] border border-[#E5E5E5] flex items-start gap-4">
                <span className="w-2 h-2 rounded-full bg-[#248D6C] mt-2 flex-shrink-0 animate-pulse" aria-hidden />
                <div>
                  <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-[#248D6C] mb-1.5">{t('caviLabel')}</p>
                  <p className="text-[13px] font-light text-[#717170] leading-relaxed mb-3">{t('caviIntro')}</p>
                  <Link href="/#booking" className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#248D6C] border-b border-[#248D6C]/40 pb-0.5 hover:border-[#248D6C]">
                    {t('caviCta')}
                  </Link>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </section>

        <section className="bg-[#FAFAFA] border-t border-[#E5E5E5] px-6 md:px-12 lg:px-16 xl:px-24 py-16 md:py-24">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#248D6C] mb-6">{t('readyToBook')}</p>
          <div className="grid md:grid-cols-3 gap-px bg-[#E5E5E5]">
            {tours.map(tour => (
              <Link
                key={tour.slug}
                href={`/tours/${tour.slug}`}
                className="bg-white hover:bg-[#E6F3EE] transition-colors p-6 block"
              >
                <p className="text-[9px] font-medium tracking-[0.16em] uppercase text-[#248D6C] mb-2">
                  {tour.category} · ${tour.price}
                </p>
                <p className="text-[#111] text-[20px] font-light mb-2.5">{tour.shortName}</p>
                <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-[#1C6E54]">
                  {t('bookNowShort')}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
