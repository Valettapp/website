# Handoff loop ("From the valet's phone to the guest's.")

An 11-second silent loop for the page (after the film, before the guest section). All digital: no paper ticket
anywhere. Remade 30 Oct 2026 after Leon's note ("We don't use tickets… It's all DIGITAL", and new iPhones have
the Dynamic Island).

1. Rendered two real screens at 3x from the built site: the staff ticket (V777, QR, Park car) and the guest page
   (GuestPhone state 1: THE MARQUEE, Defender, plate, Request My Car). Added an iPhone status bar and Dynamic Island
   (54 pt band; white on the dark staff screen, dark on the guest photo).
2. GPT Image 2.5: two graphite iPhones with blank screens on a #F2F2F0 seamless, facing camera (end frame), then the
   same scene with both phones edge-on, screens facing each other (start frame, end frame as reference).
3. `handoff-composite.py`: finds both glass areas, fits each side with a line, perspective-warps the real screens in
   with a bezel inset and a faint sheen. The end frame is the real interface, not generated.
4. Kling 3.0 pro, start + end frame, 5 s, locked camera: both phones turn to face the camera and the screens wake.
5. `handoff-assemble.sh`: 0.35 s dissolve to the sharp composited still (Kling's last frame lines up within 0.05 px),
   2.6 s hold, 0.35 s dissolve into the same turn played backwards at 1.25x, which ends on the first frame, so the
   loop has no join (a straight dissolve back ghosted the phones). 16:9 at 1920x1080; a 1:1 centre crop at 900x900
   for phones (4:5 could not fit both phones without inventing background); no audio track.

Files: public/film/handoff-{16x9,1x1}.mp4 and handoff-{start,end}-{16x9,1x1}.webp. Higgsfield cost: about 41 credits.
Switch: `site.ticketLoop` in src/data/site.ts (off until Leon approves).
