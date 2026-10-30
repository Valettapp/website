# Apple Pay loop (spare, not on the site)

A 9-second silent loop of the guest paying by Apple Pay, made 30 Oct 2026 as a Higgsfield version of the guest
demo's new Apple Pay step. Files: `media/applepay/applepay-{16x9,4x3}.mp4`.

1. Screens captured at 3x from the built site (GuestPhone), laid out at the scene phone's exact screen shape
   (width/height 0.416, so nothing is stretched or cropped): Bringing with tip 80, the button pressed, the Apple Pay
   sheet (in, Double-click to pay, Face ID, Done) and Safe travels, with every transition frozen.
2. Kling 3.0 pro, image-to-video from the Request My Car end still (phone + Defender scale model), 5 s, locked
   camera: the Defender's lights switch on and stay on.
3. `applepay-composite.py` lays the real screens onto the phone every frame (white iPhone status bar and Dynamic
   Island over the photo), slides the sheet up and down, and
   offsets the clip so the lights come on as Face ID turns to Done. 0.7 s dissolve back to the start to loop.

To put it on the page: copy the two files to public/film/ as applepay-16x9.mp4 / applepay-4x3.mp4, add posters,
and use <LoopFigure name="applepay" mobile="4x3" />.
