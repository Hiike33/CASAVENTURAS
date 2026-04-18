# Casa Venturas — Structure projet & état de l'art

## 1. Arborescence cible (à la fin de l'étape 8)

```
cv-next/
├── CLAUDE.md                  # Spec produit (design, data client, règles)
├── decisions.md               # Historique décisions CCS (D-001, D-002, …)
├── STRUCTURE.md               # Ce fichier — arbo + best practices Next 14
├── package.json
├── package-lock.json
├── next.config.js             # [D-001] JS choisi (pas TS)
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json              # paths alias @/* → ./*
├── next-env.d.ts              # auto-généré par Next au 1er dev
├── .env.example               # clés attendues (ANTHROPIC_API_KEY, RESEND, n8n)
├── .env.local                 # (git-ignoré) secrets réels
│
├── app/                       # Next 14 App Router
│   ├── layout.tsx             # <html> + <body> + globals.css + <Metadata>
│   ├── page.tsx               # Home "/"
│   ├── globals.css            # Figtree import, CSS vars, reset, border-radius 0
│   ├── api/
│   │   └── chat/route.ts      # POST → Claude Sonnet (Cavi)
│   │   ├── booking/route.ts   # [TODO] POST → n8n webhook
│   │   └── contact/route.ts   # [TODO] POST → Resend
│   ├── tours/
│   │   ├── el-yunque/page.tsx # [Étape 2]
│   │   ├── catamaran/page.tsx # [Étape 3]
│   │   └── salsa/page.tsx     # [Étape 4]
│   └── contact/page.tsx       # [Étape 5]
│
├── components/                # Composants React (import via @/components/*)
│   ├── Nav.tsx                # fixed top, black
│   ├── Hero.tsx               # video bg, tour selector bottom
│   ├── TourCard.tsx           # carte tour grille home
│   ├── Footer.tsx             # dark footer
│   ├── ChatWidget.tsx         # Cavi (wire étape 7)
│   └── ReviewsStrip.tsx       # [Étape 6] drag-scroll horizontal
│
├── lib/
│   └── tours.ts               # [D-005] source de vérité : tours/reviews/siteConfig
│
└── public/
    ├── videos/                # (client fournit hero.mp4, story.mp4)
    └── images/                # (client fournit tours/*.jpg, hero-poster.jpg)
```

## 2. Conventions Next.js 14 appliquées (état de l'art 2026)

### 2.1 App Router (pas Pages Router)
- Un dossier `app/` = un segment d'URL. `app/tours/el-yunque/page.tsx` → `/tours/el-yunque`.
- `page.tsx` = route publique. `layout.tsx` = wrapper persistant. `route.ts` = API handler.
- Server Components par défaut. Seuls les fichiers `'use client'` descendent côté navigateur.
- **Impact projet** : `Nav`, `Hero`, `ChatWidget` sont `'use client'` (état + événements). `page.tsx`, `TourCard`, `Footer` restent Server Components → moins de JS envoyé au navigateur.

### 2.2 Metadata API (SEO first-class)
- Export nommé `metadata` (statique) ou `generateMetadata()` (dynamique) dans chaque `page.tsx` ou `layout.tsx`.
- Next sérialise en `<title>`, `<meta name="description">`, `<meta property="og:*">` automatiquement.
- **Impact projet** : étape 8 utilise `generateMetadata` par page tour (title, description, keywords naturels SEO local : « El Yunque tour San Juan »).

### 2.3 Imports absolus via `tsconfig.paths`
- `@/components/Nav` résolu depuis racine → pas de `../../../`.
- Fonctionne pour Server et Client Components.
- **Impact projet** : déjà utilisé dans `app/page.tsx`, doit absolument être dans `tsconfig.json` (fait).

### 2.4 CSS — Tailwind + globals.css minimal
- `globals.css` ne contient que : import police, directives Tailwind, variables CSS custom, reset global.
- Tout le style inline via classes Tailwind ou `style={{}}` pour valeurs calculées.
- **Impact projet** : palette en CSS vars (`--cv-black`, `--cv-gray1`…) pour cohérence inter-composants. Classes Tailwind pour mise en page.

### 2.5 `next/image` pour toute image
- Optimisation automatique (AVIF/WebP, lazy, responsive srcset).
- Requiert `width` / `height` ou `fill` + parent `position: relative`.
- **Impact projet** : quand le client fournit les JPG, remplacer les `<div style={{background: tour.thumbBg}}>` par `<Image src={...} fill />` dans `TourCard`.

