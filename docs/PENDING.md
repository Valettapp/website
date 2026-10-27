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
| Reports mockup PDF | received 27 Oct; §5 uses crops of pages 1, 3, 6, 7, 10, 11, 14, 16, 17, 18 (`src/assets/reports/`). Pages carry tenant names Q East by Alphabeta, AXeed and The Palace Downtown; confirm those may appear | — |
| Mo Aziz photo | `Plan.astro` | Initials circle (Leon, Tom and Abdulla photos received 27 Oct, in `src/assets/team/`) |
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
- Hero is centred, Apple-style: wordmark, pill eyebrow ("Launching in Dubai · 2026"), slogan, one line, two buttons. Below it a large rounded panel with three fanned phones (staff request, guest page, staff ticket) and two matte-glass cards echoing the centre screen; the stage has scroll-driven motion (phone rises and settles, cards parallax, slight tilt on exit) and pointer tilt on desktop (`HeroStage.astro`). Reduced motion renders the composition static. The brief's hero sub-line and three hairline lines are dropped. When `site.film.mp4` is set, the film frame replaces the stage.
- Section padding raised to 112/200 px for more air.
- Poster placeholder (used in §2 until the film exists) is the film's end card: black with the white serif wordmark and the slogan.

- Mockups across the page: key board in browser chrome (§4), eight back-office mini-UIs (§5), a guest receipt (§6), integrations as a settings panel with toggles (§7), white-label venue headers for fictional venues The Marquee, Arcadia Mall, Maison Lune, One Marina (§9). All demo data.

- Polish pass (27 Oct): single wordmark in the nav only; §2 film placeholder is a slim 21:9 "The film · coming soon" strip (poster image only renders once the film exists); eyebrows on Money and Who it's for; static mockups labelled "Demo data"; staff steps, back-office tiles and venue cards are swipeable snap rows on mobile; sections fade up on scroll (JS-only, off under reduced motion); glass mobile menu in the nav.

- Plate recognition block in §8 with four HTML demo plates (Dubai, Abu Dhabi, Sharjah, Fujairah formats) and the recognition output; claim "reads plates across emirates, day and night" needs Leon's tick.
- §10 is now a team section: three divisions (founders, investors and advisors, product and AI engineering with "profiles to follow"), founder and investor profile cards. Leon is co-founder and CEO with his own wording (27 Oct); Tom is co-founder, CTO and head of technology. Engineering team profiles still to come.

- Hosted preview (27 Oct): https://claude.ai/artifact/WX3Sz7QCSdS99GVor4QvfV, built with `npm run preview:bundle`. Private until shared from the page.

## Copy added outside the brief

- Key board intro (§4): "Every ticket, every promise, on one board. When a request runs late, the shift manager knows before the guest does."
- Technology card caption: "One photo. Plate, make, model and colour, in under a second."
- 404 page and privacy notice copy.
