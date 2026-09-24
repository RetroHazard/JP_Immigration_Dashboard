# Logos

The site's only mark is the hinomaru: a crimson disc (`hinomaru`, #bc002d) three-fifths of the hoist in diameter, centered on a white field (`hinomaru-field`) with 4.5/24 rounded corners and a 1px `border` outline. It keeps its real colors in both themes. Show it at 36 × 24px or larger, beside the product name, never re-tinted, rotated or outlined in another color.

- `hinomaru-light.svg`: the header mark as rendered in the light theme (outline #e5e7ee, the light `border`). Drawn from `src/components/icons/JapanFlagIcon.tsx`, where the outline reads `var(--border)`.
- `hinomaru-dark.svg`: the same mark as rendered in the dark theme (outline #262834).
- `logo512.png`: the PWA icon as shipped in `public/`. Its disc is #ed1b2f on a #eeeeee field, not the header's #bc002d on #ffffff; see Audit B15.
- `apple-touch-icon.png`: the 180px touch icon as shipped, with the same PWA colors.
- `og.png`: the 1200 × 630 social card as shipped. It predates the hinomaru and still shows the retired indigo "JP" monogram on the old #f6f7f9 ground; regenerate it from `scripts/og-template.html` with the mark (Roadmap step 20).
