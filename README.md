# Valett website

One long page at valettuae.com. Astro 5 + Tailwind 4, static output, deployed to Vercel.

```
npm install
npm run dev          # local preview
npm run build        # static build → dist/
npm run check        # astro type check
npm run screenshots  # 1440 + 390 px captures → screenshots/ (needs dist/)
npm run lighthouse   # mobile + desktop reports → lighthouse/ (needs dist/)
npm run preview:bundle  # relative-path copy of dist/ for a hosted preview → preview/
node scripts/test-interactions.mjs   # drives the samples headlessly (needs dist/)
node scripts/assets.mjs              # regenerates icons, poster placeholder, OG image
```

Screenshots, Lighthouse and the interaction test use Playwright's Chromium. In the cloud session it is pre-installed; locally run `npm i -D playwright && npx playwright install chromium`.

## Environment

| Variable | Use |
|---|---|
| `FORMSPREE_ID` | Formspree form id for the demo form |
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (optional) |

## Where things live

- `CLAUDE.md` — the build brief and approved decisions (source of truth for copy).
- `docs/PENDING.md` — assets and confirmations still needed, and what stands in for them.
- `src/styles/global.css` — design tokens (`@theme`), type scale, surfaces, pills.
- `src/data/site.ts` — site metadata, contact details, film paths, nav.
- `src/components/` — one component per section; `HeroStory` is the pinned scroll-driven hero; `GuestPhone`, `KeyBoard`, `ScanAnimation` are the interactive samples; `StaffScreen` holds the rebuilt dark screens.
- `src/layouts/Base.astro` — `<head>`: meta, OG, JSON-LD, Plausible.

## Conventions

- Logical CSS properties and `dir`/`lang` on `<html>` so an Arabic RTL version can be added later.
- Every animation has a static end state; `prefers-reduced-motion` renders it immediately and disables autoplay.
- Text greys and the gold pill text are tuned to WCAG AA (4.5:1) on white and on the #F2F2F0 field; hairlines and dots keep the token colours.
