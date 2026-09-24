# Data visualization

Charts are the product. Thirteen views across two datasets, each answering one question, drawn with the vendored Bklit UI charts (visx) and a few hand-built SVG views. This section covers how color, text and interaction work across all of them.

## The views

| View | Key | Tab icon | Form | Time control |
| --- | --- | --- | --- | --- |
| Intake & Processing | `intake` | BarChart3 | Stacked bars, a line on the same axis, a rate line on its own 0–100% axis, policy markers | Range |
| Application Types | `types` | LineChart | Six lines, legend toggles rescale the axis | Range |
| Outcomes | `outcomes` | GitFork | Sankey from type to outcome, with an approval gauge | Range |
| Bureau Share | `share` | PieChart | Donut of the top bureaus plus an "Other" fold | Range |
| Category Mix | `mix` | LayoutDashboard | Zoomable treemap: type, then bureau | Range |
| Processing Efficiency | `efficiency` | ChartBarDecreasing | Ranked lollipop, stem weight = intake, dashed nationwide guide | Range |
| Regional Map | `map` | Globe2 | Prefecture choropleth plus bureau markers | none |
| Population Growth | `growth` | TrendingUp | Stacked half-yearly bars, by purpose or by region, policy markers | Range |
| Origins Over Time | `origins` | LineChart | Top nationalities as lines, counts or indexed | Range |
| Origin to Status Flows | `flows` | Network | Three-column sankey: region, country, group | Snapshot |
| Residence Status Mix | `statuses` | Layers | Zoomable sunburst: group, then status | Snapshot |
| World Origins | `worldmap` | Globe | World choropleth | Snapshot |
| Biggest Movers | `movers` | Scale | Diverging ranked bars between two periods | Range |

Flow and count views take the range selector (6, 12, 24, 36 months or all; 3, 5, 10 years for residents). Views of a stock at one moment take the snapshot selector and name the half-year they show.

## Color

### Categorical: `chart-1` to `chart-8`

- Assign in fixed order and never reorder by value. The first five (blue, orange, aqua, yellow, magenta) were chosen as a color-vision-safe set; `chart-6` to `chart-8` were added later and were not.
- Keep a view to five categories where you can. When it needs more (Application Types uses six, Bureau Share seven), give every series a second cue: a legend toggle, a tooltip row and a table column.
- In light, `chart-3`, `chart-4` and `chart-5` sit below 3:1 on `card`. Do not use them for thin lines or small dots without a darker outline.
- A metric keeps one color everywhere it appears. The Roadmap proposes the canonical map; today Pending is `chart-1` in Intake & Processing but a `chart-4` badge on its stat tile.

### Hierarchies: `chart-mix-1` to `chart-mix-6`

- One hue per top-level group (application types in Category Mix, purpose-of-stay groups in the residence views). Children are `color-mix` tints of their parent toward the card, so a bureau inside Extension of Stay stays recognizably "extension".
- Label hierarchy segments directly. The palette is not safe for color-vision deficiency on its own (see the table below), and `chart-mix-2` is the same value as `primary`.

### Regional identity: `bureau-*`

- Use a bureau's color only to mean that bureau: Regional Map fills and markers, Processing Efficiency stems and dots.
- Airport offices never get a hue of their own. They draw as a 45% tint of their parent bureau toward white, outlined in the parent color.
- The Regional Map encodes population density as opacity steps (0.30, 0.45, 0.60, 0.78, 0.92) over the bureau color, binned at 100, 250, 500 and 1,500 people per km².

### Sequential: `chart-scale-01` to `chart-scale-05`

- A five-step blue ramp with its own dark steps, meant for binned magnitude. Neither map uses it today: World Origins shades with `chart-1` mixed into transparency at five alphas. The Roadmap moves World Origins onto the ramp.

### Color-vision check

Minimum CIEDE2000 distance between any two colors of a set, after simulating each deficiency (Machado 2009, full severity). Under about 10 two small marks become hard to tell apart; under 5 they merge.

