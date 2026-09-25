# LoadingState

The full-screen or in-panel wait: a spinning ring in `primary` over one line saying what is loading.

Recreated from `src/components/common/LoadingSpinner.tsx`.

## Anatomy

- A 40px Loader2 icon in `primary`, spinning once a second; still under reduced motion.
- A 14px semibold `secondary-foreground` message 16px below it.
- Full-screen mode fills the viewport on `background`; panel mode takes a 250px minimum height inside its container.

## What you provide

The message from the catalogue and whether it fills the screen.

## Rules

- Say what is loading in sentence case with the ellipsis character: "Loading dashboard…", "Loading map…".
- Charts draw their own skeleton sweep; use this only for the app boot and for panels whose data arrives separately (the maps).

## Code today

The boot messages read "Crunching Immigration Data..." and "Loading Dashboard..." (Audit B13).
