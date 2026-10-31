# Valett launch campaign: "Valet, without the wait."

Instagram (Reels, feed, Stories) and TikTok. Apple-style product ads built only from the real Valett app screens
(no AI scenes): the interface floats in 3D, a slow camera glides over it, short lines of copy fade in, end card.
All videos are 9:16, 1080×1920. Each comes twice: `*-voice.mp4` with the voiceover (post these) and a silent version
(for your own edits). Add a soft instrumental track under the voice in the Instagram or TikTok editor, about 15 % volume.

**Voice:** "Luna" on ElevenLabs v4 via Higgsfield: young American woman, light and warm, natural pacing.
Lines are in `marketing/voiceover/` (one mp3 per line), mixed by `marketing/tools/mix.sh` at -16 LUFS.

## Goal and audience
- **Book demos** at valett.si with Dubai hotel general managers, F&B and rooms directors, mall and residence operators,
  valet operators and developers.
- **Make guests ask for it**: show how easy the guest side is, so guests recognise it and venues hear about it.

## The pieces (in `marketing/reels/`)
| File | Length | What it shows | Pillar |
|---|---|---|---|
| `01-one-tap.mp4` | 14 s | Guest page floats in, the app's four steps appear in a glass bar, the real screen goes Request My Car → Request received → 4 min | Guest |
| `02-one-photo.mp4` | 12 s | Dark. The staff camera reads the plate, make, model and colour | AI / staff |
| `03-one-board.mp4` | 13 s | Dark. The key-controller board tilts in; the overdue request lifts out | Operations |
| `04-tip.mp4` | 13 s | Apple Pay sheet, Face ID in the Dynamic Island, Done | Payments |
| `05-tutorial.mp4` | 30 s | How to get your car with Valett, 7 steps, from the real guest page | Tutorial |

Feed covers (4:5, 1080×1350) are in `marketing/posts/`, one per reel.

## Three-week calendar
Post at 7–8 pm Dubai time (UAE evening scroll). Pin 01, 05 and 03 to the top of the profile.

| Week | Mon | Wed | Fri |
|---|---|---|---|
| 1 | Reel 01 One tap (launch) | Reel 05 Tutorial | Reel 02 One photo |
| 2 | Reel 04 Tip | Carousel: the 7 tutorial steps as slides | Reel 03 One board (operators) |
| 3 | Story series + poll | Reel 01 recut for TikTok | "Book a demo" story with link sticker |

## Captions (brand voice: short sentences, proof, no superlatives)

**01 One tap**
Your car. One tap away.
The valet takes one photo. Your ticket opens on your phone, with your car on it. When you are ready, tap Request My Car and watch it come to the door. No app. No paper. No waiting in the heat.
Valett. Valet, without the wait. Book a demo at valett.si

**02 One photo**
One photo. Plate, make, model and colour.
Valett reads the car the moment the valet frames it, day and night, and rebuilds the plate one to one. Nothing typed at the door. Every car on the record before it moves.
valett.si

**03 One board**
Every car. One board.
From checked in to at the podium, the shift manager sees what is requested, who is on it and what is running late, before the guest notices.
For hotels, malls, restaurants and residences in Dubai. Book a demo at valett.si

**04 Tip**
Tip in two clicks.
Apple Pay and Face ID, right on the ticket. The tip goes to the driver who brought the car. The receipt arrives by text. No cash, no card machine.
valett.si

**05 Tutorial**
How to get your car with Valett, in seven steps.
1 Scan the QR on the valet's phone. 2 Your ticket opens. 3 Tap Request My Car. 4 Leave your number for a text. 5 Watch it come. 6 Tip with Apple Pay. 7 Safe travels.
Save this for your next night out in Dubai.

**Call to action (pick one per post)**
- Book a demo at valett.si (link in bio)
- Comment VALET and we will send you the demo link
- Running a door in Dubai? Send us a message.

**Hashtags (5–8 per post, rotate)**
#Dubai #DubaiHotels #DubaiRestaurants #ValetParking #HospitalityTech #LuxuryHospitality #HotelManagement #UAEStartups #PropTech #DigitalValet

## Stories
- Poll: "How long did you last wait for your car?" Under 5 min / 5 to 15 / Too long.
- Quiz: "What does a valet ticket look like in 2026?" Paper / A text / Your phone. Answer: your phone.
- Behind the scenes: the team at Q East, Al Quoz (real photos only).
- Link sticker to valett.si/#demo, every Friday.

## How the videos are made (re-run any time)
From the repo root, after `npm run build`:
- `node marketing/tools/ad-capture.mjs <tap|photo|board|tip> <frames dir>` records an ad frame by frame from the built site.
- `node marketing/tools/tutorial-capture.mjs <frames dir>` records the tutorial.
- Frames are joined with ffmpeg (H.264, CRF 18, 30 fps); see `marketing/tools/encode.sh`, then `marketing/tools/mix.sh` adds the voice.
Change copy, timing or camera moves in the scene definitions at the top of `ad-capture.mjs`.

## Not used (kept for later)
`marketing/ai-stills/img*.jpg`: AI lifestyle photos made with Higgsfield before the brief moved to app-only ads
(hotel entrance, torn paper ticket, valet with the Defender, key cabinet). About 30 credits. Usable for Stories
or a later "the old way" post.
