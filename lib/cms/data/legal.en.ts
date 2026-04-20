import type { LegalPage } from '@/lib/types/cms'

const email = 'micasaventuras@gmail.com'
const phone = '+1 929 372 4529'
const siteUrl = 'https://casaventuras.com'

export const privacy: LegalPage = {
  lastUpdated: '2026-04-18',
  metaDescription:
    'How Casa Venturas collects, uses, and protects your personal information. Compliant with Puerto Rico Act 39, Act 111-2005, CalOPPA, and GDPR.',
  introHtml: `Casa Venturas ("we", "us") operates ${siteUrl} and provides small-group tours in Puerto Rico. This policy explains what personal information we collect, why, how we protect it, and the rights you have. It is designed to comply with Puerto Rico Act 39 (Privacy Policy Notification) and Act 111-2005 (Citizen Information on Data Banks Security Act), the California Online Privacy Protection Act (CalOPPA), and the EU General Data Protection Regulation (GDPR) for visitors from the European Economic Area.`,
  sections: [
    {
      n: '1',
      title: 'Who we are',
      blocks: [
        { kind: 'p', html: `Casa Venturas, San Juan, Puerto Rico. ${email}, ${phone}. We are the data controller for information collected through this website.` },
      ],
    },
    {
      n: '2',
      title: 'Information we collect',
      blocks: [
        {
          kind: 'ul',
          items: [
            '<strong>Booking information</strong>: name, email, phone, tour date, number of guests. Submitted via our booking form and processed through Bókun (our booking engine).',
            '<strong>Contact form</strong>: name, email, message.',
            '<strong>Chat with Cavi (AI guide)</strong>: the content of your conversation, processed by Anthropic (Claude API) to generate responses. Transcripts are retained for up to 90 days for quality review, then deleted.',
            '<strong>Technical data</strong>: IP address, browser type, pages visited. Collected automatically by our hosting provider (Cloudflare) for security and performance.',
          ],
        },
        { kind: 'p', html: 'We do <strong>not</strong> sell your personal information. We do not use advertising cookies or cross-site trackers.' },
      ],
    },
    {
      n: '3',
      title: 'Why we collect it (legal basis)',
      blocks: [
        {
          kind: 'ul',
          items: [
            'To confirm and operate your tour (performance of contract, GDPR Art. 6(1)(b)).',
            'To answer questions sent via our contact form or chat (legitimate interest).',
            'To comply with Puerto Rico tax and tourism regulations (legal obligation).',
            'To protect the site against fraud and abuse (legitimate interest).',
          ],
        },
      ],
    },
    {
      n: '4',
      title: 'Who we share it with (processors)',
      blocks: [
        { kind: 'p', html: 'We rely on a small number of trusted service providers that process data strictly on our instructions:' },
        {
          kind: 'ul',
          items: [
            '<strong>Bókun</strong> (a TripAdvisor company), booking engine and payment processing (PCI-DSS compliant). Bókun acts as data processor under a signed Data Processing Agreement.',
            '<strong>Anthropic, PBC</strong>, Claude API powering our Cavi chat assistant. Anthropic does not train on customer data.',
            '<strong>Resend</strong>, transactional email delivery (booking confirmations, replies to contact messages).',
            '<strong>Cloudflare</strong>, website hosting, CDN, and DDoS protection.',
          ],
        },
        { kind: 'p', html: 'If you book one of our tours through a third-party platform such as Viator, TripAdvisor Experiences, GetYourGuide, or Airbnb Experiences, that platform is the data controller for your booking data. Their own privacy policies apply to those transactions, we only receive the information we need to operate the tour.' },
      ],
    },
    {
      n: '5',
      title: 'How long we keep it',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Booking records: 7 years (US tax retention requirement).',
            'Contact form messages: up to 2 years.',
            'Chat transcripts: up to 90 days.',
            'Server logs: up to 30 days.',
          ],
        },
      ],
    },
    {
      n: '6',
      title: 'Your rights',
      blocks: [
        { kind: 'p', html: 'You have the right to:' },
        {
          kind: 'ul',
          items: [
            'Access the personal information we hold about you.',
            'Ask us to correct or delete it.',
            'Opt out of any future marketing messages (we do not currently send any).',
            'Receive your data in a portable format (GDPR Art. 20).',
            'Lodge a complaint with a data protection authority (e.g. Puerto Rico DACO, or your local EU authority).',
          ],
        },
        { kind: 'p', html: `To exercise any of these rights, email <a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>. We respond within 30 days. California residents may request a "Do Not Sell or Share" opt-out; note that we do not sell or share personal information for advertising purposes.` },
        { kind: 'p', html: 'We honor "Do Not Track" browser signals: we do not use cross-site tracking cookies, so no additional action is taken beyond our baseline minimal collection.' },
      ],
    },
    {
      n: '7',
      title: 'Data security and breach notification',
      blocks: [
        { kind: 'p', html: 'All data is transmitted over HTTPS and stored in encrypted form by our processors. In the event of a security breach affecting personal information of Puerto Rico residents, we will notify affected individuals and the Puerto Rico Department of Consumer Affairs (DACO) within ten (10) days from the detection of the breach, as required by Act 111-2005. For EU residents, we will also notify the relevant supervisory authority within 72 hours as required by GDPR Art. 33.' },
      ],
    },
    {
      n: '8',
      title: 'International transfers',
      blocks: [
        { kind: 'p', html: 'Some of our processors (Bókun, Anthropic, Resend, Cloudflare) are based in the United States. If you are located in the European Economic Area, the United Kingdom, or Switzerland, your data may be transferred to and processed in the US under Standard Contractual Clauses (SCCs) approved by the European Commission.' },
      ],
    },
    {
      n: '9',
      title: 'Children',
      blocks: [
        { kind: 'p', html: 'Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13 (COPPA, 15 U.S.C. 6501-6506). Tours that welcome children (El Yunque, Catamaran) require a parent or legal guardian to book and accompany the minor.' },
      ],
    },
    {
      n: '10',
      title: 'Changes to this policy',
      blocks: [
        { kind: 'p', html: 'We may update this policy from time to time. The "Last updated" date at the top reflects the most recent revision. For material changes, we will post a notice on this page at least 30 days before the change takes effect.' },
      ],
    },
    {
      n: '11',
      title: 'Contact',
      blocks: [
        { kind: 'p', html: `Questions about this policy or your personal information:<br />Casa Venturas, San Juan, Puerto Rico<br /><a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}` },
      ],
    },
  ],
}

