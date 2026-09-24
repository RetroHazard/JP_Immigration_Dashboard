# FilterField

A labelled native select for a filter or estimator input: bureau, application type, comparison bureau, region, nationality, residence status.

Recreated from `src/components/common/FilterInput.tsx`, used by `FilterPanel.tsx`, `ResidentFilterPanel.tsx` and `EstimationCard.tsx`.

## Anatomy

- Label: `eyebrow` (uppercase 12px, 10px below sm) above the control, 8px gap, fields bottom-aligned so a wrapped label does not stagger the row.
- Control: a native select at `control-height`, `radius-md`, `input` border, `card` fill, `shadow-xs`, 14px medium text with the forms-plugin chevron. Long values ellipsize.
- Disabled (a filter the active chart ignores): 50% opacity with a not-allowed cursor. The value resets to "All" while disabled, so the chart, table and tiles agree.

## What you provide

The label, the options (value and label from the catalogue), the value and a change handler; `includeDefaultOption` with a placeholder for the estimator's empty state.

## Rules

- Keep native selects for filters: the nationality list has 202 entries and the platform picker handles that on every device.
- Filters that depend on each other cascade: picking a region narrows the nationality list and clears a nationality outside it.
- The filter bar sizes fields by its own width (container queries), because the sidebar narrows it without a viewport change.

## Code today

The same field is labelled two ways on one screen (Audit B3): the filter bar uses a 16px semibold Title Case label and 16px semibold values; the estimator uses the eyebrow. The Roadmap puts every field on the unified look.
