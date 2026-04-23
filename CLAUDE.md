# Casa Venturas — Claude Code Instructions

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Cloudflare Pages (deployment)
- Google Fonts: Figtree (300/400/500/600, primary) + Cormorant Garamond (300/400/500 + italic 300/400, secondary — pull-quotes only, D-019)

## Design System

### Palette — ÉTAT ACTUEL (voir decisions.md D-012)
Design **LIGHT-FIRST** (héritage Weebly live site — `wsite-theme-light`), aucune surface noire dominante. Brand accent **VERT `#248D6C`** (décidé D-012 : meilleur contraste WCAG AA + cohérence thématique rainforest/El Yunque). La couleur `#F5A623` est **découplée** du brand et réservée aux étoiles TripAdvisor 5★.

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
- Brand accent = VERT `#248D6C` (CTAs, links, icons, eyebrows). Hover = `#1C6E54`. Tint = `#E6F3EE`. Contraste WCAG AA OK sur blanc.
- `#F5A623` = GOLD ÉTOILES UNIQUEMENT (TripAdvisor 5★). JAMAIS sur CTAs, links, ou bg de section.
- Serif `font-serif` (Cormorant Garamond) autorisée UNIQUEMENT sur pull-quotes / italiques éditoriaux (reviews, decorative accents). JAMAIS sur display headings, CTAs, body, nav, formulaires. Voir D-019.

### Typography
- Primary font: Figtree (Google Fonts) — display, body, labels, CTAs, nav, forms
- Secondary font: Cormorant Garamond (D-019) — pull-quotes, italic editorial accents ONLY
- Display headings: Figtree font-weight 300, letter-spacing -0.02em
- Body: Figtree font-weight 300–400
- Labels/CTAs: Figtree font-weight 500–600, letter-spacing 0.12–0.22em, uppercase
- Pull-quote / italic editorial: `font-serif italic` — reserved zone, never for UI chrome

### Key Design Principles
- White background sections — photos carry the color
- Nav: background `rgba(255,255,255,0.97)` (reproduit le header du live Weebly), jamais noir opaque
- Tour selector icons at bottom of hero (like surf-spirit.com)
- All-caps labels with generous letter-spacing
- Thin borders: 1px solid #E8E8E8
- Rounded corners: default 0 (flat). Opt-in `rounded-sm` (2px) allowed on cards / glass panels / editorial elements only (D-019). Never > 2px.
- Shadows: flat by default. Opt-in utilities `shadow-hairline` (editorial elevation) and `shadow-frost` (frosted glass panels) are authorized (D-019). No heavy drop shadows.

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
- Includes: snorkeling equipment, sunset return

Salsa Rooftop:
- Price: $65/person
- Instructor: Zoe
- Location: 1050 Calle Marianna, 00907 San Juan — Casa Santurce Rooftop
- Time: 5 PM daily (per Bokun SSOT, D-020)
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
| ChatWidget (Cavi) | components/ChatWidget.tsx | ✅ Deterministic intent bot (no LLM — D-016) |
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
1. **Cavi** → ✅ Deterministic intent matcher in `lib/cavi-intents.ts` (no LLM frontend — D-016). LLM reserved for backend dispatch/email triage only.
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