export const terms: LegalPage = {
  lastUpdated: '2026-04-18',
  metaDescription:
    'Terms and conditions for booking tours directly on casaventuras.com. Cancellation policy, liability, conduct, and governing law (Commonwealth of Puerto Rico).',
  introHtml: `These Terms of Service ("Terms") govern your use of ${siteUrl} and any tour you book directly through this website. By booking a tour or submitting a request through our site, you agree to be bound by these Terms. If you do not agree, please do not book.`,
  sections: [
    {
      n: '1',
      title: 'Scope and booking channels',
      blocks: [
        { kind: 'p', html: `These Terms apply exclusively to bookings made directly on ${siteUrl}. Bookings made through third-party platforms such as Viator, TripAdvisor Experiences, GetYourGuide, or Airbnb Experiences are governed by the terms and conditions of those respective platforms. However, the on-site rules covering safety, conduct, liability, and tour execution (sections 5, 7, and 8 below) apply to <strong>all guests</strong>, regardless of the booking channel.` },
      ],
    },
    {
      n: '2',
      title: 'The operator',
      blocks: [
        { kind: 'p', html: `The tours are operated by Casa Venturas, based in San Juan, Puerto Rico. Contact: <a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}.` },
      ],
    },
    {
      n: '3',
      title: 'Booking and payment',
      blocks: [
        { kind: 'p', html: 'Direct bookings on this site are processed through Bókun, our booking engine and PCI-DSS compliant payment processor (a TripAdvisor company). Payment is required to confirm a reservation. Prices are displayed in US dollars and include all taxes applicable under Puerto Rico law unless stated otherwise. Tour descriptions, photos, and highlights are illustrative; actual conditions (weather, water level, wildlife sightings) vary and do not constitute grounds for refund unless the tour itself is cancelled.' },
      ],
    },
    {
      n: '4',
      title: 'Cancellation and changes',
      blocks: [
        {
          kind: 'ul',
          items: [
            '<strong>Free cancellation</strong> up to 24 hours before the scheduled tour start time, full refund.',
            '<strong>Within 24 hours</strong> of start time: no refund, but rescheduling may be possible subject to availability.',
            '<strong>No-show</strong>: no refund.',
            '<strong>We cancel</strong>: if we cancel the tour (unsafe weather, sea conditions, or force majeure), you receive a full refund or a free reschedule at your option.',
          ],
        },
        { kind: 'p', html: 'Refunds are issued to the original payment method within 10 business days.' },
      ],
    },
    {
      n: '5',
      title: 'Assumption of risk and liability',
      blocks: [
        { kind: 'p', html: 'Our tours involve physical activity in natural outdoor environments and carry inherent risks, including but not limited to:' },
        {
          kind: 'ul',
          items: [
            '<strong>El Yunque</strong>: slippery trails, river currents, cliff jumps from 5 to 20 feet, wildlife encounters, variable weather.',
            '<strong>Catamaran to Vieques</strong>: open-water sailing, swimming, snorkeling, sun exposure, motion sickness.',
            '<strong>Salsa Rooftop</strong>: physical exertion, dance floor conditions.',
          ],
        },
        { kind: 'p', html: 'By participating, you acknowledge and voluntarily assume these risks. You confirm that you and every guest in your party are in adequate physical condition to participate. To the maximum extent permitted by the laws of the Commonwealth of Puerto Rico, Casa Venturas, its guides, contractors, and partners shall not be liable for any injury, illness, loss, or damage arising from participation, except in cases of gross negligence or willful misconduct on our part. Activity-specific waivers may be required to be signed on site before the tour begins.' },
      ],
    },
    {
      n: '6',
      title: 'Minors',
      blocks: [
        { kind: 'p', html: 'Guests under 18 must be accompanied by a parent or legal guardian, who is responsible for the minor throughout the tour. The El Yunque and Catamaran tours welcome children aged 5 and up; Salsa Rooftop is 18+ (alcohol is served). The booking guardian expressly consents on behalf of any minor in the party to these Terms, including the assumption of risk in section 5.' },
      ],
    },
    {
      n: '7',
      title: 'Weather and force majeure',
      blocks: [
        { kind: 'p', html: 'Tours run rain or shine. The captain (catamaran) or lead guide (El Yunque, Salsa) has sole discretion to cancel, shorten, or modify any tour for safety reasons, including but not limited to tropical storms, hurricanes, high swell, flash flooding, wildfire, pandemic restrictions, and acts of government. Such cases qualify under section 4 for a full refund or a reschedule.' },
      ],
    },
    {
      n: '8',
      title: 'Conduct',
      blocks: [
        { kind: 'p', html: 'We reserve the right to refuse service to, or remove from the tour without refund, any guest who:' },
        {
          kind: 'ul',
          items: [
            'Is visibly intoxicated or under the influence of drugs at the start of the tour.',
            'Behaves in a manner that endangers themselves, other guests, guides, or the environment.',
            'Harasses or threatens any guide, guest, or third party.',
            'Refuses to follow safety instructions from the guide or captain.',
          ],
        },
      ],
    },
    {
      n: '9',
      title: 'Photos and video',
      blocks: [
        { kind: 'p', html: 'Our guides may take photos and video during tours for marketing and social media use. If you prefer not to appear, tell your guide before the tour starts, we will accommodate your request. You retain all rights to photos and videos you take yourself; we ask that you tag <strong>@casaventuras</strong> if sharing publicly.' },
      ],
    },
    {
      n: '10',
      title: 'Insurance',
      blocks: [
        { kind: 'p', html: 'Travel insurance is strongly recommended. Casa Venturas maintains the liability coverage required under Puerto Rico law but is not liable for personal belongings lost or damaged during the tour, nor for medical expenses arising from participation.' },
      ],
    },
    {
      n: '11',
      title: 'Intellectual property',
      blocks: [
        { kind: 'p', html: `All content on ${siteUrl} (text, images, video, logo, tour descriptions) is the property of Casa Venturas or used with permission. You may not reproduce, republish, or use it commercially without our prior written consent.` },
      ],
    },
    {
      n: '12',
      title: 'Governing law and venue',
      blocks: [
        { kind: 'p', html: 'These Terms are governed by the laws of the Commonwealth of Puerto Rico, without regard to conflict of law principles. Any dispute arising from or relating to these Terms or a tour booking shall be brought exclusively before the courts of San Juan, Puerto Rico. For consumers residing in the European Union, this choice of venue does not deprive you of the protection of mandatory consumer law in your country of residence.' },
      ],
    },
    {
      n: '13',
      title: 'Changes to these Terms',
      blocks: [
        { kind: 'p', html: 'We may update these Terms from time to time. The "Last updated" date at the top reflects the most recent revision. Bookings are subject to the Terms in effect at the time of booking.' },
      ],
    },
    {
      n: '14',
      title: 'Contact',
      blocks: [
        { kind: 'p', html: `Questions about these Terms:<br />Casa Venturas, San Juan, Puerto Rico<br /><a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}` },
      ],
    },
  ],
}

