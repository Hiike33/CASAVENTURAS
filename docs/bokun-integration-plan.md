# Bókun Integration — Implementation Plan

**Status:** Phase 1 shipped (commit `c321e59`) — Phase 2 (UI wiring) pending user GO
**Related:** [bokun-setup-client.md](./bokun-setup-client.md) — guide client (côté Bókun dashboard)

---

## 1. Widget vs Button — deux approches officielles Bókun

Le loader Bókun (`BokunWidgetsLoader.js`) détecte **deux classes CSS** dans le DOM et les transforme :

| Classe CSS | Effet | UX |
|---|---|---|
| `.bokunWidget[data-src="..."]` | Remplace le `<div>` par une **UI complète de booking inline** (calendrier, dispo, pax, prix, CTA, checkout) | User ne quitte jamais le flow |
| `.bokunButton[data-src="..."]` | Transforme en **bouton** qui ouvre un **modal iframe** au clic | User voit d'abord ta page, puis le modal |

### Approche A — Widget inline (RECOMMANDÉE)

```
┌─ Ta page /tours/el-yunque ─────────────────────────┐
│                                                     │
│  [Hero / About / Gallery / Highlights]              │
│                                                     │
│  ┌─ #book (sidebar) ──────────────┐                 │
│  │                                │                 │
│  │  <div class="bokunWidget"      │                 │
│  │       data-src="...product/X"> │                 │
│  │                                │                 │
│  │  [Calendar]                    │                 │
│  │  [Pax selector]                │                 │
│  │  [Price: $89 × 2 = $178]       │                 │
│  │  [BOOK NOW ──────────────────] │                 │
│  │                                │                 │
│  └────────────────────────────────┘                 │
│                                                     │
└─────────────────────────────────────────────────────┘
        │
        ▼ click "Book now"
   modal iframe Bókun (checkout + paiement CB)
```

**Pros :**
- 1 seule UI cohérente (pas de double sélection date/pax)
- Dispo temps réel visible **avant** le clic
- Prix total visible **avant** le clic
- Flow le plus court : 3 clics max pour réserver
- Bókun gère tout : dispo, pricing, checkout, CB, confirmation email

**Cons :**
- UI Bókun native → **ne matche pas 100% la palette** `#248D6C` + Figtree du site
- Couvre ~100% de la sidebar actuelle (remplace `BookingSidebar.tsx`)

### Approche B — Bouton seul

```
┌─ Ta page /tours/el-yunque ─────────────────────────┐
│                                                     │
│  ┌─ #book (sidebar CUSTOM actuelle) ───┐            │
│  │  [Date picker custom]                │           │
│  │  [Guests input custom]               │           │
│  │  [Level select custom]               │           │
│  │  [Name / Email]                      │           │
│  │                                      │           │
│  │  <a class="bokunButton"              │           │
│  │     data-src="...">                  │           │
│  │  [CONFIRM BOOKING ────────]          │           │
│  │                                      │           │
│  └──────────────────────────────────────┘           │
│                                                     │
└─────────────────────────────────────────────────────┘
        │
        ▼ click
   modal iframe Bókun
   ⚠️ user RE-SÉLECTIONNE date + pax dans le modal
   (ce qu'il avait rempli dans ta sidebar est PERDU)
```

**Pros :**
- Garde ta sidebar design (palette verte, Figtree)
- Transition visuelle douce

**Cons MAJEURS :**
- **Double saisie** : user remplit date/pax dans ta sidebar… puis re-remplit dans le modal Bókun (les données ne sont pas transmises)
- Pas de dispo temps réel avant le clic (ta sidebar ne sait pas ce qui est vendu)
- Pas de prix total temps réel (ta sidebar affiche juste le "from $89")
- Taux d'abandon probablement plus élevé (frustration double saisie)

### Verdict

**→ Approche A** pour `/tours/*` (pages détail tour — focus conversion)
**→ `.bokunButton` en option sur la home** (CTA discret "Book a tour" qui ouvre modal de sélection)

---

## 2. Problème SPA (Next.js App Router) — explication

### Ce qui se passe normalement (1re visite)

```
1. User → GET /tours/el-yunque
2. Next.js SSR → HTML avec <div class="bokunWidget">
3. Navigateur charge la page → React hydrate
4. <Script> injecte BokunWidgetsLoader.js (afterInteractive)
5. Loader scan document.body → trouve .bokunWidget → remplit avec UI Bókun
6. ✅ Widget fonctionne
```

### Ce qui casse (navigation SPA entre tours)

