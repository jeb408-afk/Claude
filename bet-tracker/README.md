# Bet Ledger

A personal wager log published as a claude.ai artifact: https://claude.ai/artifact/JJqTsBMiThuYw74kxnGGii

`index.html` is the page source. Bets are stored in the artifact's database (`bets` collection, one document per wager; `settings/main` holds the starting bankroll, unit size and currency symbol). Only the artifact's owner can read or write them.

## What it tracks

- Net profit, return on stake, record and win rate, current bankroll
- Wins against the number implied by the odds taken, with a standard-deviation check
- Closing line value, maximum drawdown and current streak
- Bankroll, cumulative profit in units and 20-bet rolling ROI over time
- Monthly results, results by odds band, and breakdowns by sport, market and sportsbook

## Importing a history

Import CSV accepts a header row with at least `date`, `odds` and `stake`; it also reads `sport`, `market`, `selection`, `book`, `result`, `cashout`, `closing_odds` and `notes`. Export CSV produces the same layout.
