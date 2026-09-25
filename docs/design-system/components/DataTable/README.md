# DataTable

The text alternative under a chart: a collapsible table of exactly what the chart draws, with a CSV download.

Recreated from `src/components/ChartDataTable.tsx`; the table shapes come from `src/utils/chartTables.ts`.

## Anatomy

- Opened by a Disclosure under a `border` rule; the "Download CSV" small outline button sits at the right of that row while the table is open.
- A 288px-high scrolling frame with `border` and `radius-lg`. Only the frame scrolls sideways, never the page.
- A sticky `muted` header in 12px semibold; rows split by `border` rules, 12 × 6px cell padding.
- Row labels are `th scope="row"`, left-aligned, 500 weight; figures are right-aligned and tabular; label columns stay left.
- A screen-reader caption names the chart and scope ("Showing Bureau Share for Nationwide").

## What you provide

The chart's table model id from its registry entry and the same data, filters and range as the chart.

## Rules

- The table follows its chart: rows are months, bureaus, types or prefectures as the chart's own axis is.
- Build it only when opened; the CSV builds on demand.
- CSV column headers and file names stay in English and name their contents (`immigration-stats_intake_fukuoka_ext_12.csv`).

## Code today

Resident Population views have no table (Audit C7).