| Set | Normal | Deuteranopia | Protanopia | Tritanopia | Worst pair |
| --- | --- | --- | --- | --- | --- |
| `chart-1..5`, light | 24.2 | 9.6 | 14.7 | 8.2 | yellow / magenta (tritan) |
| `chart-1..8`, light | 13.3 | 6.8 | 4.7 | 5.5 | orange / green (`chart-2` / `chart-6`, protan) |
| `chart-1..8`, dark | 14.1 | 3.5 | 1.9 | 5.5 | blue / violet (`chart-1` / `chart-7`, protan) |
| `chart-mix`, light | 9.9 | 1.6 | 1.4 | 5.4 | teal / magenta (family / residency, deutan) |
| `chart-mix`, dark | 9.3 | 1.1 | 1.2 | 3.9 | teal / magenta (deutan) |

## Chart chrome

- Plot on `chart-background` (the card). Gridlines are `chart-grid`, faint on purpose; the hover guide is `chart-crosshair`.
- Axis ticks are `chart-label` in the `chart-axis` style, formatted with the locale's compact numbers. The left margin is measured from the widest label in the active locale ("1,2 Mio.", "800 mil"), never assumed from English.
- The hovered column gets a date ticker pill under the axis: `chart-indicator-color` fill, `chart-indicator-secondary-color` text.
- A dragged range fills with `chart-segment-background` between `chart-segment-line` edges.

## Text inside charts

HTML-rendered labels follow the type styles. Text drawn inside the SVG does not: the mounted charts use four fixed sizes and two fluid ones.

| Size | Where |
| --- | --- |
| 10px | Policy-marker tooltip date; the Outcomes gauge caption (the floor of `clamp(10px, 9cqw, 12px)`) |
| 11px | Residence-status sunburst labels, the marker count badge, sankey node values |
| 12px | Axis ticks (`chart-axis`) |
| 13px | Sankey node names |
| 12–30px | The Outcomes gauge value, `clamp(12px, 22cqw, 30px)` |

The swap-ready alternates that are not mounted (the efficiency quadrant and the vendored radar) add 9, 9.5 and 10.5px. Use 11px for in-plot annotation and 12px for anything a reader must read to use the chart until the Roadmap's chart type steps land. Long labels must fit their segment or be dropped: sunburst labels currently run past the ring when a status name is long.

## Tooltips

- A chart tooltip is a `popover` panel with `radius-lg`, `shadow-lg` and a light backdrop blur, at least 140px wide and never wider than its chart.
- Title in 12px medium; one row per series with a 10px round swatch, the series label and the value in `tooltip-value`, right-aligned.
- Labels are meant to be `chart-tooltip-muted` and values `chart-tooltip-foreground`. Both classes currently compile to nothing, so both render in `foreground` (see Audit).
- On a mouse, hovering shows it. On touch, a tap pins it above the finger; tapping the same point, outside the chart, or scrolling closes it. Only one tooltip is ever open.

## Legends

- `SeriesLegend` sits above the plot: a 10px square swatch (3px corners) for bars and areas, a 14 × 2px bar for lines, labels in `secondary-foreground` at 12px.
- When series can be toggled, each entry is a button with `aria-pressed`; a hidden series drops to 35% opacity and the axis rescales to what is left.
- Legend order is series order. (The residence-status sunburst lists groups by size, so the same six groups appear in a different order from Population Growth.)

## Policy markers

- A disc on top of the plot marks the period a policy change took effect, not when it was announced. The icon names the kind of change: Scale for legislation, Banknote for fees, Landmark for operations, Split for reporting.
- Two events in one period share one disc with a count badge, and the tooltip reads out both.
- Markers are annotation, not links. The collapsible "Show policy events" list under the chart names each event, links its government source and gives the keyboard path.

## Tables and text alternatives

- Every Application Processing chart has a "View data table" disclosure below it that renders the chart's own table (rows follow the chart: months, bureaus, types or prefectures) with a CSV download.
- Tables have a sticky `muted` header, `border` row rules, left-aligned labels and right-aligned tabular figures, inside a 288px-high scrolling frame.
- Resident Population charts have no table yet. The Roadmap adds one.
- Each chart has `role="img"` and an `aria-label`; changing views announces the new view and scope through a polite live region.
