# OptionRow

A full-width, bordered row that picks one option from a short list or opens a related place: the settings drawer's language, theme and about rows, and the language list itself.

Recreated from the settings Sheet in `src/components/DashboardShell.tsx` and `src/components/common/LanguageSwitcher.tsx`.

## Anatomy

- A row with a `border` outline, `radius-lg`, 12 × 8px padding and 14px `secondary-foreground` text; `muted` fill on hover.
- A leading 16px icon, and a trailing element: a chevron for a row that opens a list, a `muted-foreground` meta value (the version, a language code), or an external-link glyph.
- Selected: a 10% `primary` tint, 40% `primary` border, `primary` text at weight 600, `aria-pressed="true"`.
- Rows group under an `eyebrow` heading (10px here), sections 24px apart in the drawer.

## What you provide

The option's label, icon and trailing element; `aria-pressed` for a choice, `href` for a link.

## Rules

- Use rows inside drawers, popovers and menus, where options stack. Use SegmentedControl for a switch inside a page.
- A row that leaves the site shows the external-link glyph and opens in a new tab.
- Language names are written in their own language and carry `lang`.

## Code today

The selected row reads 4.48:1 on the drawer's `background` in light and 4.34:1 on the dark popover, just under AA; the Roadmap's surface rule (docked sheets on `card`) and neutral fix bring both over.
