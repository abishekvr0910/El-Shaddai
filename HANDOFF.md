# El Shaddai — Canonical Deploy & Handoff Rules (2026-09-22)

> **READ THIS BEFORE DEPLOYING ANYTHING.** Two production incidents on 2026-09-22
> were caused by deploying raw source to production. Follow this document exactly.

---

## 🚨 RULE ZERO — Where to deploy from

| Folder | Role | Deploy? |
|--------|------|---------|
| `S:\Claude Project\elshaddai-brown\` | **CANONICAL project** | ✅ YES — always deploy from here |
| `S:\Claude Project\El-Shaddai-github\` | GitHub mirror (now buildable) | ⚠️ Only in emergencies — it builds, but canonical lives in elshaddai-brown |
| `S:\Websites\el-shaddai\` | Old static site — DO NOT TOUCH | ❌ Never |

**Never `vercel --prod` from any other folder.** Both folders above are linked to
Vercel project `all-brown-website` (prj_0STiKWETsU5qCZ2U5ZK8dQOYBBrk). A deploy
from a folder without `package.json` + `vite.config.ts` ships RAW UNSTYLED HTML —
this broke prod twice on 2026-09-22.

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
B=https://all-brown-website.vercel.app
curl -s "$B/" | grep -c 'type="module"'        # expect 1
CSS=$(curl -s "$B/" | grep -o -E 'assets/index-[A-Za-z0-9_-]+\.css' | head -1)
echo "$CSS"                                     # expect assets/index-XXXX.css (NOT empty)
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' "$B/$CSS"   # expect 200 text/css
```

If `type="module"` count is 0 or the CSS grep is empty → the site is broken.
Do not walk away. Roll forward: rebuild + redeploy from the canonical folder.

## 📦 What lives where

- `index.html` — the whole site (source of truth for markup + inline styles/config)
- `src/main.css` — Tailwind v4 `@theme` + components + word-reveal animation (built by Vite)
- `src/main.js` — ES module: reveals, word animation, menu filters, language switch, live open/closed status
- `public/` — fonts (woff2 only), assets, manifest.json, robots.txt, sitemap.xml, sw.js
- `vercel.json` — security headers (CSP), deploy `buildCommand`/`outputDirectory`
- `dist/` — build output (never edit; regenerated)

## 🕐 Opening hours (operator-confirmed 2026-09-22)

Mon–Fri 08:30–19:00 · Sat 10:00–17:00 · **Sunday CLOSED**

These are encoded in FIVE places — change all five together:
1. JSON-LD `openingHoursSpecification` (index.html ~line 64)
2. FAQ JSON-LD answer (index.html ~line 941)
3. Location card hours block (index.html ~line 2010)
4. Footer "Katowice Service Hours" (index.html ~line 2372)
5. Live status logic in `src/main.js` → `updateWarsawStatus()` (minutes: weekday open 510–1140, Sat 600–1020, Sun closed)

## 📊 Current state (all deployed & verified 2026-09-22 ~12:45)

- Tailwind v4 build-time (CDN removed) — Perf 73 / SEO 100 / A11y 100 / BP 100 mobile
- Framer-style word reveal on h1 + section h2s (`data-words`, split at reveal time)
- WebP hero + srcset; woff2 fonts; canonical tag; contrast fixes
- GA4 gated behind `GA4_MEASUREMENT_ID` (empty = sends nothing; set ID to activate)
- Vercel Analytics: needs ONE click in dashboard (project → Analytics → Enable);
  `trackEvent()` already forwards via `window.va` once enabled
- Domain: `elshaddai.pl` available as of 2026-09-22 (buy via Vercel dashboard; then
  `vercel domains add` + `vercel alias` — see chat with Hermes for exact steps)

## ⚠️ Known follow-ups

1. Enable Vercel Analytics in dashboard (one click, no code)
2. Buy + connect `elshaddai.pl`
3. Custom 404 page (SPA fallback currently serves index.html for all routes)
4. Optional: Google Maps embed in Location section

## 🎯 One-line summary

**Deploy only from `S:\Claude Project\elshaddai-brown`, run the build, verify the
built CSS is served — every deploy, no exceptions.**