#!/usr/bin/env bash
# Render a project and finish it for TikTok / Reels / Shorts.
#   scripts/render.sh porzingis
# Output: out/<project>.mp4 (H.264, 30fps, audio at -14 LUFS).
set -euo pipefail
proj="$1"; root="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$root/out"
browser=()
[ -n "${REMOTION_BROWSER:-}" ] && browser=(--browser-executable "$REMOTION_BROWSER")
(cd "$root" && npx remotion render src/index.ts "$proj" "out/$proj-raw.mp4" ${browser[@]+"${browser[@]}"})
"$root/scripts/finalize.sh" "$root/out/$proj-raw.mp4" "$root/out/$proj.mp4"
rm "$root/out/$proj-raw.mp4"
