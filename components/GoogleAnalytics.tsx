/**
 * Google Analytics 4 loader with Consent Mode v2.
 *
 * Mounted once in the root layout. Loads gtag.js with `consent default
 * analytics_storage = denied` so the script can send anonymized cookieless
 * pings BUT does NOT set any cookies until the user opts in via
 * CookieConsentBanner. This satisfies the EU ePrivacy Directive Article 5.3
 * + the explicit promise in lib/cms/data/legal.{en,es,fr}.ts that no
 * analytics cookies are set without consent.
 *
 * If NEXT_PUBLIC_GA_MEASUREMENT_ID is unset the component renders nothing
 * — local builds without GA env still work, and we never ship gtag without
 * an id.
 *
 * Pattern mirrors components/BokunScript.tsx (next/script + afterInteractive).
 */
import Script from 'next/script'

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        async
      />
      <Script id="gtag-consent-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          // Consent Mode v2 — denied by default until the user accepts via banner.
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted',
            wait_for_update: 500
          });
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
          // If a previous decision was persisted, replay it now so the
          // user does not see the banner re-prompt on every page load.
          try {
            var stored = window.localStorage.getItem('cv-analytics-consent');
            if (stored === 'granted') {
              gtag('consent', 'update', { analytics_storage: 'granted' });
            }
          } catch (e) { /* localStorage unavailable — keep default denied */ }
        `}
      </Script>
    </>
  )
}
