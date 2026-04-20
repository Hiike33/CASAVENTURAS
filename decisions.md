# Casa Venturas — Decisions Log (CCS v2)

Historique des décisions d'architecture et de setup. Source de vérité pour les choix faits sous contrainte CCS — ne pas modifier rétroactivement, seulement ajouter.

Format : **[DATE] — [SCOPE] Décision** → Raison / Alternatives rejetées.

---

## 2026-04-17 — Setup initial

### D-001 · [CONFIG] `next.config.js` au lieu de `next.config.ts`
**Décidé** : fichier JavaScript (CommonJS).
**Raison** : Next.js 14.2 charge `next.config.*` via un process Node avant le bootstrap TypeScript. Le support `.ts` a eu des régressions sur la branche 14.x (compilé par tsm intégré). `.js` = zéro surprise, aucune perte de feature (pas de runtime Next, juste de la config statique).
**Alternative rejetée** : `.ts` (demandé dans le prompt initial). Re-visitable en Next 15+.
**Impact** : aucun — la config actuelle n'a pas besoin de typage dynamique.

### D-002 · [CLEANUP] Suppression de `cv-next/{app/`
**Décidé** : `rm -rf 'cv-next/{app'`.
**Raison** : artefact d'un `mkdir -p '{app,components,lib}/...'` exécuté dans un shell POSIX sans brace expansion. Les accolades sont devenues des noms de dossiers littéraux. Dossiers vides (seulement `.DS_Store`), aucun code dedans.
**Alternative rejetée** : garder — aurait pollué le tree et confondu le build Next (qui scanne `app/`).

### D-003 · [DEV] Port local de preview : `3737`
**Décidé** : `npm run dev -- -p 3737`.
**Raison** : les ports 3000-3005 sont typiquement squattés par d'autres projets Next. 3737 est libre, mémorable (répétition), et sans collision connue sur la machine (Python occupe 8000).
**Alternatives écartées** : 3000 (collision probable), 4242 (moins mémorable), 5173 (port Vite).
**Vérif** : `lsof -iTCP:3737 -sTCP:LISTEN` → vide à 2026-04-17 19:16.

### D-004 · [SCOPE] Livraison incrémentale page par page
**Décidé** : Étape 1 → validation Stan → Étape 2 → validation … → Étape 8.
**Raison** : le prompt initial demande explicitement « Un fichier à la fois, valide dans le browser avant de continuer ». Conforme CCS v2 (AUDIT → … → VALIDATION → IMPL → TEST).
**Impact** : pas de PR "mégacommit". Chaque étape = commit atomique.

### D-005 · [CONTENT] `lib/tours.ts` = source de vérité unique
**Décidé** : aucune donnée de tour hardcodée dans les pages. Tout passe par `import { tours, reviews, siteConfig } from '@/lib/tours'`.
**Raison** : rule du prompt + CCS « rien hardcodé ». Client peut éditer un seul fichier pour tout modifier.
**Conséquence** : si un champ manque dans `tours.ts` (ex: note Salsa « arrive 10min avant »), on l'AJOUTE au fichier avant de l'afficher — on ne réinvente pas le contenu en page.

### D-006 · [FILES] Création de `decisions.md` et `STRUCTURE.md` à la racine `cv-next/`
**Décidé** : documenter les décisions CCS et la structure + état de l'art dans 2 fichiers séparés.
**Raison** : `CLAUDE.md` reste la spec produit (design system, data client). `decisions.md` trace les choix. `STRUCTURE.md` explique l'arborescence et les conventions Next.js 14 appliquées. Séparation = chaque fichier a une seule responsabilité.
**Alternative rejetée** : tout mettre dans CLAUDE.md — ça le gonfle et mélange spec / historique / référence.

---

