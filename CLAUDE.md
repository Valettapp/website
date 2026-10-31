# Valett website — build brief for Claude Code

You own the repo, framework, components, interactive samples, form, image pipeline, responsive testing, Lighthouse, deployment. Report with screenshots at 1440 and 390 px after every milestone. Source of truth for copy and decisions: `docs/VALETT-WEBSITE-BRIEF.md` (original brief) and this file (approved decisions, 27 Oct 2026). Full annotated copy doc: https://claude.ai/artifact/U6mYTdyjSa2Qtrb1mD1iuh

## Stack
- Astro 5 + Tailwind 4, static output, flat page files. Hosting: GitHub Pages (`.github/workflows/deploy.yml`), domain valett.si, DNS at Hostinger. Cloudflare Pages workflow is parked (manual only) because Cloudflare does not take .si zones yet.
- One long page `/`. Build HTML with `dir`/`lang` attributes and logical CSS properties (margin-inline etc.) so an Arabic RTL version can be added later.
- Form: Formspree (endpoint id supplied by Leon; use `FORMSPREE_ID` env), honeypot + Turnstile. Fields: Name, Venue, Role, Phone, Preferred time. Success text: "Thank you. We will text you to confirm."
- Images AVIF/WebP with srcset. Hero video: poster first, `preload="none"`, lazy-load the mp4 after first paint; 16:9 desktop, 9:16 mobile. Everything below the fold lazy.
- Lighthouse mobile targets: 90+ performance, 100 accessibility, 100 SEO (29 Oct: every page 98–100 on all four, measured with `node scripts/lighthouse.mjs <paths>`; the local server gzips like GitHub Pages). `node scripts/check-links.mjs` after every build: links, anchors, assets, titles ≤ 70, descriptions ≤ 170, one h1, canonicals, alts. OG image, favicon, sitemap, robots, Plausible (loaded after idle).
- SEO: Google Search Console verified 30 Oct as a Domain property via a DNS TXT record at Hostinger (`google-site-verification=…`; keep it, next to the SPF record); home page indexing requested. Bing codes would go in `site.verification`; IndexNow ping runs after each GitHub Pages deploy (key file in `public/`). Structured data graph in `Base.astro`; keyword pages from `src/data/solutions.ts` (one per venue type plus the core term), each with H1, explainer, FAQ and the demo form; FAQ on the home page. Keep the approved voice on these pages: short sentences, proof, no superlatives.
- Respect `prefers-reduced-motion`: every stepper/counter renders its final state, no autoplay video.

## Design system (approved)
White first. Matte glass second. Black is the accent, not the base. One gold.

| Token | Value | Use |
|---|---|---|
| bg | #FFFFFF | Page |
| field | #F2F2F0 | Soft field behind phones (the app's own background) |
| ink | #0A0A0A | Text; also the ONLY black surfaces: primary button, film end card, staff-app screens, footer |
| ink-2 | #666666 | Secondary text |
| ink-3 | #999999 | Captions |
| line | rgba(0,0,0,.08) | 1 px hairlines, card borders |
| glass | rgba(255,255,255,.72), backdrop-blur 20 px, 1 px line, shadow 0 1px 2px rgba(0,0,0,.04) | Sticky nav, floating cards, phone chrome |
| gold | #C5A253 | Status pills, one accent per section, focus ring |
| radius | 12 / 20 / 999 px | Cards / phones+film frame / pills |

Type: Inter (variable) for everything. Wordmark VALETT in a letter-spaced serif (Cormorant Garamond 400, 0.3em tracking) for logo + hero only. Display 96/48 px wt 500 -0.03em; H2 56/36 px wt 500 -0.02em; H3 24/20 px; body 18/17 px lh 1.6; eyebrow 13 px 0.14em uppercase. Section padding 160/96 px. Max text width 36em, page 1280 px. Left-aligned text; centre only the hero and the demo CTA.

Status pills (12 px uppercase): `live` gold text + gold hairline; `in development` ink-2 hairline; `exploring` ink-3 dotted hairline. Every feature on the page carries one.

Do not: full-bleed dark hero, drop shadows heavier than the glass recipe, gradients, illustrations, stock photos. The product screens are the imagery.

Number plates (approved 27 Oct): always the generated vector replicas in `src/assets/plates/*.svg` through `Plate.astro`, never photo crops of plates, anywhere on the site. The only photographed plate is the one inside the Defender photo in the camera feed, where the scan reads it.

