# Apple Pay loop (spare, for the digital payments section; not on the site yet)

A 9-second silent loop of the guest paying by Apple Pay on the real guest page. Phone only, no car (30 Oct 2026).
Files: `media/applepay/applepay-16x9.mp4` (1600x900) and `applepay-1x1.mp4` (900x900).

1. The guest page's own Apple Pay animation, captured frame by frame at 30 fps (284 frames, 3x) from the built site:
   every CSS animation inside the phone is paused and stepped to each frame's time through the Web Animations API,
   with the phases on the same clock as GuestPhone's pay() (press, sheet springs up, Double Click to Pay, Face ID,
   Processing, Done, sheet away, Safe travels). Laid out at the studio phone's exact screen shape (0.416).
2. Background: the studio still from the Request My Car loop with the car painted out, shifted so the phone is
   centred (`media/applepay/phone-only-still.png`). No Kling clip needed.
3. `applepay-composite.py STILL phone-only-still.png out.mp4 <frames folder>` lays the frames onto the phone every frame (white
   iPhone status bar and Dynamic Island), adds a slow 5% push-in, and dissolves back
   to the start to loop. (Run with a Kling clip instead of STILL for the version with the Defender.)

To put it on the page: copy the files to public/film/ as applepay-16x9.mp4 / applepay-1x1.mp4, add start posters,
and use <LoopFigure name="applepay" />.
