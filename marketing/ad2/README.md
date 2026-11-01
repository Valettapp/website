# Valett ad 2: "Snap The Car" (1 Nov)

`valett-ad2.mp4`: 1080x1920, 30 fps, 33.6 s, voiceover. Modelled on Leon's reference reel, a "Verb The Noun"
product ad: only the ad itself was copied, not the monitor or room around it. Black with a warm gold glow
in place of the reference's blue.

Beats: Snap The Car (staff scan reads plate, make, model, colour) -> Send The Ticket (notification drops onto the
guest page) -> Call The Car (a 3D hand taps Request My Car, then "Text me", Request received, 5 min) -> Follow The
Driver (gold rings pulse, 4 min) -> Tip The Driver (hand taps 80 AED and Apple Pay, Face ID, Done) -> VALETT end card.

- Phone screens are the real app, captured live from the built site: `marketing/tools/ad2-capture.mjs`.
- 3D hand and the four icon tiles (car, key, camera, pin): Higgsfield gpt_image_2_5 plus background removal (~6 credits).
- Voice: "Sienna" (ElevenLabs v4, stability 0.3), `marketing/voiceover/ad2/m1-m6.mp3`. Start times: m1 0.4, m2 6.9,
  m3 13.0, m4 18.0, m5 22.9 (first 2.2 s) with its "Done!" moved to 28.65, m6 30.3. Mixed to -14 LUFS stereo.
- No music: add a sound in Instagram or TikTok at about 10-15 %.
