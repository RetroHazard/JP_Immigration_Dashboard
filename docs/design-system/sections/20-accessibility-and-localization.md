# Accessibility and localization

## The floor

- Text meets 4.5:1 on the surface it sits on, in both themes; text at 24px and above, icons that carry meaning, focus indicators and control boundaries meet 3:1. Each color token's note gives its ratios and names the pairs that miss today.
- Color never works alone. Deltas carry a sign and a word ("MoM", "vs previous half"), notices carry an icon and a bold lead-in, hidden legend series fade and flip `aria-pressed`, and the crossed-out plane shows that airports are excluded.
- Charts are images with a text alternative: `role="img"` plus an `aria-label` on the plot, and a data table for every Application Processing view.

## Keyboard and focus

- The first tab stop is "Skip to content", which jumps to `#main-content`.
- Chart tabs are a real tablist (Radix Tabs): arrow keys move between views, and inactive tabs keep their names through `title` and `sr-only` text even when only the icon shows.
- Dialogs and sheets (Radix) trap focus, close on Escape and return focus to their trigger.
- Processing Efficiency rows are focusable and open the same hover card as the pointer; the Category Mix treemap zooms out with Escape.
- Show focus as a solid 2px `ring` outline offset 2px on every interactive element, including hand-built buttons.

## Screen readers

- A polite live region announces the active view and its scope whenever it changes ("Showing Bureau Share for Nationwide").
- Icon-only controls take an `aria-label` that names the object as well as the action ("Reset the Processing Time Estimator"); the tooltip can stay terse ("Reset the estimator").
- When a visible label exists, the accessible name starts with it (WCAG 2.5.3), as the estimator's summary row does.

## Touch

- Pointer type decides behavior, not width: a device without a hovering pointer gets tap-to-pin tooltips, so a narrow desktop window keeps hover.
- On the treemap and sunburst a first tap shows figures and a second tap on the same segment zooms, so the thing you tapped does not move before you read it.
- One finger always scrolls the page; maps pan and zoom with two.
- Keep hit targets at 28px or larger (`icon-button-sm`); 36px (`control-height`) is the default.

## Motion

Everything in `src/lib/motion.ts` is skipped under `prefers-reduced-motion`, and CSS animations carry `motion-reduce:animate-none`. Nothing flashes, and nothing loops except loading indicators.

## Twelve languages

The catalogue ships English, Japanese, Korean, Simplified and Traditional Chinese, Vietnamese, Tagalog (fil-PH), French, German, Italian, Spanish and European Portuguese.

- **Expansion.** Leave room for strings 30 to 40% longer than English. Titles wrap to a second line, tile titles clamp at two lines with `break-words`, and native selects ellipsize their closed value. Nothing that carries meaning is cut off.
- **Numbers.** Compact numbers vary widely by locale ("1.2M", "1,2 Mio.", "800 mil", "120万"); chart margins are measured per locale.
- **Plurals.** Counted phrases are plural families (`_one`, `_other`, and more where a language needs them). Never build a plural with a conditional in code.
- **Names.** Country names come from the browser's `Intl.DisplayNames`; world regions are written into each catalogue because Chrome and Edge ship no continent names. Bureau and application-type abbreviations (CTS, EXT) stay in Latin script.
- **Sentences with links** stay one catalogue entry, and `<T>` substitutes the link, so translators can reorder freely.
- **CSV headers and file names** stay English whatever the interface language, because people parse them.

## CJK typography

- The `sans` stack puts Noto Sans JP ahead of the system fonts for every locale. That is right for Japanese. For Simplified and Traditional Chinese, Han characters then render in Japanese glyph forms, and Korean Hangul falls through to whatever system font the reader has. The Roadmap proposes per-language stacks under `:lang()`.
- Uppercase and letter-spacing mean nothing to CJK scripts. The eyebrow's 0.05em tracking should be reset for `:lang(ja)`, `:lang(zh)` and `:lang(ko)`.
- Do not set Japanese, Chinese or Korean running text below 12px; `micro` (10px) is for Latin footnotes and figures.
