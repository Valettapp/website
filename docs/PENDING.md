# Pending from Leon

Items the site needs before launch, in the order they block work. Each has a placeholder in place today.

| Item | Where it lands | Placeholder today |
|---|---|---|
| Formspree form id | `FORMSPREE_ID` env var on Vercel | Form renders; submit shows "The form is not connected yet" |
| Cloudflare Turnstile site key | `PUBLIC_TURNSTILE_SITE_KEY` env var (optional; honeypot is always on) | No widget rendered |
| Demo inbox / contact email | `src/data/site.ts` → `email` | hello@valettuae.com |
| LinkedIn URL | `src/data/site.ts` → `linkedin` | linkedin.com/company/valett |
| The film (16:9 + 9:16 cuts, captions .vtt) | `public/film/`, then `src/data/site.ts` → `film` | Poster placeholder (#F2F2F0 frame with the wordmark) in hero and §2 |
| Logo SVG | `public/favicon.svg`, `Wordmark.astro` | Serif VALETT wordmark set live in Cormorant Garamond; geometric V favicon. Drop the official SVG in when it exists |
| Reports mockup PDF (`Valett_Reports___polish_mockup.pdf`) | §5 tiles, one page per tile | Hairline report skeletons labelled "Preview pending" |
| Founder and investor photos | `Plan.astro` | Initials on #F2F2F0 circles |
| Wording for "AI scanning camera on every driver's device" | `Technology.astro` | Shown as written, pill `live` |
| Partner names (PMS, barrier systems, car care) | `Integrations.astro` | Generic names, statuses from the brief |
| Privacy policy text | `src/pages/privacy.astro` | Short honest notice marked as placeholder |
| Domain DNS for valettuae.com | Vercel project settings | — |

## Notes on the uploaded media (26 Oct)

- `Cinematic-hospitality-film-dusk-warm-e.mp4` (10 s) and `result-f5981bbd….mp4` (15 s, "Valett. × Bvlgari" end card) both contain Bvlgari Resort Dubai footage and signage. The Milestone 1 plan retires the Bvlgari clips and generates the film new, so neither is shipped. Either can be wired in with one change to `site.film` if that decision changes.
- `IMG_0405.mov` is the staff ticket-screen recording (light theme). The site keeps the dark staff screens per the brief.
- The guest-page car photo and the staff-screen Defender cutout are cropped from the real screenshots (no iOS chrome, no TEST3 wordmark).

## Decisions since the brief (26 Oct, from Leon)

- Logo stays the serif VALETT wordmark (Leon's call after seeing both). `Wordmark.astro` keeps a `variant="brand"` that renders the brand-file "Valett." if ever needed.
- Slogan "A new era for a timeless service." sits under the logo in the hero and replaces "Valet, without the wait." in the title, OG image and footer line. The old line is one edit in `src/data/site.ts` if wanted back.
- Type is Geist (variable) instead of Inter, heavier and tighter at display sizes; the serif wordmark is unchanged.
- Hero is left-aligned: small wordmark, slogan as the headline, sub-line, CTAs; the right column is the live guest sample cycling through its five states until tapped, with floating matte-glass cards (`HeroScreens.astro`). When `site.film.mp4` is set, the film frame takes that place automatically and the hero re-centres.
- Section padding raised to 112/200 px for more air.
- Poster placeholder (used in §2 until the film exists) is the film's end card: black with the white serif wordmark and the slogan.

## Copy added outside the brief

- Key board intro (§4): "Every ticket, every promise, on one board. When a request runs late, the shift manager knows before the guest does."
- Technology card caption: "One photo. Plate, make, model and colour, in under a second."
- 404 page and privacy notice copy.
