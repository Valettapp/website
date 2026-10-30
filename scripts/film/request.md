# Request My Car loop (guest section)

A 9-second silent loop under the guest-page sample. Made 30 Oct 2026 with Leon's Defender render (the "3D car"
sent on 27 Oct, the same image behind car-photo/car-guest/car-scan).

1. GPT Image 2.5: one graphite iPhone (blank screen) and a scale model of that exact Defender (M 95378) on the
   #F2F2F0 seamless, references: the Defender render and the handoff phone still (end frame).
2. Start frame made locally: the car painted out with a smooth fit of the studio background, so the phone is
   pixel-identical to the end frame.
3. Kling 3.0 pro, start + end frame, 5 s, locked camera: the car drives in from the right and stops by the phone.
4. `request-composite.py`: cleans Kling's background drift away from the car, then lays the real guest screens
   (status bar + Dynamic Island) onto the phone on every frame: Request My Car, a tap, Request received (5 min),
   then Your driver is bringing your car (4 min) as the car enters; 2.6 s hold; 0.7 s dissolve back to the start.
5. 16:9 at 1920x1080; a 4:3 crop (960x720) for phones, since phone and car are too far apart for a square.

Files: public/film/request-{16x9,4x3}.mp4 and request-{start,end}-{16x9,4x3}.webp.
Switch: `site.requestLoop` in src/data/site.ts. Higgsfield cost: about 45 credits.
