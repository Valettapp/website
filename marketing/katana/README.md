# Katana remix: "POV: U never wait for the valet again"

Higgsfield Katana remix of a reference SaaS ad (a phone filming a monitor while a flat UI story plays on it),
rebuilt for Valett on the same beats and timings. Code-drawn (Katana motion-design route), no AI generation, 0 credits.

Story: text "Been waiting 30 min for the valet 🥵" -> "Try Valett" (clicked) -> flash -> VALETT tile -> phone-number input
types -> "Request My Car" -> Requested / On it / Bringing -> "Request received" -> "Your driver is on the way · 4 min"
-> map: the Defender drives to Main entrance -> whip -> notification "Your car is at the door" -> end card.

- `valett-katana-v1.mp4` 1080x1920, 30 fps, 11.5 s, CC0 UI sound effects only (add music in Instagram).
- `index.html` the page Katana renders frame by frame (`page_render.py` in the Higgsfield sandbox, workspace `valett-katana-1101`).
- Higgsfield state archive (to resume or edit): https://d2ol7oe51mr4n9.cloudfront.net/user_3K9DcTdzXRR9L0GzLKKKzs6yK4I/b70cdad7-3722-4a0f-986e-0f0437b78e9f.gz
- Note: the reference recording reports 644 frames in its header but has 616 decodable frames; all 616 were read.
  Katana's proof-of-reading gate compares against 644 and so blocks paid generation; this remix needed none.
