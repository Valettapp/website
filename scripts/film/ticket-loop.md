# Ticket loop ("The paper ticket, replaced.")

An 8-second silent loop for the page (after the film, before the guest section). Made 30 Oct 2026.

1. Rendered the real guest ticket screen (GuestPhone state 1) at 3x from the built site.
2. GPT Image 2.5: a generic graphite phone with a blank screen on a #F2F2F0 seamless (end frame), then the same
   scene with the phone side-on and a cream "VALET / V777" paper ticket beside it (start frame).
3. Composited the real screen onto the blank glass with a perspective warp (OpenCV), so the end frame shows the
   actual interface.
4. Kling 3.0 pro, start + end frame, 5 s: the ticket slides into the phone, the phone turns to face camera.
5. ffmpeg: clip, 0.35 s dissolve to the sharp composited still (Kling's last frame lines up within 0.1 px),
   2.2 s hold, 0.7 s dissolve back to the clip's first frame, so the loop is seamless.
   16:9 at 1920x1080 for desktop, a 4:5 crop at 720x900 for phones; no audio track.

Files: public/film/ticket-loop-{16x9,4x5}.mp4 and start/end posters. Higgsfield cost: about 48 credits.
