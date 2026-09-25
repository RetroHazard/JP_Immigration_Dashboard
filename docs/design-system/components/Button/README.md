# Button

The vendored shadcn Button: the one component for text actions, from the mobile "Processing Time Estimator" launcher to a dialog's Close.

Recreated from `src/components/ui/button.tsx`.

## Variants

- `default`: a `primary` fill with `primary-foreground`. The action the view exists for, at most once per region.
- `outline`: `background` fill, `border`, `shadow-xs`; in dark, `input` at 30%. Secondary actions such as Close.
- `ghost`: no fill until hover (`accent`). Low-emphasis actions inside dense panels.
- `link`: `primary` text that underlines on hover. Inline navigation.
- `secondary` and `destructive` exist in the primitive but are unused in the app.

## Sizes

`sm` 32px (`control-height-sm`), `default` 36px (`control-height`), `lg` 40px (`control-height-lg`); padding tightens when the button leads with an icon. Icons are 16px with an 8px gap.

## What you provide

A verb-first, sentence-case label ("Download CSV", "Reload page"); an optional leading lucide icon; `asChild` to render a link.

## Rules

- Use this component for every text button. The app's Retry and Reload buttons (App.tsx, ErrorBoundary.tsx) are hand-built with the same classes and should switch.
- Focus is the solid `ring` outline shown on "Focused". The primitive currently draws a 50% ring (Audit A4).
- Disabled buttons drop to 50% opacity and ignore the pointer.
- Destructive text must use `destructive-foreground`, not white (Audit C9).
