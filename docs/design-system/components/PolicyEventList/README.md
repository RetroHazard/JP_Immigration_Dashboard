# PolicyEventList

The annotation layer for policy changes: marker discs on the plot, and under the chart a collapsible list that names each event and links its government source.

Recreated from `src/components/common/PolicyEventList.tsx`, `src/components/bklit/charts/markers/` and `src/constants/policyEvents.ts`.

## Anatomy

- Marker: a disc on `chart-marker-background` with a `chart-marker-border` ring and a 14px `chart-marker-foreground` icon, placed on the period the change took effect. Two events in one period share a disc with a `chart-marker-badge-*` count.
- Icon by category: Scale for legislation, Banknote for fees, Landmark for operations, Split for reporting.
- List: under a `border` rule, a Disclosure ("Show policy events"), then one row per event in view: a 20px `muted` disc with the category icon, the month in `muted-foreground`, a `primary` link to the source with an external-link glyph, and a one-line description.

## What you provide

Curated events `{ period, category, titleKey, descriptionKey, href }` and the periods the chart plots.

## Rules

- Only events whose period is on the axis are drawn or listed.
- Markers are never links; the list carries the sources and the keyboard path.
- Place an event where the figures move (the effective date), not where it was announced.

## Code today

Scale also marks the Biggest Movers tab on the same dataset (Audit B12).
