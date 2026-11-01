# Valett ads in the Katana style

## v2 (1 Nov): `valett-ad-v2.mp4`, the one to post
A full-screen ad, 1080x1920, 30 fps, 42.5 s, with voiceover. No screen-in-a-room framing: big type moves
around the real app, captured from the built site (`marketing/tools/katana-ad.mjs`).

Scenes: "Waiting for your car?" with a 30-minute timer and 40°C -> VALETT, "Valet, without the wait." -> staff
camera scan (plate, make, model, colour) -> staff ticket V777 next to the guest's ticket (no app, no paper, no
account) -> Request My Car -> text-me sheet -> Request received, 5 min -> driver bringing it, 4 min, with an SMS
toast -> tip 80 AED, Apple Pay with Face ID -> Safe travels -> end card with "Book a demo" and valett.si.

Voice: "Sienna" (ElevenLabs v4, stability 0.3 for a livelier read), lines in `marketing/voiceover/ad/k1-k9.mp3`,
-14 LUFS stereo. No music: Higgsfield's only music model is reserved for its game pipeline, so add a sound in
Instagram or TikTok at about 10-15 % volume.
Rebuild: `npm run build`, `node marketing/tools/katana-ad.mjs marketing/raw/katana-v2`, then the ffmpeg encode and
mix (voice start times: k1 0.3, k2 5.4, k3 9.4, k4 15.6, k5 20.2, k6 26.0, k7 29.6, k8 35.8, k9 38.8).

## v1 (31 Oct): `valett-katana-v1.mp4`
Katana remix of a reference SaaS ad (a phone filming a monitor while a flat UI story plays on it), 11.5 s,
code-drawn in `index.html` (Higgsfield sandbox workspace `valett-katana-1101`, state archive
https://d2ol7oe51mr4n9.cloudfront.net/user_3K9DcTdzXRR9L0GzLKKKzs6yK4I/b70cdad7-3722-4a0f-986e-0f0437b78e9f.gz).
Replaced by v2 on Leon's feedback: too fast, should not mimic a screen.
