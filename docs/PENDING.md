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
- Hero is a pinned, scroll-driven story (`HeroStory.astro`): the section is 3.6 screens tall and the stage holds while scrolling drives one phone through four beats: the staff camera reads the plate from the Defender photo; the guest's ticket appears from the QR; request from the table with the driver on it; safe travels with rating, tip and receipt. Captions and matte-glass cards change per beat. Headline, sub-line and two buttons open the story; "Book a demo" returns on the last beat. No JS or reduced motion renders it as a static page (headline, phone on beat 3, four captions). When `site.film.mp4` is set, the old centred hero with the film frame is used instead.
- Section padding raised to 112/200 px for more air.
- Poster placeholder (used in §2 until the film exists) is the film's end card: black with the white serif wordmark and the slogan.

- Mockups across the page: key board in browser chrome (§4), eight back-office mini-UIs (§5), a guest receipt (§6), integrations as a settings panel with toggles (§7), white-label venue headers for fictional venues The Marquee, Arcadia Mall, Maison Lune, One Marina (§9). All demo data.

- Polish pass (27 Oct): single wordmark in the nav only; §2 film placeholder is a slim 21:9 "The film · coming soon" strip (poster image only renders once the film exists); eyebrows on Money and Who it's for; static mockups labelled "Demo data"; staff steps, back-office tiles and venue cards are swipeable snap rows on mobile; sections fade up on scroll (JS-only, off under reduced motion); glass mobile menu in the nav.

- Plate recognition block in §8 with four HTML demo plates (Dubai, Abu Dhabi, Sharjah, Fujairah formats) and the recognition output; claim "reads plates across emirates, day and night" needs Leon's tick.
- §10 is now a team section: three divisions (founders, investors and advisors, product and AI engineering with "profiles to follow"), founder and investor profile cards. Leon is co-founder and CEO with his own wording (27 Oct); Tom is co-founder, CTO and head of technology. Engineering team profiles still to come.

- Hosted preview (27 Oct): https://claude.ai/artifact/WX3Sz7QCSdS99GVor4QvfV, built with `npm run preview:bundle`. Private until shared from the page.

- Glass pass (27 Oct): ambient blurred tone (`Ambient.astro`, field grey + warm gold tint) sits behind every glass surface so backdrop-blur reads; glass recipe strengthened (white highlight border, inset hairline, saturate); hero stage, guest panel, receipt panel, back-office showcases, venue cards and the demo form are glass panels. Launch pill removed; section padding 128/240 px.

- Key board (27 Oct): the HTML `KeyBoard` sample is no longer rendered; §4 shows the real Key Controller page from the admin mockup, §5's second showcase is the Shift Manager page. `KeyBoard.astro` stays in the repo unused.
- Horizontal overflow on mobile fixed by clipping the page (`overflow-x: clip` on html and body).

- Scan screen (27 Oct): live camera feed on the real Defender (crop of the guest screenshot), plate detection box, then the results sheet. Scroll effects now run on IntersectionObserver so they work inside the preview frame; variants up / scale / left / right with staggered children.

- Plates (27 Oct): `Plate.astro` reproduces the reference set in HTML (Dubai blue/magenta lettering; Abu Dhabi red code block with bilingual stack; Sharjah and Fujairah grey faces with Arabic over Latin). The same component is used on the guest page, staff ticket and request screens, the scan results and the recognition cards.

- Plates are now photographic replicas: Dubai from the Defender photo (M 95378), Sharjah / Abu Dhabi / Fujairah cropped from the reference sheet (the Sharjah reference carries a faint stock-photo watermark; a clean photo would replace it). Scan feed uses the Defender photo, zoomed on the grille.
- New §: AI renders (`Renders.astro`), between Technology and Who it's for. Marked `live` because the staff app shows the render; confirm status and wording.

## Copy added outside the brief

- Key board intro (§4): "Every ticket, every promise, on one board. When a request runs late, the shift manager knows before the guest does."
- Technology card caption: "One photo. Plate, make, model and colour, in under a second."
- 404 page and privacy notice copy.
- Savings (27 Oct, Leon): the receipt mockup is gone. §6 is now a ledger: six rows (staff time, damage disputes, lost tickets, validation leakage, tips, reputation) read across "Today, on paper" / "With Valett" / "What you keep", each tagged Time, Risk, Revenue or Guests. Still no figures; the closing line invites the venue to bring one shift's numbers to the demo.