```
1. User sur /tours/el-yunque (widget OK) clique <Link href="/tours/catamaran">
2. Next.js App Router = SOFT NAVIGATION :
   - PAS de rechargement page
   - PAS de re-exécution du <Script>
   - React remplace le contenu /el-yunque par /catamaran
3. Nouveau <div class="bokunWidget" data-src=".../catamaran"> apparaît dans le DOM
4. MAIS le loader Bókun a déjà fini son scan initial (étape 5 du flow ci-dessus)
5. Sans MutationObserver côté Bókun → le nouveau div REST VIDE
6. ❌ Widget catamaran ne s'affiche pas
```

### Mitigation (3 options)

| Option | Description | UX impact |
|---|---|---|
| **M1** — MutationObserver natif Bókun | Si le bundle `BokunWidgets.{hash}.js` observe déjà le DOM → rien à faire. À tester. | 0 |
| **M2** — Re-mount forcé via `key` | Utiliser `<BokunWidget key={tour.slug} />` + appel manuel à l'API Bókun (`window.BokunWidgets?.reload?.()`) dans `useEffect` | 0 si API existe, sinon inop |
| **M3** — Hard reload | Transformer `<Link href="/tours/...">` en `<a href="/tours/...">` sur les nav tour-à-tour | Perte du SPA feel (léger flash blanc ~200ms) |

**Plan :** tester M1 en premier (coût zéro). Si KO → M2. Si KO → M3 (fallback sûr).

---

## 3. Étapes d'implémentation

### 3.1 Fichiers à créer

- **`.env.local`** (non commité) — les 4 valeurs fournies par le client :
  ```env
  NEXT_PUBLIC_BOKUN_CHANNEL_UUID=<UUID>
  NEXT_PUBLIC_BOKUN_PRODUCT_EL_YUNQUE=<id>
  NEXT_PUBLIC_BOKUN_PRODUCT_CATAMARAN=<id>
  NEXT_PUBLIC_BOKUN_PRODUCT_SALSA=<id>
  ```

- **`components/BokunWidget.tsx`** (nouveau) — Client Component :
  - Charge le loader via `next/script` strategy `afterInteractive`
  - Garde-fou singleton (le loader refuse 2 channelUUID différents sur une même page)
  - Placeholder `<div class="bokunWidget" data-src="..." />`
  - `key={productId}` pour forcer re-mount sur nav SPA
  - Wrapper visuel stylé `border border-[#E5E5E5]` pour s'intégrer au design

- **`components/BokunButton.tsx`** (nouveau, optionnel phase 2) — pour CTA home :
  - `<a class="bokunButton" data-src="..." />` stylé Casa Venturas

### 3.2 Fichiers à modifier

- **`.env.example`** — ajouter les 4 vars (sans valeurs)
- **`lib/types/cms.ts`** — ajouter `bokunProductId?: string` sur type `Tour`
- **`lib/cms/data/tours.ts`** — passer les product IDs via env vars sur les 3 tours
- **`app/tours/el-yunque/page.tsx`** — remplacer `<BookingSidebar />` par `<BokunWidget />`
- **`app/tours/catamaran/page.tsx`** — idem
- **`app/tours/salsa/page.tsx`** — idem
- **`app/page.tsx`** — remplacer `<HomeBookingForm />` par `<BokunButton />` OU 3 boutons (1/tour)
- **`CLAUDE.md`** — mettre à jour TODO section (ligne 142-146, retirer "booking form → /api/booking → webhook → n8n")
- **`decisions.md`** — ajouter D-XXX "Switch to Bókun widget-only (no custom booking form)"

### 3.3 Fichiers à supprimer (après QA verte)

