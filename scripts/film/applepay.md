# Apple Pay loop (spare, for the digital payments section; not on the site yet)

A 9-second silent loop of the guest paying by Apple Pay on the real guest page. Phone only, no car (30 Oct 2026).
Files: `media/applepay/applepay-16x9.mp4` (1600x900) and `applepay-1x1.mp4` (900x900).

1. Screens captured at 3x from the built site (GuestPhone), laid out at the studio phone's exact screen shape
   (width/height 0.416, so nothing is stretched or cropped): Bringing with tip 80, the button pressed, the Apple Pay
   sheet (in, Double-click to pay, Face ID, Done) and Safe travels, with every transition frozen.
2. Background: the studio still from the Request My Car loop with the car painted out, shifted so the phone is
   centred (`media/applepay/phone-only-still.png`). No Kling clip needed.
3. `applepay-composite.py STILL phone-only-still.png out.mp4` lays the screens onto the phone every frame (white
   iPhone status bar and Dynamic Island), slides the sheet up and down, adds a slow 5% push-in, and dissolves back
   to the start to loop. (Run with a Kling clip instead of STILL for the version with the Defender.)

To put it on the page: copy the files to public/film/ as applepay-16x9.mp4 / applepay-1x1.mp4, add start posters,
and use <LoopFigure name="applepay" />.
