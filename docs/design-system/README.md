Civic Glass is the design language of the Japan Immigration Statistics dashboard at dashboard.retrohazard.jp. It presents official Immigration Services Agency figures from e-Stat to three kinds of reader: people waiting on their own visa decision, researchers, and journalists, in twelve languages. Its job is to make public numbers legible and trustworthy. It does that with a cool neutral ground, soft cards one step above it, a single indigo accent, and color kept for data.

## Principles

- **Data carries the color.** Chrome stays neutral. `primary` marks the one current choice or action on screen. `chart-*` colors appear only in charts, legends, and the stat-tile badges that echo them.
- **Explain every figure.** Every chart says in one sentence what it counts. Every estimate calls itself an estimate and can show its working.
- **Dark is a selection, not an inversion.** Each color has its own dark value, chosen by hand; nothing is derived by flipping lightness.
- **Twelve languages, one layout.** Text wraps before it truncates, figures go through the locale formatters, and no string is drawn into an image.
- **Motion settles, then stops.** Elements ease into place once. Only loading indicators loop, and every animation is skipped under `prefers-reduced-motion`.

## Content

### Voice

Write like a careful public-sector statistician who also answers email. Say what a number is, where it comes from, and what it does not tell you. Prefer the concrete noun to the abstract one.

- Chart descriptions are one sentence that names the measure: "Applications carried over and received each month, against the volume the bureaus completed and the share of it that was approved."
- The estimator speaks to the reader as "you": "≈ 91,380 ahead of you", "Edit your application details". Everything else stays impersonal.
- Notices open with a bold lead-in that ends in a colon, then one or two plain sentences: "**Possibly past due:** Based on expected processing rates, completion of this application may be past due."
- An estimate is always labelled as one: "This is an **estimate** based on current processing rates, expected queue position, and pending applications."
- No emoji, no exclamation marks, no hype. ("Copied!" is the one exception in the catalogue and should lose its mark.)

### Casing

- Title Case is for names: views ("Intake & Processing", "Residence Status Mix"), tools ("Processing Time Estimator"), datasets ("Application Processing", "Resident Population").
- Everything else is sentence case: labels, buttons, headings, notices, menu items. Examples: "Estimated completion", "Reset filters", "View data table", "Time range".
- Write eyebrow labels in sentence case in the catalogue and let CSS uppercase them, so the string still reads correctly where uppercase has no meaning (Japanese, Chinese, Korean).

### Numbers and symbols

- Format every figure with the locale formatters (`formatters.number`, `percent`, `compactNumber`, `monthYear`, `mediumDate`, `longDate`). Never concatenate digits yourself.
- Set figures in tabular numerals so columns and count-ups do not jitter.
- Signed deltas use a true minus (U+2212) and an explicit plus: "−17.3% MoM", "+1.7% vs previous half".
- Join facts with a spaced middle dot: "± 8 days · based on 6 months of throughput", "Shinagawa · Extension · Sep 1, 2026".
- Ranges use a spaced en dash: "Nov 2020 – Oct 2025". Approximations use "≈", spreads "±".
- Use the ellipsis character "…" in loading copy ("Loading dashboard…").

### Vocabulary

Use the dashboard's terms exactly; they double as CSV column headers.

| Term | Meaning |
| --- | --- |
| Bureau | One of the Regional Immigration Services Bureaus, or "Nationwide" for all of them. Airport offices are branches with their own codes. |
| Application type | Status Acquisition (ACQ), Extension of Stay (EXT), Change of Status (CHG), Permission for Activities (ACT), Re-entry (RET), Permanent Residence (PR). |
| Carried over · Received · Processed | The monthly queue: applications waiting from last month, new this month, completed this month. |
| Granted · Denied · Other | How processed applications ended. |
| Approval rate | Granted ÷ processed, the same definition in the tile, the Outcomes gauge and the Intake line. |
| Residence status (在留資格) | 43 statuses, rolled into six purpose-of-stay groups: work, training, study, family, residency, other. |
| Period | Residents data is published every half-year (June and December), so its ranges are named in years. |

### Attribution

Credit the source on every page: "Official statistics provided by the Immigration Services Agency of Japan" and "Data acquisition provided by e-Stat", linked. When generated fixture data is showing, say so in the footer.

## Visual foundations

### Color

- Set the page on `background` and every panel on `card` with a 1px `border` and `shadow-soft`. Floating panels (menus, popovers, tooltips, hover cards) use `popover`.
- Text: `foreground` for figures, titles and body; `secondary-foreground` for labels and secondary copy; `muted-foreground` for metadata. All three reach 4.5:1 on every surface in both themes; `muted-foreground` is lowest, at 4.88:1 on `muted` in light.
- `primary` is the one accent. A selected option is a `primary` fill with `primary-foreground` text (pills, view toggles) or a 10% `primary` tint with a 40% `primary` border and `primary` text (option rows, the pressed airport toggle). The estimate card is a 5% tint with a 25% border.
- `success`, `warning` and `destructive` carry meaning, never decoration, and always travel with a word or icon. Deltas are graded by what the metric means: pending going up is a `warning`, granted going up is a `success`, a resident stock moving is neutral `muted-foreground`.
- Charts use `chart-1` to `chart-8` in fixed order for categories, `chart-mix-1` to `chart-mix-6` for hierarchies, and `bureau-*` for regional identity. Details and caveats are in Data visualization.
- The site mark keeps its own two colors, `hinomaru` on `hinomaru-field`, in both themes.
- Both themes are complete palettes. The theme is a class on `<html>` (`.dark`), set by next-themes from the system preference unless the reader picks one.