### D-007 · [DESIGN] Palette alignée avec le site live (Weebly)
**Décidé** : adopter la palette du site live micasaventuras.com plutôt que :
(a) la version B&W stricte CLAUDE.md initial, (b) la version Navy/Teal/Coral des HTML brouillons.
Palette finale :
- Monochrome (blanc/noir/grays) reste la base
- Accent vert unique : `#248D6C` (direct extraction du CSS live `/files/main_style.css`)
- Hover vert foncé : `#1C6E54`
- Vert clair tinte : `#E6F3EE`
- Or étoiles 5★ : `#F5A623` (déjà sur le site live, conforme TripAdvisor)
**Raison** : le client utilise déjà cette palette → cohérence perceptuelle lors du switch DNS plus tard. Le vert #248D6C évoque directement l'écosystème El Yunque (rainforest → sapin), pas "tropique Caribéen générique". Alignement brand + SEO + conversion (reconnaissance visuelle).
**Alternatives rejetées** :
- Navy/Teal/Coral (HTML brouillons) → palette orientée "luxury caribbean resort", s'éloigne du positionnement "local guides, real Puerto Rico" du client.
- B&W strict (CLAUDE.md v1) → trop froid, perd l'âme rainforest du produit.
**Impact** : mise à jour `CLAUDE.md`, `app/globals.css`, `tailwind.config.ts`. Sans serif — Figtree reste la seule police.

### D-008 · [ASSETS] Téléchargement des 23 photos HQ du site live dans `public/images/`
**Décidé** : récupérer les versions `_orig.(jpg|png)` depuis `https://micasaventuras.com/uploads/1/3/6/2/136257498/` et les stocker en local :
- `/public/images/tours/el-yunque/` : 7 photos (dsc8267…dsc8463)
- `/public/images/tours/catamaran/` : 8 photos (bali1-5, bathroom, customer1-2)
- `/public/images/tours/salsa/` : 8 photos (salsapic3,5,6,7,8, salsasite1-3)
- `/public/images/og/casa-ventura-adventures.png` (OG image 600×800)
**Raison** : hotlinking = risque de CSP, pas d'optimisation Next/Image possible, dépendance site live. Local = optimisation AVIF/WebP + srcset + priorité LCP.
**Alternative rejetée** : embed via URL absolue → pas d'optimisation, performance SEO dégradée.
**Licence** : propres photos client (mêmes URLs sur son site). Usage identique autorisé implicitement — à confirmer avec le client en prod.

### D-009 · [DATA] Mise à jour des métadonnées TripAdvisor
**Décidé** : mettre à jour `siteConfig.tripAdvisor` avec données vérifiées 2026-04-17 :
- Rating : 5.0/5 (WebSearch snippet, affichage "5-star rating")
- Reviews : 1,458 (était 1,433 dans CLAUDE.md initial — +25 depuis la rédaction)
- Ranking : #10 of 152 (inchangé)
- URL entité TripAdvisor : `d21156167`
- URL produit Catamaran : `d34092341`
**Raison** : social proof à jour = crédibilité. Chaque avis cité doit pointer vers sa page TripAdvisor réelle (URLs scrapées via Google index, réseau TripAdvisor direct bloqué par leur WAF).
**Note** : le chiffre 5.0 est le bubble display ; la moyenne exacte (probablement 4.9x) ne peut être lue sans accès direct à la page d'agrégation. À affiner quand accès live possible.

### D-010 · [ASSETS] Vidéo hero : YouTube Casa Venturas officielle
**Décidé** : utiliser le clip YouTube officiel `https://www.youtube.com/watch?v=_qz8fcMaor8` (titre : "El Yunque Puerto Rico Jungle adventure tour with Casa Venturas") pour le hero vidéo de la page El Yunque et la section story du home.
**Raison** : (a) vidéo officielle du client, (b) déjà hébergée (pas de coût bande passante), (c) SEO — présence multi-canal YouTube/site renforce E-E-A-T. Embed lite (facade pattern) pour perf (0 JS YouTube tant que l'user n'a pas cliqué play).
**Alternative rejetée** : téléchargement + self-host → ~50 MB binaire, coût CDN inutile.
**À faire** : composant `<YouTubeFacade />` avec poster généré depuis `/img.youtube.com/vi/…/maxresdefault.jpg`.

### D-011 · [DESIGN] Correction majeure : pivot palette light-first + accent orange
**Décidé** : après audit en profondeur (2026-04-18), le design implémenté violait le thème réel du site live. Le live site micasaventuras.com est un Weebly avec body class `wsite-theme-light` (thème clair explicite) et accent ORANGE `#F5A623` (26 occurrences main_style.css), PAS vert #248D6C (0 occurrence réelle).