### 2.6 Fonts — `next/font` recommandé (non utilisé ici)
- `next/font/google` auto-host la police, élimine le CLS, supprime la requête vers fonts.googleapis.
- **Notre choix actuel** : import CSS `@import url('…Figtree…')` dans `globals.css`.
- **Trade-off** : simpler but 1 extra blocking request. À migrer plus tard pour -50ms LCP.

### 2.7 Server Actions (Next 14.x stable)
- Formulaires mutations sans endpoint API séparé.
- **Notre choix** : on reste sur `fetch('/api/chat')` + `route.ts` — plus explicite pour Cavi et compatible avec le wire n8n.

### 2.8 Loading & Error UI
- Fichiers conventionnels : `loading.tsx`, `error.tsx`, `not-found.tsx`.
- **Impact projet** : optionnel pour l'étape 1. À ajouter si temps après étape 8.

## 3. SEO tour operators — état de l'art (2026)

### 3.1 Intention de recherche locale
Les requêtes type « El Yunque tour small group », « private catamaran Vieques », « salsa lesson San Juan » sont du **local + transactionnel**. Stratégie gagnante (vs Viator / TripAdvisor qui dominent l'organique) :

1. **Schema.org `TouristTrip` + `LocalBusiness`** injecté en JSON-LD dans chaque page tour → éligibilité aux rich results (prix, note, durée directement dans la SERP).
2. **Reviews avec auteurs réels + dates** (TripAdvisor snapshot) → E-E-A-T Google renforcé.
3. **Prix affiché côté serveur** (pas derrière JS) → crawlable.
4. **Pages tour = URL stables** `/tours/<slug>` (fait) — jamais de query string.
5. **Internal linking dense** : home → tour → autres tours (Other experiences, fait dans le prompt).

### 3.2 Core Web Vitals (Google ranking factor)
- LCP < 2.5s : image hero/vidéo pré-chargée, `next/image` avec `priority`.
- CLS < 0.1 : dimensions explicites sur images + hero fixe.
- INP < 200ms : Server Components minimisent le JS hydration.

### 3.3 GEO (Generative Engine Optimization) — nouveauté 2025-2026
Les LLM (Claude, ChatGPT, Perplexity) lisent les pages pour recommander. Pour être recommandé :
- **Contenu structuré en blocs sémantiques** (h2/h3 avec noms d'entités).
- **Faits vérifiables sourcés** (« #10 of 152 in San Juan — TripAdvisor 2025 »).
- **Réponses directes aux questions utilisateur** (« What to bring », « How long », « Where ») → paragraphes indépendants.
- **Cavi** (notre chat IA on-site) = boucle de conversion directe qui court-circuite la recherche externe.

## 4. Accessibilité — baseline WCAG 2.2 AA

- Contraste : blanc #fff sur noir #111 = ratio 19.3:1 (AAA). OK.
- Taille min texte body : 13px (limite basse) — OK sur desktop, à surveiller mobile.
- Tous les liens ont un intitulé explicite (pas « click here »).
- Boutons `<button>` (pas `<div onClick>`).
- `alt` obligatoire sur toute `<Image>` quand client fournit les assets.
- Hero vidéo : `muted` (fait) + `playsInline` (fait) + fallback `poster` (fait).

## 5. Performance — budgets visés

| Métrique | Budget | Outil vérif |
|---|---|---|
| JS bundle home | < 120 kB gzip | `next build` output |
| LCP | < 2.5s | Lighthouse CI |
| TTFB | < 300ms | Vercel / Cloudflare headers |
| Images | AVIF prioritaire | `next/image` auto |

## 6. Déploiement — Cloudflare Pages

- Adapter : `@cloudflare/next-on-pages` (requis pour Next 14 App Router + Cloudflare).
- Routes `route.ts` deviennent Workers.
- Pas de Node.js runtime dispo — uniquement edge runtime. Claude API via fetch compatible.
- `.env` géré via Cloudflare Dashboard.

## 7. Ports & preview local

- **3737** : port canonique pour ce projet en dev (D-003).
- Commande : `npm run dev -- -p 3737`.
- URL : `http://localhost:3737`.

## 8. Commandes utiles

```bash
cd cv-next

# Installation
npm install

# Dev (port dédié 3737)
npm run dev -- -p 3737

# Build prod
npm run build

# Start prod local
npm start -- -p 3737

# Lint
npm run lint
```

## 9. Sources

- Next.js 14 docs — https://nextjs.org/docs
- Web.dev Core Web Vitals — https://web.dev/vitals/
- Schema.org TouristTrip — https://schema.org/TouristTrip
- GEO research — Aggarwal et al., « GEO: Generative Engine Optimization », 2024
- Cloudflare Next adapter — https://github.com/cloudflare/next-on-pages