### Type

- Set everything in the `sans` stack: Inter Variable for Latin and digits, Noto Sans JP Variable for kana and kanji, falling back per glyph. Body text uses Inter's `cv11` alternate.
- Use the named styles: `display-figure` for the headline number, `title-section` for chart and dialog titles, `title-app` once in the header, `control` for buttons and rows, `body` and `body-small` for text, `eyebrow` for labels over values, `micro` for footnotes, `chart-axis` for ticks.
- `body-small` (12px) is the dashboard's working size. `micro` (10px) is the floor; never set Japanese running text at 10px.
- Headings wrap before they truncate. Tile titles clamp to two lines with `break-words`, because long translations ("Concedidas", "PENDIENTES") have no space to break at.

### Space and layout

- Build on the 4px scale: `space-2` between related controls, `space-3` for control padding and tile gaps, `space-4` between cards, `space-5` to `space-6` inside panels as the viewport grows.
- The shell is one column of cards inside a `layout-max-width` container with `gutter-phone`, `gutter-tablet` and `gutter-desktop` side padding, under a `header-height` band.
- From `breakpoint-lg` the estimator becomes a sticky sidebar of `sidebar-width` (`sidebar-width-xl` from `breakpoint-xl`), collapsible to a `rail-width` rail; below it, the estimator is a bottom sheet opened from a sticky bar.
- The stat row is a filled 2 + 3 mosaic on phones and one row of five from `breakpoint-md`. Residents tiles stay four across at every width.
- The filter bar sizes against its own width with container queries (`@lg`, `@2xl`), because the sidebar narrows it without any viewport change.
- Nothing scrolls sideways except a data table inside its own frame.

### Shape and depth

- Radius steps: `radius-md` for controls, `radius-lg` for tracks, square icon buttons and floating panels, `radius-xl` for cards, `radius-full` for pills, round icon buttons and progress bars. Never write an arbitrary pixel radius.
- Depth is soft and low: `shadow-soft` at rest, `shadow-soft-lg` on hover and for floating readouts. The vendored primitives still use Tailwind's neutral `shadow-md` and `shadow-lg`.
- Borders are 1px hairlines in `border`, which is decorative, or `input` on form controls, which meets 3:1 because the edge is what marks a control. Dashed `border` marks an empty state or a summary row that stands in for hidden inputs.

### States

- Hover: outline controls and rows fill with `muted` (menus with `accent`); text links and disclosures fade to 80% opacity.
- Focus: a solid 2px `ring` outline, offset 2px. Some vendored primitives still draw a 50% ring that misses 3:1; see Audit.
- Pressed and selected: set `aria-pressed` or `aria-selected` and show it with the selected treatments above, never with color alone.
- Disabled: 50% opacity with a not-allowed cursor.
- Loading: a spinning `Loader2` in `primary` with a one-line message; charts draw their own skeleton sweep.
- Empty: a dashed `border` box with one `muted-foreground` sentence ("No data for this combination of filters.").

### Motion

All app motion goes through `src/lib/motion.ts` (Anime.js 4), which skips it under `prefers-reduced-motion`. The vendored charts animate with motion/react and handle reduced motion themselves.

| Moment | Motion |
| --- | --- |
| First paint | Cards rise 14px and fade in, 550ms, staggered 70ms, ease out(3). |
| Switching charts | The chart panel fades and rises 10px, 380ms, ease out(2). |
| Stat values | Count up from the previous value, 800ms, ease out(3). |
| New estimate | The result card settles from 97.5% scale and 40% opacity, 450ms. |
| Queue bar | Fills from zero, 1,100ms after a 150ms delay. |
| Active tab label | Expands its width and fades in, 300ms. |
| Disclosures | Height transitions from tw-animate-css. |

## Iconography

- Use lucide-react (1.x) outline icons at their default 2px stroke. Take them from the library; never draw a substitute.
- Sizes: `icon-md` (16px) in buttons, tabs and rows; `icon-sm` (14px) beside 12px text and in tile badges; `icon-xs` (12px) inline in links.
- Icons are `aria-hidden`. The control carries a visible label, an `sr-only` label or an `aria-label`.
- One icon, one meaning. The Icons group lists the meanings in use; two collisions (Scale, LineChart) are called out there.
- The GitHub mark is vendored from simple-icons (CC0) and is the only third-party brand glyph.
- The site mark is the hinomaru (Logos group): a crimson disc three-fifths of the hoist on a white field with rounded corners and a hairline outline. Keep its real colors in both themes and show it at 36 × 24px or larger.

## Using this system

- Token names are the app's CSS custom properties, and each color is also a Tailwind utility (`bg-card`, `text-muted-foreground`, `border-border`). A color used as a utility must be registered as `--color-<name>` in the `@theme inline` block of `src/index.css`; unregistered ones compile to nothing.
- In the app, build with the vendored primitives in `src/components/ui` and the shared components in `src/components/common`. The previews in this system are static renditions of those components in `components/bundle.css` (`cg-` classes); each component's guidelines name the source file.
- Every visible string comes from the catalogue in `src/i18n/locales`. Keep a sentence with an inline link as one entry and substitute the link with `<T>`.
