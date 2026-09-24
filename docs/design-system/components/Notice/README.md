# Notice

An inline message that qualifies what is on screen: a caution, a problem, or the absence of data.

Recreated from the estimator notices in `src/components/EstimationCard.tsx` and the empty states in `StatsSummary.tsx`, `EstimationCard.tsx` and `ChartDataTable.tsx`.

## Variants

- **Warning**: a 10% `warning` tint, `radius-md`, 12 × 8px padding, a 16px TriangleAlert. For results that hold with caveats ("Estimated with limited data:").
- **Destructive**: the same on a 10% `destructive` tint with OctagonAlert. For something the reader may need to act on ("Possibly past due:").
- **Empty**: a dashed `border` box with one centered sentence in `muted-foreground` ("No data for this combination of filters.").

## What you provide

A bold lead-in ending in a colon, then one or two plain sentences; the icon matches the variant.

## Rules

- Write the body in `foreground`; the hue goes on the icon and lead-in, in `warning-strong` (proposed) or `destructive-strong` (an alias of `destructive`).
- Never place a tinted notice inside another tinted surface.
- An empty state says what is empty and why ("for this combination of filters"), not "No results".

## Code today

The whole notice is set in its hue. Destructive reaches 4.57:1 on its tint since v1.6.4; warning is 4.41:1 in light, and both drop when nested (Audit A3).