export const cookies: LegalPage = {
  lastUpdated: '2026-04-20',
  metaDescription:
    'How Casa Venturas uses cookies and similar technologies. We do not use analytics or advertising trackers, only strictly necessary cookies and the Bókun booking widget.',
  introHtml: `This Cookie Policy explains how Casa Venturas and its third-party service providers use cookies and similar technologies when you visit ${siteUrl}. It complements our <a href="/privacy" class="text-[#248D6C] hover:underline">Privacy Policy</a>.`,
  sections: [
    {
      n: '1',
      title: 'What cookies are',
      blocks: [
        { kind: 'p', html: 'Cookies are small text files stored on your device by your browser when you visit a website. They let a site remember information across pages or sessions: a login token, a language choice, a booking step. Similar technologies include localStorage, sessionStorage, and pixels; we treat all of them the same way for the purposes of this policy.' },
      ],
    },
    {
      n: '2',
      title: 'Cookies we set directly',
      blocks: [
        { kind: 'p', html: '<strong>None for marketing or analytics.</strong> We do not run Google Analytics, Google Ads, Meta Pixel, or any cross-site tracking technology on this website. The only first-party storage we use is browser <em>localStorage</em> to remember your in-session chat with Cavi (our AI guide) so you don\'t lose context when you scroll, cleared automatically when you close the tab.' },
      ],
    },
    {
      n: '3',
      title: 'Strictly necessary cookies (set by our hosting provider)',
      blocks: [
        { kind: 'p', html: `Cloudflare, which hosts and protects ${siteUrl}, may set a small number of strictly necessary cookies such as <code class="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">__cf_bm</code> (bot mitigation) and <code class="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">cf_clearance</code> (anti-abuse). These exist purely for security and site integrity. They do not identify you personally, do not track you across other websites, and they cannot be disabled without breaking the site.` },
      ],
    },
    {
      n: '4',
      title: 'Third-party cookies (booking partner)',
      blocks: [
        { kind: 'p', html: 'When you interact with a booking widget, a checkout modal, or an availability calendar on our tour pages, the widget is served by Bókun (a TripAdvisor company) from <code class="bg-[#F5F5F5] px-1.5 py-0.5 text-[12px]">widgets.bokun.io</code>. Bókun may set cookies on its own domain to remember your selected date, guest count, and checkout session. These cookies are governed by Bókun\'s own privacy and cookie policies, not ours. We receive no persistent identifier from Bókun beyond the booking reference itself.' },
      ],
    },
    {
      n: '5',
      title: 'What we don\'t use',
      blocks: [
        {
          kind: 'ul',
          items: [
            'No Google Analytics, no Google Tag Manager, no Google Ads.',
            'No Meta Pixel, no Facebook tracking.',
            'No advertising networks, no retargeting cookies.',
            'No session recording (Hotjar, FullStory, etc.).',
            'No cross-site tracking of any kind.',
          ],
        },
      ],
    },
    {
      n: '6',
      title: 'Your choices',
      blocks: [
        {
          kind: 'ul',
          items: [
            '<strong>Browser settings</strong>: every modern browser lets you block or delete cookies per site. Because we don\'t rely on first-party cookies for core functionality, blocking them does not break the site.',
            '<strong>Do Not Track (DNT)</strong>: we honor the DNT signal. Since we already run no cross-site tracking, DNT is effectively always-on for our first-party data.',
            '<strong>Global Privacy Control (GPC)</strong>: we respect GPC signals and treat them as a valid opt-out for California residents under CCPA / CPRA.',
            '<strong>Third-party Bókun cookies</strong>: to block these, you can either avoid interacting with booking widgets, or configure your browser to block third-party cookies globally.',
          ],
        },
      ],
    },
    {
      n: '7',
      title: 'EU / EEA / UK residents',
      blocks: [
        { kind: 'p', html: 'For visitors from the European Economic Area, the United Kingdom, or Switzerland: only <em>strictly necessary</em> cookies (Cloudflare security) are set without consent. Third-party Bókun cookies are set only when you actively interact with a booking widget, treated as consent by action under the ePrivacy Directive. You may withdraw consent at any time via your browser settings.' },
      ],
    },
    {
      n: '8',
      title: 'Applicable law',
      blocks: [
        { kind: 'p', html: 'This policy is designed to comply with:' },
        {
          kind: 'ul',
          items: [
            'Puerto Rico Act 39 (Privacy Policy Notification) and Act 111-2005 (data security).',
            'California Online Privacy Protection Act (CalOPPA) and CCPA / CPRA.',
            'EU ePrivacy Directive (Article 5.3) and GDPR for EEA residents.',
            'UK Privacy and Electronic Communications Regulations (PECR).',
          ],
        },
      ],
    },
    {
      n: '9',
      title: 'Changes to this policy',
      blocks: [
        { kind: 'p', html: 'We may update this policy from time to time, typically when we add or remove a service that sets cookies. The "Last updated" date at the top reflects the most recent revision. For material changes that introduce new cookie categories (for example if we ever enable analytics), we will post a notice and, where required, ask for your consent before activation.' },
      ],
    },
    {
      n: '10',
      title: 'Contact',
      blocks: [
        { kind: 'p', html: `Questions about cookies or this policy:<br />Casa Venturas, San Juan, Puerto Rico<br /><a href="mailto:${email}" class="text-[#248D6C] hover:underline">${email}</a>, ${phone}` },
      ],
    },
  ],
}
