# Casa Venturas — Claude Code Instructions

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Cloudflare Pages (deployment)
- Google Fonts: Figtree (300/400/500/600)

## Design System

### Palette — SOURCE: live site micasaventuras.com main_style.css
Audit d-profondeur a démontré que le live site Casa Venturas est un **LIGHT-FIRST** design avec un accent ORANGE (et non pas vert comme initialement supposé). Body class Weebly: `wsite-theme-light`. Aucune surface noire dominante.

```
Base LIGHT (dominant) :
--cv-white:    #FFFFFF   (fond principal — 10 occurrences CSS)
--cv-off:      #FAFAFA   (sections alt, form wrappers)
--cv-gray1:    #F5F5F5   (léger alt additionnel)
--cv-border:   #E5E5E5   (borders, grid gaps — 8 occ.)
--cv-border-d: #E6E6E6   (borders slightly darker)

Texte :
--cv-text:     #4F4F4E   (body primary — 47 occ. live)
--cv-muted:    #717170   (secondary — 14 occ.)
--cv-ink:      #111111   (headings uniquement)

Brand accent VERT (#248D6C — D-012, choix contraste + rainforest theme) :
--cv-accent:   #248D6C   (CTAs, links, icons, section eyebrows)
--cv-accent-h: #1C6E54   (hover)
--cv-accent-l: #E6F3EE   (tinted bg pour callouts légers)

Gold pour étoiles UNIQUEMENT (standard TripAdvisor — découplé brand) :
--cv-gold:     #F5A623   (★ ★ ★ ★ ★)

Tour thumb fallbacks (dark, masqués par les photos) :
--cv-thumb-j:  #111E14
--cv-thumb-o:  #0A141E
--cv-thumb-s:  #1E0E08
```

**Règles strictes :**
- Aucune section de contenu avec fond sombre (#111/#0d0d0d/#1a1a1a). Les seules apparitions de noir sont : bullets de liste 6×6px, traits burger icon, fallbacks de photos tours.
- L'accent orange #F5A623 n'est JAMAIS utilisé en text color sur fond blanc sauf en underline CTA. Sur bg blanc, le texte orange n'a que 2.59:1 (échec WCAG). Utiliser #DB8C0A ou #111 pour le texte.
- Sur #F5A623 background : texte TOUJOURS blanc (ratio 3.2:1 AA large text).
- NO serif fonts. Figtree 300/400/500/600 only.

### Typography
- Font: Figtree (Google Fonts)
- Display headings: font-weight 300, letter-spacing -0.02em
- Body: font-weight 300–400
- Labels/CTAs: font-weight 500–600, letter-spacing 0.12–0.22em, uppercase
- NO serif fonts anywhere

### Key Design Principles
- White background sections — photos carry the color
- Black nav (always dark, not transparent — simplicity)
- Tour selector icons at bottom of hero (like surf-spirit.com)
- All-caps labels with generous letter-spacing
- Thin borders: 1px solid #E8E8E8
- No rounded corners (border-radius: 0)
- No shadows (flat design)

## Page Structure

```
/ (home)           → Hero video + tour selector + intro + tours grid + video story + reviews + booking+AI
/tours/el-yunque   → Tour detail + sidebar booking
/tours/catamaran   → Tour detail + sidebar booking
/tours/salsa       → Tour detail + sidebar booking
/contact           → Contact form + info
```

## Real Client Data (DO NOT CHANGE)

### Contact
- Email: micasaventuras@gmail.com
- Phone: +1 929 372 4529
- Location: San Juan, Puerto Rico

### Tours
El Yunque:
- Price: $89/person
- Duration: 6–7h
- Group: ≤13
- Level: Moderate
- Highlights: natural waterslide, cliff jumps 5/10/15/20ft, rope swing
- Transport: included from San Juan hotel

Catamaran Vieques:
- Price: $249/person
- Boat: 40-ft Bali catamaran
- Capacity: up to 12 guests
- Destination: Punta Arena, Vieques
- Marina: Plaza Mayor, Palmas del Mar, Humacao
- Includes: open bar, lunch, snorkeling equipment, sunset return

Salsa Rooftop:
- Price: $65/person
- Instructor: Zoe
- Location: 1050 Calle Marianna, 00907 San Juan — Casa Santurce Rooftop
- Time: 6PM daily
- Includes: Free Piña Colada
- Level: absolute beginners welcome

### Social Proof (verified 2026-04-17 via web search)
- TripAdvisor rating: 5.0/5 (bubble display — average likely 4.9)
- Reviews: 1,458 (updated from 1,433)
- Ranking: #10 of 152 tours in San Juan
- Status: "Likely to sell out" (Viator)
- Featured: KAYAK Travel Guides
- TripAdvisor URL: https://www.tripadvisor.com/Attraction_Review-g147320-d21156167-Reviews-Casa_Venturas-San_Juan_Puerto_Rico.html
- YouTube demo: https://www.youtube.com/watch?v=_qz8fcMaor8

### Guides referenced in real reviews
Eliu, Juelz, Paul, Catherine "La Taína", Justice, Rodriguez, Kendra.
These names MUST appear in reviews only if sourced. Do not invent guides.

## Components to Build

| Component | File | Status |
|-----------|------|--------|
| Nav | components/Nav.tsx | scaffold |
| Hero (video) | components/Hero.tsx | scaffold |
| TourSelector | components/TourSelector.tsx | scaffold |
| TourCard | components/TourCard.tsx | scaffold |
| ReviewsStrip | components/ReviewsStrip.tsx | scaffold |
| BookingForm | components/BookingForm.tsx | scaffold |
| ChatWidget (Cavi) | components/ChatWidget.tsx | TODO: wire Claude API |
| AutomationFlow | components/AutomationFlow.tsx | scaffold |
| VideoSection | components/VideoSection.tsx | scaffold |
| Footer | components/Footer.tsx | scaffold |

## Placeholders (client must provide)
- `/public/videos/hero.mp4` — main hero video (drone, El Yunque or Vieques)
- `/public/videos/story.mp4` — brand story video (30–60s)
- `/public/images/tours/el-yunque-1.jpg` — tour photos
- `/public/images/tours/catamaran-1.jpg`
- `/public/images/tours/salsa-1.jpg`

## TODO (wire later)
1. **Cavi chatbot** → `app/api/chat/route.ts` → Claude API (claude-sonnet-4-6)
2. **Booking form** → `app/api/booking/route.ts` → webhook → n8n
3. **Contact form** → `app/api/contact/route.ts` → Resend email
4. **n8n automation** → external, self-hosted Docker VPS
   - Webhook trigger on booking
   - Guide dispatch logic
   - WhatsApp + email confirmation (Twilio + Resend)
   - D-1 reminder
   - Post-tour review request

## Claude Code Rules
- Read ALL relevant files before writing any code
- Never modify copy/text — content is locked
- Never touch sections outside specified scope
- One concern per prompt
- Validate in browser before next modification
