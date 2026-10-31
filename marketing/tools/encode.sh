#!/bin/bash
# Join captured frames into the final reels and 4:5 feed covers.
# usage: bash marketing/tools/encode.sh   (from the repo root, after the captures)
set -e
R=marketing/raw; OUT=marketing/reels; P=marketing/posts
mkdir -p "$OUT" "$P"
enc() { ffmpeg -v error -y -framerate 30 -i "$1/f%04d.png" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -an "$2"; }
enc $R/ad-tap    $OUT/01-one-tap.mp4
enc $R/ad-photo  $OUT/02-one-photo.mp4
enc $R/ad-board  $OUT/03-one-board.mp4
enc $R/ad-tip    $OUT/04-tip.mp4
enc $R/tutorial-frames $OUT/05-tutorial.mp4
# Feed covers: a 4:5 crop (headline + product) from a settled frame of each reel
cover() { ffmpeg -v error -y -i "$1" -vf "crop=1080:1350:0:$3" -frames:v 1 "$2"; }
cover $R/ad-tap/f0300.png    $P/01-one-tap.png 190
cover $R/ad-photo/f0270.png  $P/02-one-photo.png 190
cover $R/ad-board/f0270.png  $P/03-one-board.png 190
cover $R/ad-tip/f0240.png    $P/04-tip.png 190
cover $R/tutorial-frames/f0150.png $P/05-tutorial.png 60
ls -la "$OUT" "$P"
