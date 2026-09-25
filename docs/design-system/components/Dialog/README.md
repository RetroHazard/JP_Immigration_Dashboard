# Dialog

A modal for long reference content, today only the changelog; the same primitive, as Sheet, drives the settings drawer and the mobile estimator.

Recreated from `src/components/ui/dialog.tsx`, `src/components/ui/sheet.tsx`, `src/components/ChangelogModal.tsx` and `src/utils/renderChangelog.tsx`.

## Anatomy

- A 50% black scrim; the dialog centered, up to 512px wide and 80% of the viewport tall, with `border`, `radius-lg`, `shadow-lg` and 24px padding.
- Title in `title-section` at a tight line height; a close button in the top-right corner.
- Controls that must stay reachable (Expand all) sit above the scrolling region; the content scrolls inside.
- Sheet: slides from the right (settings, 288px) or the bottom (the estimator, up to 85% of the viewport, top corners `radius-xl`).

## What you provide

A title, the content, and open/close state; Radix handles focus trap, Escape and focus return.

## Rules

- Anything floating above the page paints `popover`; anything docked to an edge (sheets) paints `card` (Roadmap step 12).
- Reopening starts at the top: the newest month open, older months collapsed.
- Use a dialog for reading, not for interrupting. The dashboard has no confirm dialogs.

## Code today

Dialog and Sheet paint `background`, a step darker than the cards under the scrim (Audit B6). The preview shows the proposed `popover` surface.
