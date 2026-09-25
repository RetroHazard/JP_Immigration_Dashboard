# FormulaStep

One step of the estimator's "Show the math" breakdown: a numbered card with the step's formula filled in with the reader's own figures, and a help popover defining each symbol.

Recreated from `src/components/common/FormulaTooltip.tsx` and `src/components/EstimationFormula.tsx`.

## Anatomy

- A card on 50% `muted` with `border`, `radius-lg` and `shadow-soft`, 12 × 8px padding.
- Header: a 16px `primary` disc at 15% holding the step number, the step title in a 10px `eyebrow`, and a 20px round help button (CircleHelp) that opens a popover of variable definitions.
- Body: the formula in KaTeX, 10px base with 6px display margins, scrolling sideways inside the card if it is wider than the rail.

## What you provide

The step number and title, the variable glossary for the step, and the formula with the reader's values substituted.

## Rules

- Steps are numbered because order matters: no symbol is used before the step that defines it.
- Print fractional operands with two decimals and whole values as grouped integers, so the arithmetic on screen can be checked by hand.
- Figures use the reader's own digit grouping and decimal mark.

