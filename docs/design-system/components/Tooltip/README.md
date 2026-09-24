# Tooltip

A short inverted label that names an icon-only control on hover or focus.

Recreated from `src/components/ui/tooltip.tsx` and `src/components/common/IconTooltip.tsx`.

## Anatomy

- `foreground` fill with `background` text (15.2:1 light, 16.6:1 dark), `radius-md`, 12 × 6px padding, 12px text balanced over at most a few words, with a 10px rotated-square arrow.
- Opens after 300ms (the provider's delay), fades and zooms in, and is portaled above everything.

## What you provide

The label, as terse as the control allows ("Reset the estimator"); the control keeps its own full `aria-label`.

## Rules

- Tooltips name controls. Data belongs in a DataReadout, explanations in a popover (the formula help) or on the page.
- Never put interactive content in a tooltip; touch devices cannot reach it.
