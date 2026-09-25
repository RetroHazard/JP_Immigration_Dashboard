# Panel

The card every region of the dashboard lives in, shown here as the chart card: title, description, time control, legend, plot and data-table disclosure.

Recreated from the `base-container` utility in `src/index.css` and the chart card in `src/components/DashboardShell.tsx`.

## Anatomy

- `card` fill, 1px `border`, `radius-xl`, `shadow-soft`; padding 12px on phones, 16px from sm, 20px from md, 24px from lg.
- Header: the view name in `title-section` with a one-sentence description in 12px `muted-foreground`; on the right, the PeriodSelect and the coverage line in `micro`.
- Then the legend, the plot (sized by aspect ratio, never a fixed height) and, under a `border` rule, the data-table disclosure.
- In compare mode the plot area splits into two columns from md, divided by a `border` rule, the second labelled "(comparison)".

## What you provide

The chart's registry entry (label, description, ranges, table) and its content.

## Rules

- One panel per region; do not nest panels. Inside a panel, group with spacing and hairlines, not with more cards.
- Chart panels keep both overflow axes visible so y-axis labels that extend left of the plot are not clipped (`chart-card-content`).
- The filter bar and the estimator use the same surface; the estimator adds a header row with its own actions.

## Code today

Axis labels overlap the first and last bands on Intake & Processing (Audit A5). The plot above keeps a gap.
