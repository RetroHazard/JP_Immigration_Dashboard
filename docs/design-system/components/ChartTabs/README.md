# ChartTabs

The view switcher above the chart card: one icon tab per chart, where only the active tab spells out its name.

Recreated from `src/components/ui/tabs.tsx` and the tab list in `src/components/DashboardShell.tsx`.

## Anatomy

- A `muted` track, 36px tall with 3px inset and `radius-lg`, sitting on the page ground.
- Triggers are 16px icons at 60% `foreground` (`muted-foreground` in dark). The active trigger lifts onto `background` with `shadow-sm` (in dark, a 30% `input` fill and border) and expands its label over 300ms.
- Below sm the label stays hidden and the tabs spread across the full width; the chart card's own title names the view.
- Inactive tabs keep their names in `title` and `sr-only` text, so the icons are never the only name.

## What you provide

The chart registry for the active dataset (key, icon, label); the active key, which is URL state (`?chart=`).

## Rules

- Radix Tabs semantics: arrow keys move between tabs; the panel is labelled by its tab.
- One icon per view and no icon shared with another meaning (see the Icons group).
- Never scroll the tab row sideways; collapse labels instead.

## Code today

In light the track is `muted` (#edeff3) on `background` (#eef0f4), 1.01:1, so it is invisible (Audit A2), and inactive icons and labels sit at 4.35:1. The Roadmap's `muted` value brings the track back.
