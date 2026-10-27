# The film

One story film, about 55 s, generated new in Kling 3.0 (Higgsfield) from three establishing stills,
with the real product UI composited in HTML. No stock, no real venue signage.

- `render-overlays.mjs <outdir>` — renders the phone panels (real guest and staff screens from the
  built site), the captions and the end card as PNGs. Needs `dist/` built.
- `assemble.mjs <workdir>` — expects `<workdir>/clips/shot01..shot10.mp4` and `<workdir>/overlays/`;
  writes `<workdir>/out/valett-film-16x9.mp4` and `valett-film-9x16.mp4` (panels slide in, captions,
  0.5 s crossfades, end card, loudness-normalised ambience).

Shot list, stills and prompts: `docs/PENDING.md` and the Milestone 1 film plan.
