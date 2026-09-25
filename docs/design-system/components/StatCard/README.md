# StatCard

A summary tile that leads the page: one figure for the latest period, its change, its scope and an eight-period sparkline.

Recreated from `src/components/common/StatCard.tsx`, used by `StatsSummary.tsx` (five processing tiles) and `ResidentsStatsSummary.tsx` (four residents tiles).

## Anatomy

- A `card` tile with `border`, `radius-xl` and `shadow-soft`, lifting to `shadow-soft-lg` on hover; padding 8px on phones (6px in dense rows), 12px from sm, 16px from lg.
- Title in `eyebrow`, clamped to two lines with `break-words`; a short title stands in below xl where the row is narrowest.
- A 24px icon badge: the series color at 15% behind the icon in that color.
- The value in `display-figure` (16px, then 18px, then 24px from lg), counting up from the previous value over 800ms.
- The delta in 12px: `success` when the change is good news, `warning` when it is not, `muted-foreground` when a change has no direction (a resident stock, the total). The scope ("Nationwide", "As of Dec 2025") sits under it.
- The sparkline: a 1.5px `chart-1` line at 50%, inline from lg and full-width under the tile below it.

## What you provide

Title and short title, the value and its formatter, a delta `{ percent, direction }` with the phrasing key (month-over-month or half-over-half), the scope subtitle, the icon, the badge color and up to eight sparkline points.

## Rules

- Grade a delta by what the metric means, never by its sign alone: fewer pending applications is good news.
- A tile's badge color is its metric's series color, so the tile and the chart below it agree (Roadmap step 7).
- Phones get the filled 2 + 3 mosaic; residents tiles stay four across in dense mode. The row never scrolls sideways.

## Code today

Badge colors come from a local five-name map (blue, yellow, green, red, gray), so Pending is yellow here but blue in its chart, Total is blue, and the approval rate is gray (Audit B1). In light the yellow and aqua badges put their icon at 1.84:1 and 2.32:1 on the tint.
