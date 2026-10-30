#!/bin/bash
# usage: assemble.sh clip.mp4 end-still.png outdir
# Turn to camera (Kling) -> 0.35 s dissolve to the sharp composited still -> hold -> 0.35 s dissolve into the
# same turn played backwards, which ends on the first frame, so the loop has no visible join.
# Kept at Kling's native 24 fps and the reverse at 1x: converting to 30 fps repeated every 4th frame (visible judder).
# The finished loop is rotated to start on the hold, so the poster is the lit end frame.
set -e
CLIP=$1; STILL=$2; OUT=$3; T=$(mktemp -d)
ffmpeg -v error -y -i "$CLIP" -vf "scale=1920:1080:flags=lanczos,fps=24,format=yuv420p" -an "$T/a.mp4"
ffmpeg -v error -y -i "$T/a.mp4" -vf "reverse,fps=24,format=yuv420p" -an "$T/r.mp4"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$T/a.mp4")
ffmpeg -v error -y -i "$T/a.mp4" -frames:v 1 "$T/first.png"
HOLD=2.6
ffmpeg -v error -y -loop 1 -t $HOLD -i "$STILL" -vf "scale=1920:1080:flags=lanczos,fps=24,format=yuv420p" "$T/s.mp4"
O1=$(python3 -c "print(round($D-0.35,3))"); O2=$(python3 -c "print(round($D-0.35+$HOLD-0.35,3))")
ffmpeg -v error -y -i "$T/a.mp4" -i "$T/s.mp4" -i "$T/r.mp4" -filter_complex \
 "[0][1]xfade=transition=fade:duration=0.35:offset=$O1[x];[x][2]xfade=transition=fade:duration=0.35:offset=$O2,format=yuv420p[v]" \
 -map "[v]" -an -c:v libx264 -preset slow -crf 18 "$T/master.mp4"
ENC="-an -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p -movflags +faststart"
ffmpeg -v error -y -i "$T/master.mp4" $ENC "$OUT/handoff-16x9.mp4"
SQ="crop=1080:1080:420:0,scale=900:900:flags=lanczos"
ffmpeg -v error -y -i "$T/master.mp4" -vf "$SQ" $ENC "$OUT/handoff-1x1.mp4"
ffmpeg -v error -y -i "$T/first.png" -q:v 80 "$OUT/handoff-start-16x9.webp"
ffmpeg -v error -y -i "$STILL" -vf "scale=1920:1080:flags=lanczos" -q:v 80 "$OUT/handoff-end-16x9.webp"
ffmpeg -v error -y -i "$T/first.png" -vf "$SQ" -q:v 80 "$OUT/handoff-start-1x1.webp"
ffmpeg -v error -y -i "$STILL" -vf "scale=1920:1080:flags=lanczos,$SQ" -q:v 80 "$OUT/handoff-end-1x1.webp"
cp "$T/master.mp4" "$OUT/handoff-master.mp4"; rm -rf "$T"
ls -la "$OUT"/handoff-*
