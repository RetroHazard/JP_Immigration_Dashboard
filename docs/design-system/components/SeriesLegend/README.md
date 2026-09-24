# SeriesLegend

The row above a chart that names each series by its color, and on toggleable charts shows or hides a series.

Recreated from `src/components/common/SeriesLegend.tsx`.

## Anatomy

- Entries 16px apart (4px between wrapped lines), 12px `secondary-foreground` labels. Identity lives in the swatch; the text stays in ink.
- Swatch: a 10px square with 3px corners for bars and areas, a 14 × 2px rounded bar for lines.
- Toggleable entries are buttons with `aria-pressed` and a "Hide …" or "Show …" title; a hidden series drops to 35% opacity and the chart rescales to what remains.

## What you provide

Items `{ id, label, color, shape }` where `id` is stable across locales, and optionally `onToggle` and `toggleTitle`.

## Rules

- List series in their canonical order, the same in every view.
- Colors come from series tokens only (`chart-*`, `chart-mix-*`, `bureau-*`), never a literal.
- Keep hiding reversible and visible: a hidden entry stays in the legend.
