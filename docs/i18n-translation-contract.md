# CCS + METACERTIF — Contrat de traduction i18n Casa Venturas

**Version** : 1.0 · **Date** : 2026-04-20 · **Scope** : EN (source) → ES + FR
**Binding** : tout agent (humain, LLM, subagent) qui produit du contenu traduit doit respecter ce contrat. L'opérateur (Claude Code principal) est également lié.
**Source de vérité** : ce fichier. Tout conflit avec d'autres docs se résout en faveur de ce contrat.

---

## 1. PRÉMISSES (CCS — Axe S)

### 1.1 Faits sourcés
- EN est la langue source (layout.tsx:33 `lang="en"`, CMS data en EN uniquement)
- Cible Phase 1 : EN (default) + ES + FR avec URLs `/` · `/es/*` · `/fr/*`
- Volume traduit cartographié : ~11,600 mots par langue cible
- Audience cible ES : touristes Latino-US (Floride, NY, TX) + locaux PR
- Audience cible FR : touristes francophones (France, Québec, Belgique, Suisse)
- Contraintes style strictes : aucun em-dash `—`, aucun "LLM talk"

### 1.2 Lacunes (à combler)
- Politique exacte du client sur passages sensibles (tipping %, accessibility claims par tour, alcohol minors) : à valider avec Elie post-traduction
- Qualité finale ES/FR : dépend de la revue humaine

### 1.3 Hypothèses `[HYP]`
- `[HYP-1]` Elie est bilingue FR et peut valider les passages FR sensibles en 1 journée async
- `[HYP-2]` Elie parle/lit ES ou a accès à un speaker ES pour valider ES
- `[HYP-3]` Claude Sonnet 4.6 produit une traduction EN→ES et EN→FR de qualité "bon premier jet" sur du contenu descriptif touristique

---

## 2. RÈGLES DE TRADUCTION (contrat style)

### 2.1 Interdits absolus (bloquants — CI check automatique)

| Interdit | Raison | Check automatisé |
|---|---|---|
| Em-dashes `—` | Signature typographique LLM détectée par Originality.ai, GPTZero | `rg '—' messages/ lib/cms/data/ app/` → 0 hits |
| Em-dashes alternatifs `–` `‒` | Même problème | `rg '–\|‒'` → 0 hits |
| Triple-point stylisé `…` dans contenu long | Pas naturel FR/ES | `rg '…'` → seulement dans composants UI (loading states) |

### 2.2 Adverbes/tournures robotiques (interdits pondérés — revue manuelle)

**EN (source) — signaux à surveiller** :
- "seamlessly", "effortlessly", "state-of-the-art", "cutting-edge"
- "Whether you're X or Y", "It's not just X, it's Y"
- "Experience the X", "Discover the Y" (en ouverture de phrase)

**ES — interdits de traduction** :
- "sin problemas" comme rendu de "seamlessly" → préférer "de forma natural", "directamente"
- "sin esfuerzo" comme rendu de "effortlessly" → préférer "fácilmente"
- "Ya sea X o Y" → préférer "Tanto X como Y"
- "No es solo X, es Y" → reformuler la phrase entière
- "Experimente X" en ouverture → remplacer par l'impératif direct ("Vive X")

**FR — interdits de traduction** :
- "parfaitement", "harmonieusement", "sans effort" comme rendu de "seamlessly/effortlessly" → préférer "naturellement", "simplement", "directement"
- "Que vous soyez X ou Y" → préférer "Pour X comme pour Y"
- "Ce n'est pas juste X, c'est Y" → reformuler la phrase entière
- "Découvrez X" en ouverture systématique → varier les verbes d'action
- "De pointe", "dernière génération" si pas critique → supprimer

### 2.3 Règles positives (obligatoires)

**Voix et ton** :
- Phrases courtes (< 20 mots moyenne)
- Contractions humaines :
  - FR : "c'est", "on" préférés à "il est", "nous" (sauf contexte formel)
  - ES : "tú" pour Puerto Rico (pas "usted" qui est trop formel pour tourism)
- Impératif positif pour CTAs :
  - "Réservez maintenant" pas "Vous pouvez réserver maintenant"
  - "Reserva ahora" pas "Puedes reservar ahora"

**Références locales** :
- FR : "au coeur de San Juan", "dans la forêt d'El Yunque"
- ES : "en el corazón de San Juan", "en el bosque nacional El Yunque"
- Conserver noms propres : El Yunque, Casa Santurce, Punta Arena, Palmas del Mar, Humacao, Vieques
- Anglicismes tech acceptés : "WhatsApp", "email" (plutôt que "courriel"), "Uber"