## Page structure and copy

### 1 Hero (white)
Eyebrow: Valet management for Dubai's best venues
H1: Valet, without the wait.
Sub: One record of every car, from the first photo to the last text. Built for the venues guests remember.
CTA: Book a demo (black pill) · text link: Watch the film (scrolls to §2)
Film in a 20 px rounded glass frame below the headline, not full-bleed. Until the film exists use `assets/poster-placeholder` (plain #F2F2F0 frame with the VALETT wordmark). Three hairline lines under it: Every car photographed before it moves · Every guest reachable without an app · Every incident traceable.

### 2 Why (white)
H2: The last part of a five-star evening is still run on paper.
Body: A card torn in half. A radio call. A guest standing in 40-degree heat wondering if anyone wrote down their plate. When something goes wrong, nobody can prove what happened, and the hotel pays.
Vision: Valett was built after its founders waited thirty minutes for their car in the Dubai summer and realised the most convenience-focused industry in hospitality had no convenience in it. So we replaced the ticket with a system: a camera at the door, a page on the guest's phone, and a board the whole operation runs on. Every car is documented before it moves, every guest is a text away, and every minute is on the record.
The same film plays here with sound and captions (`<video controls>`), hero plays it muted.

### 3 The guest (white, phone on #F2F2F0 field)
Eyebrow: The guest page · H2: Nothing to download. Nothing to remember.
Body: The valet photographs the car. The guest gets a ticket on their phone from the QR, with their car's photo on it. From then on they can see where it is, ask for it from the table, message the shift manager and tip the driver, in English or Arabic, without creating an account. [live]
**Interactive sample** (component `GuestPhone`): rebuild the real guest page in HTML (reference `assets/screens/guest-*.png` and `assets/recordings/guest-flow.mov`). Venue wordmark on screen: "THE MARQUEE" (fictional; never TEST3). Light UI, car photo header fading to #F2F2F0, serif wordmark, Arabic toggle pill top-right (visual only). Five states, stepped by tapping "Request My Car" or by a 5-dot stepper; deterministic, resettable, labelled "Live sample, demo data":
1. PARKED · 01:06 AM — "Land Rover Defender" — plate chip M 95378 · Ticket V777 — Validation: Ask your server — Details ∨ — black button "Request My Car" — "Show QR" — card "Shift manager · replies in a few minutes · Message"
2. Sheet "Get a text when it's ready" — "We'll text you when your car is on its way and when it's at the door. No account, no spam." — +971 input — "Text me when it's ready" — "Skip, I'll keep this page open"
3. REQUEST RECEIVED — big "5 min" — "Finding your valet, usually under a minute" — track Requested / On it / Bringing / Outside (first segment filled) — "Cancel request"
4. YOUR DRIVER IS BRINGING YOUR CAR — big "4 min" — "Your driver is bringing your car to main entrance" — track with 3 filled — cards "Your driver · to the main entrance · Message", "Shift manager" — TIP 20 / 40 / 80 (AED) — "Pay with Apple Pay" [live]
5. ALL DONE — gold check — "Safe travels" — TIP 80 — "Receipt sent to +971 58 ···· ····" — "How was it today?" five stars — "Send rating" — "Download receipt"
Caption: Private message line to the shift manager, hidden from the driver. Rate, tip and receipt by text. [live]

### 4 The team at the door (white, dark phones)
Eyebrow: The staff app · H2: Forty seconds from arrival to parked. All of it on the record.
Three steps with the real dark screens (reference `assets/screens/staff-*.png`, `assets/recordings/staff-checkin-flow.mov`; wordmark VALETT serif, gold for the "NEW REQUEST · JUST NOW" eyebrow):
- Photograph. One photo reads the plate, make, model and colour. No typing at the door. [live] — screen: camera frame "Take vehicle photo · Frame the number plate", then "Scanning vehicle…"
- Ticket. Code and QR appear instantly: show it, send it by SMS, or print. [live] — screen: "Checked in · 01:06", "V777", QR, Land Rover Defender, White · Dubai, plate DUBAI M 95378, "Park car", "Wrong car? Retake · Send by SMS · Print"
- Park. Zone and bay recorded, keys tracked, damage walkaround with time-stamped photos. [live] — screen: "Where did you park?" P3 / 55 → "Parked · Zone P3 · Bay 55 · Photos saved"
Then: "New request, just now. Land Rover Defender, Zone P3, Bay 55. On my way." The driver taps once and the guest's page moves. [live] — screen: dark, "NEW REQUEST · JUST NOW", "Land Rover Defender", plate, PARKED Zone P3 · Bay 55, white button "On my way".
**Interactive sample** `KeyBoard`: key-controller board, 6 demo tickets sorted by promised time (V771–V777, mixed makes), columns Ticket · Car · Zone/Bay · Status · Due. A timer runs; one request passes its target, its row turns gold and a "Shift manager pinged" toast appears. Reset button. Label "Live sample, demo data". [live]

### 5 The back office (white)
Eyebrow: Back office · H2: Run one door or forty from the same screen.
Gallery of 8 tiles (hairline cards, 16:10, placeholder until `Valett_Reports___polish_mockup.pdf` arrives from Leon; then crop one page per tile):
Reports: cars, revenue, wait times and tips per shift, per venue, per driver · Tickets and customers: every visit on one record; VIP tiers that follow the guest · Residents: permanent plans for buildings, with their own rules · Validation: venues stamp the ticket digitally; leakage ends · Incidents and compensation: photos, timestamps, who touched the car, what was paid · Driver performance: speed, ratings and tips, per driver, per shift · Shift manager and cash variances: who was on, what came in, what is missing · Network overview: every venue on one map for operators and groups. All [live].

### 6 Money (white)
H2: Where the savings come from. No figures.
Staff time — No tickets to write, no radios to call, no bays to search. The board tells the driver where the car is. · Damage disputes — Time-stamped photos at check-in and check-out settle the argument before it starts. · Lost tickets — The ticket is on the guest's phone and in the system. It cannot be lost. · Validation leakage — Every validation is a scan, logged against a venue and a ticket. · Tips — Guests tip on the receipt, digitally, and the operation sees who earned what. · Reputation — The wait is the last thing a guest remembers. Now it is a text.

### 7 Integrations and partners (white)
H2: Built to plug into the venue.
Fully digital system [live] · AI scanning technology [live] · Online card payments, Apple Pay and digital tipping [live] · Hotel PMS [live] · Crypto payments [live] · Car care while parked (cleaning, fuel) [live] · Parking and barrier systems [in development] · Salik and Dubai payments [exploring] (statuses updated by Leon 30 Oct). No partner names until Leon confirms in writing. 31 Oct, Leon: Hotel systems block under the integrations panel: Oracle OPERA (Cloud) integration plan, four steps (guest profile on the ticket, valet on the room bill, ready at check-out, VIP tiers), pill `in development`, Oracle trademark line; not a partnership claim.

### 8 Technology (white; this and the staff section may use a dark card for the scan animation)
Eyebrow: AI-led from the first line of code · H2: A valet operation that learns.
Body: Valett is an AI company that happens to park cars. Vehicle recognition reads every plate, make, model and colour from one photo. Every venue runs its own white-label brand on the guest page. Every rule, from VIP tiers to validation to residents' plans, is configurable without a developer. We are building the operation that runs itself: predicting demand, assigning drivers, flagging incidents before a guest notices.
Vehicle recognition from one photo [live] · 1:1 plate replica, design and number, day and night [live] (31 Oct, Leon: recognition works day and night and generates a full 1:1 replica of the plate design and number) · White-label branding per venue, English and Arabic [live] · Fully configurable rules, tiers and validation [live] · AI scanning camera on every driver's device [pending Leon: wording] · Demand prediction and automatic driver assignment [in development]
Reuse the scan animation from §4 (camera frame → "Scanning vehicle…" → plate, make, model, colour filling in).

### 9 Who it's for (white)
H2: One system, four kinds of door.
Hotels and resorts — The guest page carries the hotel's name, not ours. Concierge sees every car. · Malls — Thousands of tickets a day, validation by store, no paper to reconcile. · Restaurants — Guests request from the table and walk out to a car at the kerb. · Residences — Residents' permanent plans, visitor tickets, one record per building.

### 10 The plan (white)
Eyebrow: The company · H2: An old service, rebuilt for the AI era.
Story: Valett started as an idea in summer 2025. By winter it was a vetted start-up, and by December 2025 it had raised significant capital. It launches before December 2026 with major luxury hospitality brands in Dubai already signed, and more hotels, residential buildings and developers signing.
Five-year plan: Grow. Capture the Dubai market. Expand across the service side of hospitality: concierge, parking automation and AI.
Founders — Leon Lumley-Savile, co-founder: Real estate and commodity trading, with a network of ultra-high-net-worth clients who trust him to deliver vetted products and deals worldwide. · Tom Beenham, co-founder: Marketing. Built an email-marketing business that generated millions in revenue for top clients, and an online school that has taken students to the top of the industry.
Investors and advisors — Abdulla Al Shaibani: Managing partner of Alphabeta Properties, which he founded in 2016 while at the American University of Sharjah; named among Forbes Middle East's Most Impactful Real Estate Leaders 2025. Developments include C6, M77 and the Q-East mixed-use complex in Al Quoz. Also founder of Axeed and Fanak Auto. · Mo Aziz (updated 30 Oct from Leon): Dubai-based serial technology entrepreneur, first UAE-based founder through Y Combinator (2019); co-founder and co-CEO of Sooner (proptech); co-founded Pluto (YC-backed spend management, exited), Dapi and Airscope; angel investor in fintech and proptech.
Portraits: all four in place (Mo added 30 Oct from a 200 px photo: cropped and sharpened, no AI retouching).

### 11 Book a demo (white, glass card)
H2: See it at your door. Body: Thirty minutes, on a call or at your venue, with the real app in your hands. Button: Book a demo.

### 12 Footer (black)
VALETT serif wordmark · Q East, by Alphabeta / Al Quoz / Dubai, UAE (address 30 Oct) · info@valett.si · Instagram (no LinkedIn; handle pending from Leon, `site.instagram`) · Privacy · © 2026 Valett · Valet, without the wait.

## Product loops and film (30 Oct, live)
- Hero (31 Oct): the pinned scroll story (`HeroStory.astro`, four beats: scan, ticket, request, safe travels) is back by Leon's choice, drawn with the real iPhone bodies (`phone-device`, status bar, Dynamic Island) on every phone. A one-screen fan with a light scroll effect was tried the same day and rejected (in git history as `HeroFan.astro`, commit da43b58). Never size phones with `zoom` (Safari zooms text and boxes differently); use `scale`.
- "How it works" (`HowItWorks.astro`) sits straight after the hero; the hero's second button is "See how it works" (#how).
  01 Handoff: valet's and guest's iPhones turn to camera (`scripts/film/handoff.md`). 02 Request My Car: the Defender render as a scale model drives up while the real screen goes Request My Car → Request received → Bringing (`scripts/film/request.md`).
  03 Tip by Apple Pay: the real Apple Pay sheet, Face ID in the Dynamic Island, then Safe travels (`scripts/film/applepay.md`).
- All three use `LoopFigure.astro`: nothing downloads on page load; the first scroll fetches each loop (one after another, under 1 MB on a phone) into memory as a blob; it is attached with preload auto a screen and a half away and starts playing half a screen before it is in view. Plain white frame (no backdrop blur around video). Kling-based loops stay at native 24 fps (31 Oct: 30 fps conversion repeated every 4th frame and juddered on iPhone). Loop files are rotated to begin on their finished frame, so the poster is never an empty-looking frame. Reduced motion shows the poster only. All digital, never paper tickets; iPhones always show the Dynamic Island and status bar.
- The film is off (`site.film.show = false`): it stalled at 00:00 on Leon's iPhone. Files stay in public/film for when it returns.

## Assets in this folder
- `assets/screens/` five real screenshots (guest 1–3 light, staff 4–5 dark). Rebuild these as HTML components; do not ship the PNGs (they carry iOS chrome and the TEST3 tenant).
- `assets/recordings/` two .mov flows showing every state; use for timing and copy.
- `assets/brand/valett-brand-guidelines.html` colours and logo; only black/white/gold are used. `Valett_App_Design_Showcase.pdf` is concept art, not product: do not use on the site.
- Pending from Leon: logo SVG, reports mockup PDF, founder/investor photos, Formspree id, inbox, the film (Higgsfield, after the site is up).

## Milestones
1. Scaffold, tokens, nav, hero (poster placeholder), §2, §3 with the GuestPhone sample → preview URL + screenshots.
2. §4–§12, form wired, placeholders where assets are pending.
3. KeyBoard sample, scan animation, reduced-motion pass.
4. Lighthouse pass, OG/favicon/sitemap, domain.

## Restore points
- `3ae48b6` (31 Oct): one-screen hero, before the savings rows were collapsed and team bios clamped on phones. To go back: `git revert` the commits after it (keeps history), then push.
