# El Shaddai — Canonical Deploy & Handoff Rules (updated 2026-09-23, Hermes)

> **READ THIS BEFORE DEPLOYING ANYTHING.** Two production incidents on 2026-09-22
> were caused by deploying raw source to production. Follow this document exactly.

---

## 🌐 Custom domain (LIVE since 2026-09-23)

**https://www.elshaddaiindiancafe.pl** — the ONLY production URL.
- Apex `elshaddaiindiancafe.pl` 308-redirects to `www.` (Vercel-managed)
- Old `all-brown-website.vercel.app` 308-redirects to the new domain (see vercel.json redirects)
- All absolute URLs (canonical, sitemap, robots, hreflang, OG) use `https://www.elshaddaiindiancafe.pl/`
- Domain bought by client at GoDaddy (NS: domaincontrol.com) — DNS: A @ → 76.76.21.21, CNAME www → cname.vercel-dns.com
- SSL: Let's Encrypt via Vercel, valid to Dec 22 2026, auto-renews. Cert covers www only; apex redirects.
- If the site ever shows a Vercel login page → Deployment Protection got re-enabled →
  set "Vercel Authentication" to Only Preview Deployments (project settings).

## 🚨 RULE ZERO — Where to deploy from

| Folder | Role | Deploy? |
|--------|------|---------|
| `S:\Claude Project\elshaddai-brown\` | **CANONICAL project** | ✅ YES — always deploy from here |
| `S:\Claude Project\El-Shaddai-github\` | GitHub mirror (buildable since 2026-09-22) | ⚠️ Only in emergencies |
| `S:\Websites\el-shaddai\` | Old static site — DO NOT TOUCH | ❌ Never |

**Never `vercel --prod` from any other folder.** Both folders above are linked to
Vercel project `all-brown-website` (prj_0STiKWETsU5qCZ2U5ZK8dQOYBBrk). A deploy
from a folder without `package.json` + `vite.config.ts` ships RAW UNSTYLED HTML —
this broke prod twice on 2026-09-22. The mirror now has a full build pipeline
(package.json, vite.config.ts, src/, public/, vercel.json buildCommand) so even an
accidental deploy from it builds correctly — but canonical remains elshaddai-brown.

## ✅ Correct deploy procedure (from canonical folder ONLY)

```bash
cd "S:\Claude Project\elshaddai-brown"
npm run build          # must print "✓ built" and emit dist/assets/index-*.css + *.js
vercel deploy --prod --yes
```

If `dist/assets/` does not contain `index-*.css` and `index-*.js` after the build,
STOP — the build failed and deploying would ship an unstyled site.

## 🔎 Post-deploy verification (mandatory, takes 60 seconds)

```bash
B=https://www.elshaddaiindiancafe.pl
curl -s "$B/" | grep -c 'type="module"'        # expect 1
CSS=$(curl -s "$B/" | grep -o -E 'assets/index-[A-Za-z0-9_-]+\.css' | head -1)
echo "$CSS"                                     # expect assets/index-XXXX.css (NOT empty)
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' "$B/$CSS"   # expect 200 text/css
```

If `type="module"` count is 0 or the CSS grep is empty → the site is broken.
Do not walk away. Roll forward: rebuild + redeploy from the canonical folder.

## 📦 What lives where

- `index.html` — the whole site (source of truth for markup + inline config)
- `src/main.css` — Tailwind v4 `@theme` + components + word-reveal animation (built by Vite)
- `src/main.js` — ES module: reveals, word animation, menu filters, language switch, live open/closed status
- `public/` — fonts (woff2 only), assets, manifest.json, robots.txt, sitemap.xml, sw.js
- `vercel.json` — security headers (CSP), deploy `buildCommand`/`outputDirectory`, vercel.app→www redirect
- `dist/` — build output (never edit; regenerated)

## 🕐 Opening hours (operator-confirmed 2026-09-22)

Mon–Fri 08:30–19:00 · Sat 10:00–17:00 · **Sunday CLOSED**

Encoded in FIVE places — change all five together:
1. JSON-LD `openingHoursSpecification` (index.html ~line 64)
2. FAQ JSON-LD answer (index.html ~line 941)
3. Location card hours block (index.html ~line 2010)
4. Footer "Katowice Service Hours" (index.html ~line 2372)
5. Live status logic in `src/main.js` → `updateWarsawStatus()` (minutes: weekday open 510–1140, Sat 600–1020, Sun closed)

## 🍽️ MENU (rebuilt 2026-09-23 from client's official PDF "Menu card Final-23.05.2026")

**12 items, exactly as the client's printed menu. Do NOT invent items, names, or descriptions.**

Coffee (6): Filter Coffee · Filter Coffee with Cardamom · Madurai Coffee · Decoction Coffee ·
Narasu's Coffee Filter Coffee · Kumbakonam Degree Coffee
Tea & Chai (6): Herbal/Ayurvedic Indian Tea · Masala Chai · Kashmiri Kahwa · Noon Chai ("Pink Tea") ·
Wayanad Chai · Nilgiri Tea

Client rules (violations already caused one rollback — respect them):
- **NO PRICES on the site.** Client quotes via WhatsApp instead.
- Descriptions = verbatim from client PDF (EN + PL). Do not embellish.
- Filter tabs: All Drinks (11→12) — recount if items change. Tabs live near line ~1190 in index.html.
- Noon Chai card uses `drink-chai-noon.webp` (authentic pink tea photo, Wikimedia CC BY-SA, graded to site palette).
- When client sends real photos of drinks, swap per-card images (all currently generated/stock).

## 📊 Current state (all deployed & verified 2026-09-23)

- LIVE at https://www.elshaddaiindiancafe.pl with SSL (Let's Encrypt, auto-renews)
- Lighthouse: Perf 76 / SEO 100 / A11y 100 / BP 100
- Tailwind v4 build-time (CDN removed); Framer-style word reveal on headings
- WebP hero + srcset; woff2 fonts; canonical tag → www domain; contrast fixes
- Vercel Analytics ENABLED (dashboard toggle done 2026-09-22); script tag live;
  `trackEvent()` forwards WhatsApp/call/directions/menu events via `window.va`
- GA4 gated behind `GA4_MEASUREMENT_ID` in index.html (empty = sends nothing)
- Security audited 2026-09-23: SSL/TLS clean, blacklists clean (Spamhaus/SpamCop),
  no spam keywords, no mixed content, headers present. Re-check reputation ~Oct 23.

## ⚠️ Known follow-ups

1. Google Search Console: verify `https://www.elshaddaiindiancafe.pl` (DNS TXT), submit
   `https://www.elshaddaiindiancafe.pl/sitemap.xml`, request indexing
2. Google Business Profile: set website to the new domain
3. Client to send real photos of drinks → swap card images
4. Custom 404 page (SPA fallback currently serves index.html for all routes)
5. Optional: Google Maps embed in Location section

## 🎯 One-line summary

**Deploy only from `S:\Claude Project\elshaddai-brown`, run the build, verify the
built CSS is served on https://www.elshaddaiindiancafe.pl — every deploy, no
exceptions. The menu is the client's real menu: never add, rename, or price items
yourself.**