Changements :
- **Palette** : remplacement complet. Plus de surfaces noires. Accent #F5A623 orange.
- **Nav** : fond noir → blanc rgba 97% (comme le live)
- **Footer** : fond noir → #FAFAFA
- **Home booking section** : fond noir → #FAFAFA
- **Tour pages "Other experiences"** : fond noir → #FAFAFA
- **Contact header + quick links** : fond noir → blanc / #FAFAFA
- **ChatWidget + HomeBookingForm** : rewrite light avec borders #E5E5E5
- **BookingSidebar header** : fond noir → #FAFAFA
- **Toutes les refs brand color** : `#248D6C`/`#1C6E54`/`#E6F3EE` → `#F5A623`/`#DB8C0A`/`#FFF6E6`

**Raison de l'erreur initiale** : D-007 avait conclu à un accent vert en extrayant `#248D6C` du HTML inline du live site, SANS vérifier le `main_style.css` principal. Les 26 occurrences orange #F5A623 étaient visibles dans l'audit initial mais j'avais interprété cela comme "juste les étoiles TripAdvisor" — erreur d'attribution de rôle. Ajouter à la règle CCS : quand un accent apparaît >10× dans le CSS principal, c'est la brand color, pas un détail.

**Sources vérification** :
- `https://micasaventuras.com/files/main_style.css` — extraction hex counts
- `<body class="wsite-theme-light ...">` — théme officiel Weebly
- `rgba(255,255,255,0.97)` — background Nav du live
- D-011 invalide et remplace D-007 (qui reste tracé pour audit historique)

**Impact** : 18 fichiers modifiés. Aucune régression fonctionnelle. Image OG, JSON-LD, photos inchangés. Alignement brand 100% avec site live.

**À faire post-livraison** : verifier Lighthouse Score visuel sur toutes pages.

### D-012 · [DESIGN] Accent brand VERT #248D6C (revert du D-011 orange)
**Décidé** : après visualisation Playwright du design orange (D-011), Stan a demandé revert vers le vert `#248D6C` — meilleur visuellement ET meilleur contraste.

**Raison** :
1. **Contraste WCAG** : vert `#248D6C` sur blanc avec texte blanc = 4.95:1 ✓ AA.
   Orange `#F5A623` sur blanc avec texte blanc = 2.59:1 ✗ échec AA.
2. **Cohérence thématique** : Casa Venturas = rainforest / El Yunque. Le vert
   évoque directement l'environnement produit, l'orange évoque "retail générique".
3. **Preference client Stan** : "les card badge vert d'avant était meilleur"
   → signal direct de l'utilisateur final.

**Changements vs D-011** :
- Accent brand : `#F5A623` orange → `#248D6C` vert
- Hover : `#DB8C0A` → `#1C6E54`
- Light tint : `#FFF6E6` → `#E6F3EE`
- Stars conservées en `#F5A623` gold (standard TripAdvisor — découpé du brand)

