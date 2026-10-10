#!/usr/bin/env bash
# Bring raw phone videos into a project.
#   scripts/phone-import.sh myvideo ~/Downloads/IMG_1234.MOV ~/Downloads/IMG_1235.MOV
# Writes public/<project>/footage/<name>.mp4: 1080x1920, constant 30fps, H.264.
# Phones record variable frame rate HEVC, which drifts out of sync and won't preview in the browser.
# Landscape clips are center-cropped to vertical; use zoom/focus on the clip to reframe.
set -euo pipefail
proj="$1"; shift
dir="$(dirname "$0")/../public/$proj/footage"
mkdir -p "$dir"
for in in "$@"; do
  name="$(basename "${in%.*}")"
  ffmpeg -hide_banner -loglevel error -stats -y -i "$in" \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1" \
    -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p \
    -af "highpass=f=80,aresample=48000" -c:a aac -b:a 192k -ac 2 \
    -movflags +faststart "$dir/$name.mp4"
  echo "Footage: $dir/$name.mp4 ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dir/$name.mp4")s)"
done
echo "Next: npm run transcribe $proj"
