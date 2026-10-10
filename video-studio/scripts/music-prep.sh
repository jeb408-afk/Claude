#!/usr/bin/env bash
# Prepare an Epidemic Sound download as the project's music bed.
#   scripts/music-prep.sh ~/Downloads/ES_Track.wav porzingis [start_seconds]
# Normalizes to -16 LUFS so the volume in the project file behaves the same for every track.
set -euo pipefail
in="$1"; proj="$2"; start="${3:-0}"; dir="$(dirname "$0")/../public/$proj/music"
mkdir -p "$dir"
ffmpeg -hide_banner -loglevel error -y -ss "$start" -i "$in" -vn \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ac 2 -ar 48000 "$dir/track.wav"
echo "Music: $dir/track.wav"
