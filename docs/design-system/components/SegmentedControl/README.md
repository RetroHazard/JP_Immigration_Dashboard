# SegmentedControl

A row of two or three mutually exclusive choices that switch what a region shows: the dataset, or a chart's breakdown.

Recreated from the dataset switch in `src/components/DashboardShell.tsx` and the view toggles in `PopulationGrowthChart.tsx`, `NationalityTrendChart.tsx` and `NationalityMoversChart.tsx`.

## Anatomy

- Pills with `radius-full`, 12px text and 12 × 6px padding, 4px apart.
- Selected: a `primary` fill, `primary-foreground` text at weight 600, `aria-pressed="true"`.
- Unselected: a `border` outline with `secondary-foreground` text, `muted` fill on hover.
- Disabled (the residents half when its data fails to load): 50% opacity with a `title` saying why.
- Phones get the compact label ("Processing", "Residents").

## What you provide

A group label (`aria-label`), two or three option labels with compact forms, the current value and a change handler.

## Rules

- Build it on the vendored ToggleGroup (`type="single"`) so arrow keys move between options.
- Use it only for switching a view. Filters are selects; long lists of choices are option rows.
- Never more than three options; past that, use a select.

## Code today

Two shapes (Audit B2): the dataset switch is the pill above; the in-chart toggles are borderless `radius-md` buttons with 8 × 4px padding. The settings drawer's theme choice uses option rows, which is correct for a drawer list.
