#!/usr/bin/env bash
# Loudness-normalize the mix to -14 LUFS (what TikTok/YouTube/IG target) without re-encoding video.
#   scripts/finalize.sh in.mp4 out.mp4
set -euo pipefail
in="$1"; out="$2"
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$in" | grep -q .; then
  ffmpeg -hide_banner -loglevel error -y -i "$in" -c:v copy \
    -af "loudnorm=I=-14:TP=-1:LRA=11" -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$out"
else
  ffmpeg -hide_banner -loglevel error -y -i "$in" -c copy -movflags +faststart "$out"
fi
echo "Done: $out ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")s)"
