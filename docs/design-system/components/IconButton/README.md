# IconButton

A single-icon control for a global or panel action, in two round sizes: 36px outlined for bars and headers, 28px ghost for panel headers.

Recreated from the hand-built buttons in `src/components/DashboardShell.tsx`, `src/components/FilterPanel.tsx`, `src/components/ResidentFilterPanel.tsx` and `src/components/EstimationCard.tsx`.

## Variants

- **Outline, 36px** (`control-height`, `radius-full`): `border` ring, `secondary-foreground` icon, `muted` fill on hover. Header controls and the filter bar's airport and reset buttons.
- **Ghost, 28px** (`icon-button-sm`): no ring, `muted-foreground` icon, `muted` fill on hover. The estimator's reset, permalink, collapse and close.
- **Pressed**: a 10% `primary` tint, 40% `primary` border and `primary` icon, plus `aria-pressed="true"`. The airport toggle also strikes through its plane when airports are excluded.
- **Confirmed**: a 15% `primary` tint for two seconds after a successful copy, with the tooltip switching to its confirmation text.
- **Disabled**: 50% opacity, no hover fill.

## What you provide

One 16px lucide icon, an `aria-label` that names action and object ("Reset the Processing Time Estimator"), and a terse tooltip through IconTooltip when the meaning is not obvious.

## Rules

- Round in every context. Never square a button here and round it there.
- Build it as `Button` with `size="icon"` or `size="icon-sm"` so focus and disabled come from one place.
- Pair a state change with a visible cue beyond color: the strike on the plane, the check after copying.

## Code today

Three shapes do this job (Audit B5): round 36px in the header, square 36px with `radius-lg` in the processing filter bar, square with `radius-md` in the residents filter bar, and round 28px in the estimator. Hand-built versions dim to 40% when disabled and show the browser's default focus.