**Format** :
- Prix : `$89` (USD universel, ne pas convertir)
- Téléphone : `+1 929 372 4529` tel quel
- Dates : `6 PM` → FR `18h` · ES `6 PM` (PR utilise format US)
- Heures : `7:00 AM – 8:00 PM AST` → FR `7h00 – 20h00 AST` · ES garder format US

**Noms propres** :
- "Casa Venturas" jamais traduit
- Guides : "Eliu", "Juelz", "Paul", "Catherine 'La Taína'", "Justice", "Rodriguez", "Kendra", "Zoe" → noms conservés
- "rainforest" → FR "forêt tropicale" · ES "bosque tropical"
- "catamaran" → FR "catamaran" · ES "catamarán"
- "waterslide" → FR "toboggan naturel" · ES "tobogán natural"
- "cliff jumps" → FR "sauts de falaise" · ES "saltos desde acantilados"

### 2.4 Gestion des interpolations

Les strings ICU (next-intl) utilisent `{placeholder}` :
- EN source : `"from {price} per person"` → ne traduit que le texte
- FR : `"à partir de {price} par personne"`
- ES : `"desde {price} por persona"`

**Interdit** : modifier le nom du placeholder (`{price}` reste `{price}`).
**Interdit** : ajouter ou retirer des placeholders.

---

## 3. TRACE (CCS — Axe R · workflow de traduction)

### 3.1 Pipeline EN → ES ou EN → FR

```
INPUT           : fichier source EN (ex: messages/en.json)
     │
     ▼
Étape 1 : Agent LLM (Claude Sonnet 4.6) reçoit :
          - Le fichier EN à traduire
          - Ce contrat en contexte
          - Target locale (es | fr)
     │
     ▼
Étape 2 : Agent produit fichier traduit draft
          - Respecte interdits 2.1 (em-dashes)
          - Respecte règles 2.3 (voix, format)
          - Conserve interpolations 2.4
          - Self-check : rapport de conformité inclus
     │
     ▼
Étape 3 : Validation automatique (scripts/validate-translations.sh)
          - rg '—' → FAIL si hits
          - rg adverbes-blacklist → WARN si hits (revue humaine)
          - JSON keys parity : assert en.json ⊂ es.json ⊂ fr.json
          - ICU placeholders préservés : assert count({..}) egal
     │
     ▼
Étape 4 : Revue humaine ciblée (Elie)
          - Passages sensibles flagged :
            · Tipping (montants, obligation)
            · Safety claims (kids, seniors, accessibility)
            · Legal (privacy, terms, cookies)
            · Alcohol + minors (CAT-alcohol-minors)
          - Spot-check aléatoire 10 strings par locale
     │
     ▼
Étape 5 : Commit atomique par locale
          [i18n/es] Translations for ES locale — Phase 1 content
          [i18n/fr] Translations for FR locale — Phase 1 content
     │
     ▼
OUTPUT          : locale déployable en prod avec fallback EN
```

### 3.2 Maillons faibles identifiés

| Maillon | Risque | Mitigation |
|---|---|---|
| LLM hallucinations | Ajoute un fait inventé lors de la reformulation | Check automatisé que chaque prix/nombre en sortie == valeur en entrée |
| FAQ id drift | Traducteur renomme un id par erreur | Test structurel : `faqById[id]` existe dans toutes locales |
| Interpolation cassée | `{price}` devient `{precio}` | Regex parity check : count et noms des placeholders identiques |
| Revue humaine oubliée | On déploie sans validation Elie | Gate de déploiement manuel : push uniquement après ✅ Elie |

---

## 4. CONCLUSION (CCS — Axe V · post-traduction)

### 4.1 Critères d'acceptation (tous obligatoires)

Pour déclarer une locale "prête à déployer" :

- [ ] **A1.** Zéro em-dash dans tous les fichiers de cette locale (`rg '—'` = 0 hits)
- [ ] **A2.** Zéro adverbe robotique interdit (blacklist 2.2) en usage direct
- [ ] **A3.** Parity JSON keys : `Object.keys(en) === Object.keys(es)` et `... === Object.keys(fr)`
- [ ] **A4.** Parity CMS : chaque entry tours/faqs/reviews a une version par locale (ou fallback documenté)
- [ ] **A5.** Interpolations ICU préservées (`scripts/check-icu-parity.sh` passe)
- [ ] **A6.** `npm run build` passe sans warning i18n
- [ ] **A7.** Playwright E2E : page d'accueil par locale renvoie 200 + `<html lang>` correct
- [ ] **A8.** JSON-LD FAQPage par locale valide (Google Rich Results Test)
- [ ] **A9.** hreflang cross-linked dans `<head>` (EN ↔ ES ↔ FR ↔ x-default)
- [ ] **A10.** Revue humaine Elie : passages sensibles validés ✅ (tipping + safety + legal + alcool)
- [ ] **A11.** Spot check 10 strings random par locale : 0 LLM-talk détecté

