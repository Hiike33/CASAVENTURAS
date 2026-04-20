# Cloudflare Pages Deployment — Casa Venturas

**Target domain**: `casaventuras.com` (registered on Cloudflare Registrar, account `Elie.belkheir@gmail.com`)
**Repo**: https://github.com/VictoHughes/casaventuras
**Stack**: Next.js 14 App Router · Node runtime (API routes use Anthropic + Resend)

---

## Prerequisites

- [x] Domain `casaventuras.com` registered on Cloudflare (done)
- [x] Developer invited as Member with Admin role on the account (done)
- [x] GitHub repo accessible (push latest main before deploy)
- [ ] GitHub account of the client connected to Cloudflare (Step 1 below)
- [ ] Env var secrets ready (Resend, Anthropic, Bókun when available)

---

## Architecture decision — adapter

Next.js 14 App Router with API routes using `fetch()` to external services (Anthropic, Resend) works on Cloudflare via **OpenNext for Cloudflare** (recommended 2026) or the older `@cloudflare/next-on-pages`.

**Chosen**: OpenNext Cloudflare adapter — native Node runtime on Cloudflare Workers, supports all Next.js 14 features including API routes without needing `export const runtime = 'edge'`.

Install (on first deploy, commit this):
```bash
npm install --save-dev @opennextjs/cloudflare
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "build:cf": "npx @opennextjs/cloudflare build",
    "preview:cf": "npx @opennextjs/cloudflare preview",
    "deploy:cf": "npx @opennextjs/cloudflare deploy"
  }
}
```

Add `wrangler.jsonc` at repo root (created by `opennextjs init`).

---

## Deploy procedure — 8 steps (~45 min first time)

### 1. Connect GitHub to Cloudflare Pages

1. Dashboard → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**
2. Authorize Cloudflare on the GitHub account that owns `VictoHughes/casaventuras`
3. Select the repo
4. Production branch: `main`

### 2. Configure build

