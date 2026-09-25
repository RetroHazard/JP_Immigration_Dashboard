# AppHeader

The band across the top of every page that names the product and holds the four global controls: language, changelog, source link and theme.

Recreated from `src/components/DashboardShell.tsx` (the `nav` with `header-block`), `src/components/icons/JapanFlagIcon.tsx` and `src/components/common/LanguageSwitcher.tsx`.

## Anatomy

- A `header-height` (64px) band on `card` with a `border` bottom rule and `shadow-xs`, inside the `layout-max-width` container.
- Left: the hinomaru at 36 × 24px, the product name in `title-app`, and a one-line subtitle in 12px `muted-foreground` (10px below sm). Both truncate to one line.
- Right, from sm: a round language button that opens the language list, the version chip that opens the changelog, the GitHub link and the theme toggle (Sun in light, Moon in dark).
- Below sm the four controls move into the settings drawer, opened by a round Menu button (see OptionRow).

## What you provide

`app.title` and `app.subtitle` from the catalogue, and the build version.

## Rules

- One product name and one mark per page.
- Only global controls live here. Anything that changes the data shown belongs in the filter bar.
- Every icon-only control has an `aria-label` that names the action ("Switch to dark theme").

## Code today

The version chip's History icon is a counter-clockwise arrow like the RotateCcw reset icons on the same screen. The Roadmap moves the chip to ScrollText.