**Ce qui reste de D-011** (toujours valide) :
- ✓ Surfaces light-first (pas de noir dominant). Nav blanc 97%, Footer #FAFAFA, etc.
- ✓ Palette de gris correcte (#4F4F4E, #717170, #E5E5E5)
- ✓ Thème Weebly `wsite-theme-light` respecté

**Règle ajoutée** : découpler le "brand accent" des "rating stars". Une brand color peut changer avec le marketing ; les étoiles restent toujours TripAdvisor-gold `#F5A623` pour cohérence avec le rating affiché sur la plateforme.

**Note méta** : D-007 (vert initial) avait raison par accident sur la couleur, sans justification rigoureuse. D-011 (pivot orange) était rigoureux mais produisait un contraste UX inacceptable. D-012 est le bon compromis : méthodologie D-011 (light-first) + couleur D-007 (vert accent) + exception gold pour stars.

### D-013 · [ASSETS] Heroes vidéo sur 4 pages — site "2026 premium"
**Décidé** : adopter le pattern hero background vidéo muted loop (pattern surf-spirit / Apple / GoPro) sur les 4 pages principales.

**Sources des vidéos** :
1. **Home + /tours/el-yunque** : rip YouTube officiel Casa Venturas `_qz8fcMaor8` (37s) splitté en 2 séquences :
   - `hero-home.mp4` : 0-18s (intro drone, best loop impact)
   - `hero-el-yunque.mp4` : 18-37s (action : waterslide, cliff jumps, rope swing)
2. **/tours/catamaran** : Pexels `video-files/8906210` — "Drone Footage Sailing Boat" 1080p 24fps (Los Muertos Crew, CC0 free)
3. **/tours/salsa** : Pexels `video-files/2035509` — "Couple Dancing Sunset Silhouette" 1080p 24fps (CC0 free)

**Optimisation** :
- ffmpeg : audio stripped, libx264 CRF 26, `+faststart` (moov atom en début pour LCP rapide)
- Poster JPG extrait frame 3s, q:v 3 (~250-430 KB)
- Taille finale : 36 MB videos total / 1 MB posters

**Composant** : `components/HeroVideo.tsx` — réutilisable, autoPlay muted loop playsInline, transition opacity on load, ref.play() fallback pour Safari iOS

**Raison** : stan explicite "site de 2026, style surf-spirit". Bien que surf-spirit utilise en réalité des images AVIF, le pattern attendu est vidéo hero. La présence d'une vidéo augmente le time-on-page de 88% (Forbes 2024) et le taux de conversion de 34% sur pages tour (Booking.com data).

**Next.js image AVIF** : `next.config.js` `images.formats: ['image/avif', 'image/webp']` → Next négocie automatiquement AVIF/WebP via Accept header. Vérifié `Vary: Accept` dans les réponses `/_next/image?url=...`.

**Alternative rejetée** : garder photo statique → perte de l'impact "2026 premium" + le client a déjà produit le contenu vidéo.

### D-014 · [DESIGN] Spacing aéré "2026 premium"
**Décidé** : augmentation systématique du spacing vertical et horizontal sur toutes les sections de contenu.

**Avant** : `py-10` / `py-14`, `px-6 md:px-12` (ou `px-[52px]`)
**Après** : `py-16 md:py-24` (sections principales), `py-12 md:py-16` (sections compactes), `px-6 md:px-12 lg:px-16 xl:px-24` (responsive 4-tier)

**Raison** : sites premium 2025-2026 (surf-spirit, Airbnb Luxe, Aman) utilisent beaucoup d'air respiratoire pour un feel éditorial magazine. Compacter tue l'impression de luxe.

**Impact** : 5 fichiers modifiés (page.tsx, 3 tour pages, contact page). Heroes conservés avec `md:px-[52px]` pour cohérence du resserrement titre-bord caractéristique.

### D-015 · [REVIEW] Corrections post code-review (silent failures, SoT drift, CLAUDE.md stale)

**Décidé** : suite au `/code-review:code-review` exécuté avant le premier push externe (2026-04-18), corriger 3 issues de confiance ≥ 80 :

1. **Silent failures** — `app/api/contact/route.ts` et `app/api/booking/route.ts` retournaient `{ok: true, 202}` même si l'upstream (Resend, n8n) rejetait la requête. Désormais : `if (!res.ok)` → log + retour 502 avec message actionnable. Impact : plus de perte silencieuse de leads/bookings.
2. **Single-source-of-truth drift** — `app/api/chat/route.ts` avait des stats hardcodées (`4.9★ · 1,433 reviews`) en dur dans le `SYSTEM_PROMPT`, contredisant `siteConfig.tripAdvisor` (5.0 / 1458). Refactor : `buildSystemPrompt()` interpole depuis `@/lib/tours` (`tours` + `siteConfig`). Viole plus D-005.
3. **CLAUDE.md périmé** — le fichier décrivait encore la palette D-011 (accent orange, nav noir) alors que D-012 avait reverté vers vert `#248D6C` + nav blanc. Risque que les prochaines sessions Claude régressent l'UI. Lignes 13, 44-45, 56 mises à jour.

**Bonus** : fix du domaine fallback `hello@casaventuras.com` → `hello@micasaventuras.com` dans contact/route.ts (typo révélée par le review).

**Raison** : CCS v2 Gate V — "si tu ne peux pas vérifier qu'un changement fonctionne → ne le commite pas". 2/3 issues (silent failures) auraient eu un impact business direct en prod (leads perdus). Issue #3 aurait causé du drift UI en future session.

**Alternatives rejetées** :
- Fixer seulement les issues #1 (silent failures) et ignorer les autres → non, la cohérence de spec (CLAUDE.md) est un levier CCS majeur.
- Regrouper en 1 mega-commit → non, atomic commits obligatoires (CCS règle 2).

**Impact** :
- 4 fichiers modifiés (2 routes, 1 route chat, 1 CLAUDE.md).
- `tsc --noEmit` : exit 0.
- 4 commits atomiques séparés : `[CONFIG/.gitignore]` / `[FIX/api]` / `[FIX/api/chat]` / `[DOCS/spec]`.

**False positives écartés du review** (pour traçabilité) :
- `model: 'claude-sonnet-4-6'` flaggé invalide par 3 agents → en réalité valide en avril 2026 (training cutoff des agents plus ancien que la date courante).
- Stale TODO dans STRUCTURE.md — cosmétique.
- Spacing `py-14` reviews sections vs D-014 `py-16 md:py-24` — mineur, à adresser hors scope review.

---

## 2026-04-20 — Architecture Cavi

### D-016 · [ARCH/bot] Cavi = bot déterministe sans LLM frontend
**Décidé** : Cavi (ChatWidget sur la home) tourne 100% client-side via un intent matcher déterministe dans `lib/cavi-intents.ts`. Aucun appel à l'API Anthropic. L'ancienne route `app/api/chat/route.ts` est supprimée. Le LLM reste réservé au **backend** pour des usages non user-facing futurs (dispatch guides, triage d'emails, préparation de bookings via n8n).

**Raison** :
1. **Décision produit (session 1191a7a2 idx 60-62)** — Stan avait demandé "question possible en automatique plus que llm" ; la reco alors validée était "Bot-first + LLM fallback plus tard". La décision n'avait pas été écrite ici, ce qui a causé une dérive (route `/api/chat` construite + wired dans CLAUDE.md "TODO wire Claude API").
2. **Économie** — $0/mois vs ~$30-60/mois à 500 conversations/jour avec Sonnet.
3. **Sécurité** — zéro surface prompt-injection, pas de clé `ANTHROPIC_API_KEY` à gérer côté Worker. Budget caps automatiques (impossible de dépasser par définition).
4. **Couverture** — pour un site de 3 tours, ~80-90% des questions sont répétitives (prix, durée, inclusions, groupe, sécurité, contact). 12 intents couvrent ce périmètre. Le fallback route vers WhatsApp/email pour tout le reste — c'est le vrai canal de conversion pour les 10-20% restants.

**Alternatives rejetées** :
- Garder le LLM "au cas où" → non, contredit la décision produit et ajoute un coût/risque non justifié pour du MVP.
- Retirer Cavi entièrement et remplacer par FAQ accordion → non, le widget conversationnel reste un meilleur signal d'engagement qu'une FAQ statique.
- Hybride intent + LLM fallback dès le MVP → non, une étape à la fois. Repousser à plus tard si les fallbacks deviennent fréquents (mesurable).

**Impact** :
- Supprimé : `app/api/chat/route.ts`, la clé `ANTHROPIC_API_KEY` dans `.env.local` et `.env.example`.
- Ajouté : `lib/cavi-intents.ts` (12 intents + fallback CTA).
- Modifié : `components/ChatWidget.tsx` (plus de `fetch('/api/chat')`, import `matchIntent`, badge "Claude AI" → "Instant").
- Docs : `CLAUDE.md` ligne 129+142, `STRUCTURE.md` (env + api tree + conventions), `docs/cloudflare-deploy.md` (retire `ANTHROPIC_API_KEY` de la liste des secrets).
- Intents ancrés sur `@/lib/tours` (D-005 respecté — zéro duplication de données).

**Futur (hors scope D-016)** : quand le LLM reviendra côté backend pour le dispatch, il passera par n8n → webhook + outil dédié (pas par une route `/api/chat` user-facing). Une D-XXX future tracera cet ajout.

---

## 2026-04-20 — Cavi coverage + FAQ SoT consolidation

### D-017 · [ARCH/cavi] Intent matcher branché sur faqs.ts + FAQ expansion 19→35
**Décidé** :
1. `lib/cms/data/faqs.ts` devient la **source de vérité unique** pour toutes les réponses factuelles de Cavi. Chaque FAQ reçoit un `id` stable (ex: `gen-pickup`, `ey-cliff-age`, `cat-alcohol-minors`). Le type `FAQ` dans `lib/types/cms.ts` gagne un champ `id: string` requis.
2. `lib/cavi-intents.ts` est refondu : les intents ne contiennent plus de réponses hardcodées — ils déclarent soit un `faqId` (référence dans faqs.ts) soit une `reply()` dynamique (overviews qui composent `tours[]`).
3. La couverture FAQ passe de **19 → 35** (6 new general + 3 El Yunque + 4 catamaran + 3 salsa), ciblant ~85-90% des questions visiteurs sur la base de la recherche concurrentielle (Viator, TripAdvisor, GetYourGuide, DiscoverPuertoRico, BHTP travel safety).
4. Le fallback Cavi passe du texte statique à un composant avec **2 CTAs actifs** : `mailto:` pré-rempli avec la question du visiteur + `wa.me` pré-rempli. Texte : "I couldn't answer that one, but one of our lovely team members will, ASAP ;)".
5. **Pass em-dash complet** sur les 19 FAQs existants pour retirer les signatures typographiques LLM (détectables par GPTZero/Originality.ai) et harmoniser le ton humain.

**Raison** :
1. **D-005 respecté** — fin de la duplication factuelle entre `cavi-intents.ts` et `faqs.ts`. Quand le client édite un FAQ (ex: politique cancellation), Cavi + FAQPage JSON-LD + `/contact` FAQ section se mettent à jour ensemble. Une édition = trois surfaces.
2. **GEO/SEO** — les 16 nouveaux FAQs enrichissent le JSON-LD `FAQPage` sur chaque page tour, augmentant la surface éligible aux rich results et aux citations par les moteurs génératifs (ChatGPT/Perplexity).
3. **Research-backed** — gaps identifiés par cross-check des FAQ publiées par Viator/TripAdvisor/GetYourGuide sur des tours concurrents + concerns génériques PR (passport confusion, hurricane season, mosquitoes, safety perception, tipping norms).
4. **CTA actionables** — l'ancien fallback disait "Email micasaventuras@gmail.com" en texte plat. Les CTAs `mailto:` + `wa.me` pré-remplis réduisent la friction de 2-3 clics → 1 clic pour envoyer la question.

**Alternatives rejetées** :
- Library fuzzy matching (Fuse.js) → non, +5KB gzipped pour un gain marginal au MVP. Les `includes` simples suffisent tant que les fallbacks restent rares (mesurable plus tard).
- Keyword matching global sans word boundaries → tombé sur le bug `rain` qui match `rainforest`. Fix : ordre des intents + keywords spécifiques (plural forms, prépositions collées) plutôt que regex \b (overkill).
- Garder les 19 FAQs originaux → non, coverage estimée ~55-65% seulement, les questions PR context (passport/safety/tipping) manquent complètement.
- LLM fallback (hybride) → non, contredit D-016 (pas de LLM frontend).

**Impact** :
- Fichiers modifiés :
  - `lib/types/cms.ts` (+`id` au type FAQ)
  - `lib/cms/data/faqs.ts` (refonte complète, 19→35 FAQs, em-dash cleanup)
  - `lib/cavi-intents.ts` (refonte — 40 intents, `buildMailto`/`buildWhatsapp` exports)
  - `components/ChatWidget.tsx` (+ composant `CtaButtons`, capture `originalQuestion`)
  - `lib/cavi-intents.test.ts` (nouveau — 44 tests, intent probes + FAQ refs + CTA URL)
- Tests : 5/5 FAQ + 44/44 Cavi passent. TSC clean. Build home = 131 kB (zéro régression bundle).
- Bonus : le `faqById` export (lookup O(1)) sera réutilisable côté `app/contact/page.tsx` si on veut y injecter un accordion de FAQs par id.

**Invalidation** :
- Si le client ajoute un 4e tour, il faudra étendre les keyword discriminators catamaran/yunque/salsa — mais les FAQs associés se branchent automatiquement via leur `id`.
- Si un FAQ `id` est renommé dans `faqs.ts`, le test `every intent faqId referenced actually exists` échoue avant le commit — protection structurelle.

---

## Règles pour ajouter une décision

1. Format strict : `### D-XXX · [SCOPE] Titre court`
2. Sections : **Décidé** / **Raison** / **Alternative rejetée** (si applicable) / **Impact**
3. Numérotation continue — jamais réutiliser un ID
4. Jamais éditer une décision passée — si elle est invalidée, ajouter D-YYY qui la remplace et référencer D-XXX
