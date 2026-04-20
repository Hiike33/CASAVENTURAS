#!/usr/bin/env bash
# Translation contract enforcement (docs/i18n-translation-contract.md).
# Runs on every build to catch contract violations before they ship.
# Exit non-zero on any violation so CI fails the pipeline.

set -euo pipefail

cd "$(dirname "$0")/.."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo "─── Translation contract validation ────────────────────────────"

STATUS=0

# 1. No em-dashes in translated CMS files or messages.
EMDASH_TARGETS=(
  lib/cms/data/tours.es.ts
  lib/cms/data/tours.fr.ts
  lib/cms/data/faqs.es.ts
  lib/cms/data/faqs.fr.ts
  lib/cms/data/guides.es.ts
  lib/cms/data/guides.fr.ts
  lib/cms/data/site-config.es.ts
  lib/cms/data/site-config.fr.ts
  lib/cms/data/reviews.es.ts
  lib/cms/data/reviews.fr.ts
  messages/es.json
  messages/fr.json
)

EMDASH_FAILS=0
for f in "${EMDASH_TARGETS[@]}"; do
  if [[ -f "$f" ]]; then
    count=$(grep -c "—" "$f" 2>/dev/null | head -1 || echo 0)
    count=${count:-0}
    if [[ "${count}" -gt 0 ]] 2>/dev/null; then
      printf "${RED}FAIL${NC}  %-45s %d em-dash(es)\n" "$f" "$count"
      EMDASH_FAILS=$((EMDASH_FAILS + 1))
      STATUS=1
    fi
  fi
done

if [[ "$EMDASH_FAILS" -eq 0 ]]; then
  printf "${GREEN}PASS${NC}  em-dash check: 0 violations across %d files\n" "${#EMDASH_TARGETS[@]}"
else
  printf "${RED}FAIL${NC}  em-dash check: %d file(s) with em-dashes\n" "$EMDASH_FAILS"
fi

# 2. LLM-talk markers (soft warning, not a hard fail — review manually).
LLM_TALK_ES=('sin problemas' 'sin esfuerzo' 'Ya sea' 'Experimente' 'Descubra')
LLM_TALK_FR=('parfaitement' 'harmonieusement' 'sans effort' 'Découvrez' 'Que vous soyez')

WARN_COUNT=0
for pat in "${LLM_TALK_ES[@]}"; do
  if grep -l "$pat" lib/cms/data/*.es.ts messages/es.json 2>/dev/null | head -1 > /dev/null; then
    files=$(grep -l "$pat" lib/cms/data/*.es.ts messages/es.json 2>/dev/null | paste -sd ',' -)
    printf "${YELLOW}WARN${NC}  ES LLM-talk: '%s' in %s\n" "$pat" "$files"
    WARN_COUNT=$((WARN_COUNT + 1))
  fi
done
for pat in "${LLM_TALK_FR[@]}"; do
  if grep -l "$pat" lib/cms/data/*.fr.ts messages/fr.json 2>/dev/null | head -1 > /dev/null; then
    files=$(grep -l "$pat" lib/cms/data/*.fr.ts messages/fr.json 2>/dev/null | paste -sd ',' -)
    printf "${YELLOW}WARN${NC}  FR LLM-talk: '%s' in %s\n" "$pat" "$files"
    WARN_COUNT=$((WARN_COUNT + 1))
  fi
done

if [[ "$WARN_COUNT" -eq 0 ]]; then
  printf "${GREEN}PASS${NC}  LLM-talk markers: 0 hits\n"
fi

# 3. JSON key parity: messages/en.json keys must all exist in es.json and fr.json.
if command -v python3 > /dev/null 2>&1; then
  python3 - <<'PYEOF' || STATUS=$?
import json, sys
def keys_recursive(obj, prefix=''):
  out = set()
  if isinstance(obj, dict):
    for k, v in obj.items():
      p = f"{prefix}.{k}" if prefix else k
      if isinstance(v, dict):
        out.update(keys_recursive(v, p))
      else:
        out.add(p)
  return out
en = json.load(open('messages/en.json'))
es = json.load(open('messages/es.json'))
fr = json.load(open('messages/fr.json'))
en_keys = keys_recursive(en)
missing_es = en_keys - keys_recursive(es)
missing_fr = en_keys - keys_recursive(fr)
if missing_es:
  print(f"\033[0;31mFAIL\033[0m  messages/es.json missing keys: {sorted(missing_es)}")
  sys.exit(2)
if missing_fr:
  print(f"\033[0;31mFAIL\033[0m  messages/fr.json missing keys: {sorted(missing_fr)}")
  sys.exit(2)
print(f"\033[0;32mPASS\033[0m  JSON key parity: en ⊂ es ⊂ fr ({len(en_keys)} keys)")
PYEOF
fi

echo "──────────────────────────────────────────────────────────────"

if [[ "$STATUS" -ne 0 ]]; then
  echo -e "${RED}Contract violations found. Fix before commit.${NC}"
  exit "$STATUS"
fi

echo -e "${GREEN}Translation contract: all checks passed.${NC}"
