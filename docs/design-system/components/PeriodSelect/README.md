# PeriodSelect

The compact select in a chart card's header that sets the time window, or for a stock view the half-year snapshot to draw.

Recreated from `src/components/common/PeriodSelector.tsx`, `SnapshotPeriodSelector.tsx` and `src/components/ui/select.tsx`.

## Anatomy

- Trigger: `control-height-sm` (32px), `radius-md`, `input` border, `shadow-xs`, 14px text and a 16px chevron at 50%; in dark, a 30% `input` fill.
- Menu: `popover` surface, `border`, `radius-md`, `shadow-md`, 4px inset; items 14px with `radius-sm`, highlighted in `accent`, the selected one marked by a check.
- Under it, the dataset's coverage in `micro` (`Data: Nov 2020 – Oct 2025`).

## What you provide

The ranges the active chart allows (from its registry entry), the value and a change handler. Snapshot mode takes every published half-year, newest first.

## Rules

- Monthly ranges read in months, half-yearly ranges in years ("3 years", never "6").
- Choosing the newest snapshot clears it from the URL, so a shared link does not go stale on the next release.
- Labels are plural families from the catalogue, never assembled in code.