- **`components/BookingSidebar.tsx`** — orphelin
- **`components/HomeBookingForm.tsx`** — orphelin
- **`app/api/booking/route.ts`** — webhook Bókun → n8n remplace cette route (confirmé via Grep : seuls `BookingSidebar` et `HomeBookingForm` l'appellent)

### 3.4 Stratégie git (1 commit par phase)

```
[FEAT/booking] Add BokunWidget component + env config
├─ components/BokunWidget.tsx
├─ .env.example
├─ lib/types/cms.ts (bokunProductId field)
└─ lib/cms/data/tours.ts (wire env vars)

[FEAT/booking] Replace BookingSidebar with BokunWidget on tour pages
├─ app/tours/el-yunque/page.tsx
├─ app/tours/catamaran/page.tsx
└─ app/tours/salsa/page.tsx

[FEAT/booking] Replace HomeBookingForm with Bókun CTA on home
└─ app/page.tsx + components/BokunButton.tsx

[CHORE/cleanup] Remove legacy booking form + /api/booking route
├─ components/BookingSidebar.tsx (deleted)
├─ components/HomeBookingForm.tsx (deleted)
└─ app/api/booking/route.ts (deleted)

[DOCS] Update CLAUDE.md TODO + log D-0XX in decisions.md
├─ CLAUDE.md
└─ decisions.md
```

Chaque commit = `npm run build` vert avant push. Un seul concept logique par commit.

---

## 4. Plan de test (QA manuelle)

### 4.1 Build check (local)

```bash
cd cv-next
npm run build
# attendu : 0 erreur TS, 0 warning bloquant
```

### 4.2 Dev server + QA navigateur

```bash
cd cv-next
npm run dev -- -p 3737
# http://localhost:3737/tours/el-yunque
```

Checklist par page (`/`, `/tours/el-yunque`, `/tours/catamaran`, `/tours/salsa`) :

- [ ] Page charge sans erreur console
- [ ] Widget Bókun monte dans `#book` (calendar visible, pas le placeholder "Loading…")
- [ ] Sélection date/pax → prix total s'update
- [ ] Click "Book now" → modal iframe ouvre
- [ ] Dans le modal : formulaire guest + saisie CB (mode test Bókun)
- [ ] Submit test booking → confirmation écran + email reçu
- [ ] Booking visible dans dashboard Bókun (admin côté client)

### 4.3 Test SPA (M1 → M2 → M3)

- [ ] Ouvrir `/tours/el-yunque` (widget OK)
- [ ] Click `<Link>` vers `/tours/catamaran`
- [ ] **CAS A (M1 OK)** : widget catamaran s'affiche correctement → rien à faire
- [ ] **CAS B (M1 KO)** : widget reste vide → appliquer M2 (key + reload API)
- [ ] **CAS C (M2 KO)** : si API Bókun n'expose pas de `reload()` → appliquer M3 (hard reload via `<a>`)

### 4.4 Webhook Bókun → n8n

⚠️ Pré-requis : n8n webhook déployé + URL fournie au client pour étape 4 du guide.
Test : booking test sur site → vérifier que n8n reçoit le payload `BOOKING_CONFIRMED`.

---

## 5. Risques & mitigations

| Risque | Probabilité | Mitigation |
|---|---|---|
| SPA re-mount casse le widget | MOYENNE | 3 options M1→M2→M3 (voir §2) |
| Widget style ne matche pas palette site | CERTAINE | Wrapper visuel + params URL Bókun si supportés (lang, currency) |
| Cookies Bókun posent problème CNIL/GDPR | MOYENNE | Ajouter mention dans bandeau cookies (si existe) |
| Env var `NEXT_PUBLIC_*` exposée dans le bundle JS | CERTAINE (by design) | OK — ces IDs sont publics côté widget, pas sensible |
| Perf : +1 bundle externe (~200-400kb) | FAIBLE | `afterInteractive` strategy → pas de blocking render |
| Build Cloudflare Pages casse sur script externe | FAIBLE | Widget 100% client-side → compat totale edge runtime |

---

## 6. Checklist GO (avant commit 1er)

- [x] Credentials client reçus (4 valeurs : channelUUID + 3 product IDs)
- [x] Repo git clean (`git status`)
- [ ] `.env.local` rempli avec les valeurs réelles
- [ ] Décision A vs B validée par user → **A (widget inline) recommandée**
- [ ] Décision SPA validée → **plan M1→M2→M3**
- [ ] `git stash` ou commit séparé des 3 fichiers tours actuellement modifiés (pour ne pas polluer le commit Bókun)

---

## 7. Ordre d'exécution concret

```
1. Stash / commit des 3 fichiers tours modifiés (hors scope Bókun)
2. git checkout -b feat/bokun-widget
3. Créer .env.local avec les 4 valeurs
4. Ajouter vars dans .env.example
5. Étendre type Tour avec bokunProductId
6. Wire env vars dans lib/cms/data/tours.ts
7. Créer components/BokunWidget.tsx
8. npm run build — valider
9. Commit #1 : [FEAT/booking] Add BokunWidget component + env config
10. Remplacer BookingSidebar sur les 3 pages tours
11. npm run dev -- -p 3737 — QA §4.2 sur les 3 pages
12. Tester SPA §4.3 — appliquer M2/M3 si M1 KO
13. Commit #2 : [FEAT/booking] Replace BookingSidebar with BokunWidget on tour pages
14. Remplacer HomeBookingForm sur /
15. Commit #3 : [FEAT/booking] Replace HomeBookingForm with Bókun CTA
16. Supprimer fichiers orphelins
17. Commit #4 : [CHORE/cleanup] Remove legacy booking code
18. Mettre à jour CLAUDE.md + decisions.md
19. Commit #5 : [DOCS] Log Bókun migration decision
20. Merge feat/bokun-widget → main (ou PR si review requise)
21. Deploy Cloudflare Pages
22. Test production avec vraie CB (1 booking test, puis cancel dans dashboard Bókun)
```

---

*Casa Venturas × Bókun integration plan v1.0 — prêt à exécuter*
