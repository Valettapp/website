#!/bin/bash
# Lay the voiceover (marketing/voiceover/*.mp3, ElevenLabs v4, voice "Luna") onto the reels at fixed times,
# hold the end card a little longer so the last line finishes, and normalise to -16 LUFS for Instagram/TikTok.
# usage: bash marketing/tools/mix.sh   (from the repo root, after encode.sh)
set -e
V=marketing/voiceover; R=marketing/reels
mix() { # $1 video in, $2 video out, $3 pad seconds, then pairs: line start
  local in=$1 out=$2 pad=$3; shift 3
  local args=() f="" n=0 labels=""
  while [ $# -gt 0 ]; do
    args+=(-i "$V/$1.mp3"); n=$((n+1))
    local ms=$(python3 -c "print(int($2*1000))")
    f+="[$n:a]aresample=48000,adelay=${ms}|${ms}[a$n];"; labels+="[a$n]"; shift 2
  done
  ffmpeg -nostdin -v error -y -i "$in" "${args[@]}" -filter_complex \
    "[0:v]tpad=stop_mode=clone:stop_duration=${pad}[v];${f}${labels}amix=inputs=$n:normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]" \
    -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$out"
}
mix $R/01-one-tap.mp4   $R/01-one-tap-voice.mp4   1.7 a1 2.8 a1b 5.9 end 12.4
mix $R/02-one-photo.mp4 $R/02-one-photo-voice.mp4 1.6 a2 0.9 a2b 2.1 end 10.4
mix $R/03-one-board.mp4 $R/03-one-board-voice.mp4 1.6 a3 1.0 a3b 4.6 end 10.9
mix $R/04-tip.mp4       $R/04-tip-voice.mp4       1.6 a4 0.9 a4b 4.9 end 11.3
mix $R/05-tutorial.mp4  $R/05-tutorial-voice.mp4  1.6 t1 0.5 t2 3.4 t3 7.7 t4 11.2 t5 14.7 t6 17.8 t7 24.7 end 28.3
ls -la $R/*-voice.mp4
