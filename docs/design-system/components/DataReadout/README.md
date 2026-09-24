# DataReadout

The floating panel that reads out exact values for the point, bar, tile or bureau under the pointer or finger.

Recreated from `src/components/bklit/charts/tooltip/` (TooltipBox and TooltipContent), `src/components/charts/EfficiencyHoverCard.tsx`, the Category Mix tooltip and the Regional Map info card.

## Anatomy

- A `popover` panel with a 1px `border`, `radius-lg` and `shadow-soft-lg`, at least 140px wide and never wider than its chart.
- Title: the period, bureau or segment, 12px medium (600 when it carries a color dot).
- Rows: a 10px round swatch and the series label in 14px `chart-tooltip-muted`, the value in `tooltip-value`, right-aligned with tabular figures, 16px between them.
- It follows the pointer with a light spring, flips at the container edge and stays inside it; on touch it opens above the finger and stays pinned until dismissed.

## What you provide

A title and rows `{ color, label, value }` with values already formatted by the locale formatters.

## Rules

- One readout on screen at a time.
- Show only what the chart encodes plus the exact numbers; explanations belong in the chart description.
- Figures are Inter with tabular numerals, never the mono stack.

## Code today

Four surfaces do this job (Audit B4), and the vendored tooltip's text classes compile to nothing, so labels render at full `foreground` like the values (Audit A1, shown on the right).