| Field | Value |
|---|---|
| Framework preset | `Next.js` |
| Build command | `npx @opennextjs/cloudflare build` |
| Build output directory | `.open-next/assets` |
| Root directory | `/` (or `cv-next` if monorepo — here it's fine) |
| Node version | `20` |

Compatibility flags (Settings → Functions → Compatibility flags):
- `nodejs_compat`

### 3. Environment variables (Settings → Environment variables → Production)

```
ANTHROPIC_API_KEY         = sk-ant-...                  [Secret]
RESEND_API_KEY            = re_...                      [Secret]
RESEND_FROM               = hello@casaventuras.com      [Plain text]
NEXT_PUBLIC_SITE_URL      = https://casaventuras.com    [Plain text]

# Bókun (when client provides them — from docs/bokun-setup-client.md)
BOKUN_ACCESS_KEY          = ...                         [Secret]
BOKUN_SECRET_KEY          = ...                         [Secret]
BOKUN_BOOKING_CHANNEL_UUID= ...                         [Plain text]
```

> Mark anything containing `KEY` or `SECRET` as **Secret** (encrypted at rest, not visible in logs).

### 4. First deployment

Click **Save and Deploy**. Build takes ~3-5 min first time. Result: live at `casaventuras.pages.dev` (temporary URL).

Verify at this URL:
- [ ] Home loads, hero video plays
- [ ] `/tours/el-yunque`, `/tours/catamaran`, `/tours/salsa` render
- [ ] `/contact` form submits (sends email via Resend)
- [ ] `/privacy` and `/terms` load
- [ ] ChatWidget (Cavi) responds — confirms Anthropic API works
- [ ] `robots.txt` and `sitemap.xml` accessible
- [ ] No console errors

### 5. Add custom domain `casaventuras.com`

1. In the Pages project → **Custom domains** → **Set up a domain**
2. Enter `casaventuras.com`
3. Cloudflare detects it's on the same account → creates CNAME record automatically
4. Wait ~30 sec for SSL cert issuance
5. Repeat for `www.casaventuras.com` (optional but recommended)

### 6. Redirect `www` → apex (or vice versa — pick one canonical)

**Recommended**: apex `casaventuras.com` is canonical, `www` redirects to it.

Dashboard → `casaventuras.com` zone → **Rules → Redirect Rules → Create rule**
- Name: `www-to-apex`
- If: `Hostname equals "www.casaventuras.com"`
- Then: Dynamic redirect → `concat("https://casaventuras.com", http.request.uri.path)` → 301

### 7. SSL & security baseline

Dashboard → `casaventuras.com` zone:
- **SSL/TLS → Overview**: encryption mode = **Full (strict)**
- **SSL/TLS → Edge Certificates**: Always Use HTTPS = ON
- **SSL/TLS → Edge Certificates**: HSTS = ON (max-age 6 months)
- **Speed → Optimization**: Auto Minify (HTML/CSS/JS) = ON
- **Security → Settings**: Security Level = Medium (default)

### 8. Validate production

```bash
curl -I https://casaventuras.com
# Expected: HTTP/2 200, content-type text/html

curl -I https://www.casaventuras.com
# Expected: HTTP/2 301, location: https://casaventuras.com/

curl -s https://casaventuras.com/robots.txt | head -3
# Expected: User-agent: * / Allow: / / Sitemap: https://casaventuras.com/sitemap.xml

curl -s https://casaventuras.com/sitemap.xml | head -20
# Expected: XML with 6 URLs
```

---

## Post-deploy checklist

### Google Search Console (before any SEO work)

1. Add `casaventuras.com` as a property in Search Console (google.com/search-console)
2. Verify ownership via TXT DNS record (added in Cloudflare DNS automatically if using Cloudflare login verification)
3. Submit sitemap: `https://casaventuras.com/sitemap.xml`
4. Request indexing for the home URL

### Monitoring

- Cloudflare Analytics (Pages project → Analytics) — zero-JS analytics for free
- Workers Logs (Pages project → Functions → Real-time logs) — see API route executions

### When `micasaventuras.com` migrates (future)

Once the client is ready to migrate the old domain:

1. Change nameservers at current registrar of `micasaventuras.com` to Cloudflare's NS (provided by CF when adding the zone)
2. Add `micasaventuras.com` as a zone in the same Cloudflare account
3. Verify MX records for Gmail are imported correctly (aspmx.l.google.com etc.)
4. Create a **Bulk Redirect** (Dashboard → Rules → Redirect Rules → Bulk Redirects):
   - Source: `micasaventuras.com/*`
   - Target: `https://casaventuras.com/$1`
   - Status: 301 permanent
   - Preserve query string + path suffix
5. In Search Console, declare **Change of Address** from `micasaventuras.com` → `casaventuras.com`
6. Update external listings:
   - TripAdvisor business profile
   - Viator supplier profile
   - Bókun company website field
   - Google Business Profile
   - Instagram / Facebook bio
   - YouTube channel description

---

## Rollback

If first deploy breaks or behaves unexpectedly:

1. Dashboard → Pages project → **Deployments** → pick previous deployment → **Rollback**
2. Rollback is instant (no rebuild)

The production URL `casaventuras.com` points to whichever deployment is "Current" — swap it safely.

---

## Cost estimate (Cloudflare Free plan)

For a small-group tour site with ~10 k-100 k visits/month:

| Resource | Free tier limit | Expected usage | Cost |
|---|---|---|---|
| Pages builds | 500/month | ~20-50 | $0 |
| Pages bandwidth | Unlimited | — | $0 |
| Workers invocations | 100 k/day | ~1-5 k/day | $0 |
| DNS queries | Unlimited | — | $0 |
| SSL certificates | Unlimited | 2 (apex + www) | $0 |

**Expected total: $0/month** until traffic explodes or you add D1 / R2 / KV storage.

---

## Support

- Cloudflare status: https://www.cloudflarestatus.com
- Pages docs: https://developers.cloudflare.com/pages/
- OpenNext Cloudflare docs: https://opennext.js.org/cloudflare
