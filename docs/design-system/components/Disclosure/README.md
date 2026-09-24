# Disclosure

A text toggle that shows or hides reference material under a chart or in a dialog: the data table, the policy-event sources, the whole changelog, the estimator's working.

Recreated from `src/components/ChartDataTable.tsx`, `src/components/common/PolicyEventList.tsx`, `src/components/ChangelogModal.tsx` and `src/components/EstimationCard.tsx`.

## Anatomy

- 12px `primary` text with a 14px chevron, fading to 80% on hover; `aria-expanded` and `aria-controls` point at the region it opens.
- Under a chart it sits below a `border` top rule with 8px above it. When the table is open, its CSV action sits at the right of the same row as a small outline button.
- The estimator variant is a full-width row over a dashed rule: the question in `secondary-foreground` on the left, the action and a rotating ChevronRight in `muted-foreground` on the right.

## What you provide

A paired show and hide label ("View data table" / "Hide data table") and the region to toggle.

## Rules

- Reference material starts collapsed; it is there to check, not to read on the way past.
- The label says what will happen and flips with the state.
- Collapsed content is unmounted, so a disclosure that hides the only copy of something must offer an "Expand all".
