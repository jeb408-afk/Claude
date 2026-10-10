#!/usr/bin/env bash
# Convert an Epidemic Sound effect to wav and give it a short name.
#   scripts/sfx-prep.sh ~/Downloads/ES_Impact.mp3 porzingis impact
set -euo pipefail
in="$1"; proj="$2"; name="$3"; dir="$(dirname "$0")/../public/$proj/sfx"
mkdir -p "$dir"
ffmpeg -hide_banner -loglevel error -y -i "$in" -vn -af "loudnorm=I=-16:TP=-1.5" -ac 2 -ar 48000 "$dir/$name.wav"
echo "SFX: $dir/$name.wav"