### 4.2 Degré de confiance

| Axe | Score cible post-contrat |
|---|---|
| S (Sources) | FORT — contenu basé sur faqs.ts + tours.ts traduits (D-005) |
| R (Réalité) | FORT — vérifié en prod via Playwright + Rich Results |
| V (Vérification) | FORT — 11 critères A1-A11, 7 automatisés |

### 4.3 Ce qui invaliderait le livrable

- Un visiteur FR/ES détecte un em-dash en prod → rollback locale
- Google Search Console signale un conflit hreflang → fix immédiat
- Elie flag un passage factuel incorrect (ex: tipping % faux pour son business) → correction + redeploy
- Traffic < 2% sur une locale après 60 jours → désactivation de cette locale

---

## 5. INSTRUCTIONS OPÉRATEUR (Claude Code + agents déployés)

### 5.1 Pour les subagents de traduction

Brief prompt template :

```
Tu es un traducteur professionnel EN → {ES|FR} spécialisé dans le tourisme.
Tu traduis pour Casa Venturas, une société de tours à Puerto Rico.

CONTRAT CONTRAIGNANT (docs/i18n-translation-contract.md) :
- AUCUN em-dash — dans ta sortie
- AUCUN adverbe robotique (liste en 2.2 du contrat)
- Voix directe, contractions humaines (FR: c'est, on · ES: tú)
- Prix, téléphones, noms propres conservés à l'identique
- Interpolations ICU `{placeholder}` préservées exactement

TÂCHE : traduire le fichier {path} de EN vers {locale}
SORTIE : fichier traduit + self-check report :
  - count em-dashes : 0 (obligatoire)
  - count adverbes blacklist : 0 (obligatoire)
  - count placeholders vs source : identique (obligatoire)
  - 3 phrases random retraduites en EN pour vérif sémantique

Si une contrainte est impossible à respecter → signale-le, ne contourne pas.
```

### 5.2 Pour Claude Code principal (moi-même)

Je m'engage sur ce contrat :

- **Avant** toute traduction : charger ce contrat en contexte, relire 2.1-2.4
- **Pendant** : quand je génère ou édite un string, vérifier mentalement les interdits 2.1-2.2
- **Après** : exécuter `scripts/validate-translations.sh` avant tout commit i18n
- **Auto-diagnostic CCS** sur chaque commit : S ≥ MOYEN, R ≥ MOYEN, V = FORT avant push
- **Refus structuré** : si un élément du contrat ne peut pas être respecté, signaler clairement au lieu de livrer un résultat non-conforme

### 5.3 Escalation

Si l'automatisation détecte une violation :
1. NE PAS commit la traduction
2. Regénérer la section concernée avec contrainte explicite
3. Si 2e échec : demander arbitrage utilisateur

Si la revue humaine Elie remonte un problème :
1. Corriger la section concernée
2. Documenter la correction dans commit message
3. Mettre à jour la blacklist si c'est un nouveau pattern récurrent

---

## 6. APPENDICE — Exemples AVANT/APRÈS validés

### 6.1 Em-dashes retirés

| AVANT (EN source avec em-dash) | APRÈS FR | APRÈS ES |
|---|---|---|
| "Yes — tourist areas are safe." | "Oui, les zones touristiques sont sûres." | "Sí, las zonas turísticas son seguras." |
| "Small groups — we cap at 13." | "Petits groupes : maximum 13 personnes." | "Grupos pequeños: máximo 13 personas." |
| "It's our home — not a Disney ride." | "C'est notre terre, pas un parc Disney." | "Es nuestra tierra, no un parque Disney." |

### 6.2 Adverbes robotiques évités

| AVANT (version robot) | APRÈS (version humain) |
|---|---|
| FR "Les guides vous accompagnent harmonieusement" | "Les guides vous accompagnent du début à la fin" |
| FR "Découvrez parfaitement El Yunque" | "Plongez dans El Yunque" |
| ES "Disfruta sin problemas de la experiencia" | "Disfruta la experiencia de principio a fin" |
| ES "Vive sin esfuerzo el atardecer" | "Vive el atardecer a tu ritmo" |

### 6.3 Impératifs positifs

| AVANT (hésitant) | APRÈS (direct) |
|---|---|
| FR "Vous pouvez réserver maintenant" | "Réservez maintenant" |
| FR "Si vous le souhaitez, contactez-nous" | "Contactez-nous" |
| ES "Si te interesa, reserva aquí" | "Reserva aquí" |

---

**Ce contrat est immuable en cours de Phase 1.** Toute modification requiert une nouvelle décision D-XXX dans `decisions.md`.
