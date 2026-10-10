# Recovery video graphics

Data images and motion graphics for "Long COVID: My Recovery, Measured", built from your own Apple Health data.

## Use your data
1. Open the Long COVID Steps & HR page, load your Health export, set range to **All**, tap **Copy daily data as CSV**.
2. Paste it into `data/daily.csv` (replace everything).
3. Edit `data/config.json`: set `onset` (COVID date), `pacingStart`, `mestinonStart` as `YYYY-MM-DD`, and `"example": false`.
4. Render:
```
npm install
node render.mjs --images images     # crash.png, climb.png, cost.png (1080x1920)
DATA_DIR=/path/to/folder node render.mjs --images images   # use data kept outside the repo
node render.mjs out                 # motion graphics for each script section (optional)
```

## Images
- `crash.png`: steps and resting HR around onset. Before = 30 days before onset; worst/peak = worst 14-day average in the 4 months after.
- `climb.png`: from your worst 30-day month to the last 30 days. Steps ratio, resting HR change, walking HR change (median HR in minutes with 60+ steps).
- `crash.png` falls back to your first full month of heart rate data when there is none from before onset.
- `cost.png`: minutes a day at 100+ bpm per 1,000 steps, by month since onset (months with 20+ days of heart rate). Lower = moving costs your heart less.
