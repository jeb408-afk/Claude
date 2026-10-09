#!/usr/bin/env bash
# Bring a Tella export into a project.
#   scripts/tella-import.sh ~/Downloads/tella-export.mp4 porzingis
# Writes public/<project>/audio/vo.wav (clean, loudness-normalized voiceover)
# and public/<project>/aroll.mp4 (1080x1920, 30fps, for 'aroll' cuts).
set -euo pipefail
in="$1"; proj="$2"; dir="$(dirname "$0")/../public/$proj"
mkdir -p "$dir/audio"

# Voiceover: mono 48k, cut rumble below 80Hz, gentle de-noise, -16 LUFS (speech standard).
ffmpeg -hide_banner -loglevel error -y -i "$in" -vn \
  -af "highpass=f=80,afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11" \
  -ac 1 -ar 48000 "$dir/audio/vo.wav"

# Video: fill a 9:16 frame (center crop), constant 30fps so it stays in sync.
if ffprobe -v error -select_streams v -show_entries stream=index -of csv=p=0 "$in" | grep -q .; then
  ffmpeg -hide_banner -loglevel error -y -i "$in" -an \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" \
    -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p "$dir/aroll.mp4"
fi
echo "Voiceover: $dir/audio/vo.wav ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$dir/audio/vo.wav")s)"
