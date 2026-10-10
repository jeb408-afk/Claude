#!/usr/bin/env bash
# List where each spoken phrase starts in the voiceover, using pauses as boundaries.
#   scripts/vo-timings.sh porzingis [min_pause_seconds]
# Use the start times to update the cut starts in projects/<project>.ts.
set -euo pipefail
proj="$1"; pause="${2:-0.3}"
wav="$(dirname "$0")/../public/$proj/audio/vo.wav"
ffmpeg -hide_banner -nostats -i "$wav" -af "silencedetect=noise=-35dB:d=$pause" -f null - 2>&1 |
  awk 'BEGIN { n = 1; printf "%-4s %s\n", "#", "starts at"; printf "%-4s %.2fs\n", n++, 0 }
       /silence_end/ { printf "%-4s %.2fs\n", n++, $5 }'
