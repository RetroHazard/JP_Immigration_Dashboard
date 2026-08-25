# Changelog

All notable user-facing changes to the Japan Immigration Bureaus Statistics Dashboard are documented in this file, grouped by month. The dashboard's header shows the currently deployed version.

## 2026-08

### Added

- **v1.4.4**: The header now links to the project's source repository, next to the theme toggle on desktop and under About in the mobile settings drawer

- **v1.4.0**: Three more views join the Resident Population dataset, alongside a filtering overhaul —
  - **Population Growth** stacks total foreign residents per half-year since 2012, toggleable between purpose-of-stay and world-region breakdowns, with markers for policy changes and the COVID-19 dip
  - **Resident Flows** is a three-column sankey — region into country into purpose-of-stay group — showing the full nationality × status cross-tabulation for a single snapshot
  - **Residence Status Mix** is now a sunburst instead of a treemap: status groups as the inner ring, individual statuses as the outer, click to zoom
  - The status filter now groups the 39 individual residence-status codes into 6 purpose-of-stay categories (work, training, residency, and so on); a nationality filter cascades from a new world-region filter, so picking a region narrows the country list to match. Old permalinks built from the individual status codes still resolve, mapped onto their group automatically
  - The resident population's share of Japan's total population is now part of the stats summary, using the Statistics Bureau's annual estimates as the denominator
  - **Origins Over Time**, **World Origins**, and **Biggest Movers** are unchanged from v1.3.0; a new snapshot-period picker replaces the range picker on the views that show a single point in time rather than a window

- **v1.3.0**: A second dataset — **Resident Population** — joins the existing processing statistics, behind a switch above the chart tabs —
  - Answers a different question from the rest of the dashboard: not how fast applications are processed, but who actually lives in Japan and on what visa. 202 nationalities across 43 residence statuses, every half-year from December 2012
  - **Origins Over Time** tracks the largest nationalities across the whole period; **Residence Status Mix** breaks a nationality's visas down by purpose of stay; **World Origins** shades a world map by country of origin; **Biggest Movers** ranks the largest gains and losses between two points in time
  - The 2015 recategorization that split 韓国・朝鮮 into 韓国 and 朝鮮 is folded back into one line, so it reads as the reporting change it was rather than half a million people leaving and two new populations appearing
  - Country and continent names come from your browser's own locale data, so all twelve languages get them without a hand-written translation apiece
  - Existing links keep working exactly as they did — the dataset is worked out from the chart a link names, not from a new parameter
  - Views that only make sense for application processing — the processing-time estimator, the airport-office toggle, bureau comparison, and the data table — are hidden on this dataset rather than shown doing nothing

- **v1.2.7**: Korean, Chinese (Simplified and Traditional), Vietnamese, and Tagalog join the six existing languages — twelve full translations end to end ([#69](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/69)) —
  - Korean and both Chinese variants write bureau and prefecture names in their own script throughout, not romanized forms, the same standard Japanese already sets
  - Tagalog is the only one of the twelve besides English that inflects for plural count; Korean, Chinese, and Vietnamese use one form regardless of count, the same as Japanese
  - Numbers, dates, and pluralized phrases follow each language's own rules, the same as every other locale

- **v1.2.5**: French, German, Italian, Portuguese, and Spanish join Japanese in full translation — the switcher now offers six languages end to end ([#69](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/69)) —
  - Every interface string is translated in all five: chart labels and tooltips, the data table, the estimator, and empty/error states, alongside the text already covered
  - Portuguese follows European usage (pt-PT) rather than Brazilian
  - Numbers, dates, and pluralized phrases follow each language's own rules, the same as every other locale
  - Bureau and application-type abbreviations (the terminal-style `CTS`, `EXT`-style codes) are left in Latin script where that's how each language actually renders them, rather than forced into an artificial translation

### Changed

- **v1.6.0**: The estimator's "Show the math" breakdown now shows how every figure in it is reached, not just the last three steps —
  - Five steps instead of three, ordered so that no symbol is used before the step that defines it. The daily processing rate used to be introduced in step 2 and then relied on by step 1
  - Each derived value now shows its own working — the carry-over, the pro-rated figures for your application month, the processed-since totals, and the ± spread beside the result, none of which had a formula before
  - Where the model takes a different route because a month has not been published yet, the breakdown shows the route your estimate actually took rather than a general form
  - Figures inside the formulas now use your own language's digit grouping, and the queue position no longer rounds its parts separately from its total, which could leave the subtraction on screen one short of the answer beside it
  - Opening the breakdown folds the bureau, type and date inputs away, leaving a single row naming the three you picked — tap it to bring them back. The derivation is long enough that on a phone it otherwise started below the fold

- **v1.5.0**: On phones and tablets, chart tooltips are now opened by tapping rather than by holding a finger down —
  - Holding was the only way to see a value, and letting go dismissed it, so a reading could never be held still long enough to compare against anything. A tap now pins the tooltip open; tap the same point again to close it, or another point to move it. Tapping outside the chart, scrolling, or opening a tooltip on a different chart also closes it, so only ever one is on screen
  - Most charts had no touch handling at all and were relying on the mouse events a browser invents after a tap. That is why a tooltip would sometimes flash and vanish, or stay stuck on the wrong point: the map, both sankeys, the bureau-share ring, the treemap, and the efficiency ranking are all covered now
  - The time-series charts blocked page scrolling anywhere over the plot area, which on a phone is most of the screen. They no longer do
  - Where a tap had to mean two things, it now means them in order: on the treemap and the Residence Status sunburst, the first tap shows the figures and a second tap on the same tile or segment zooms in. Previously a single tap zoomed, which moved the thing you tapped out from under your finger before you could read it
  - A tooltip opens above the point you tapped rather than across the middle of the chart, and is capped to the width of its card so a long bureau or nationality name can't push it off the edge. On a phone the plot is shorter than the tooltip is tall, so the old placement covered the data it was describing and ran into the date axis, with your finger on whatever was left
  - Nothing changes with a mouse or trackpad: hover, the drag-to-select range, and every existing keyboard shortcut behave exactly as before. The switch keys off whether the device has a hovering pointer at all, not window width, so a narrow desktop window keeps hover

- **v1.4.4**: The Regional Map's zoom and reset buttons are gone — a holdover from the map's previous implementation that the World Origins map never had. Both maps now work the same way: scroll wheel or pinch to zoom, drag or two-finger drag to pan.

- **v1.2.6**: The language switcher is now a compact button that opens a list, in both the desktop header and the mobile settings drawer, instead of always showing every language at once —
  - The desktop header previously spelled out all seven language names side by side in one non-shrinking pill; at native-name lengths it crowded the app title from 640px wide up, in every language including English
  - The mobile settings drawer had the same problem in miniature — a stack of language rows that grew taller with every language added, pushing Theme and About further down each time
  - Both now cost a fixed amount of header/drawer space no matter how many locales are registered, so adding a language no longer reshuffles the layout around it

### Fixed

- **v1.5.0**: Clicking a chart with a mouse no longer disturbs the tooltip you were reading —
  - On the four line and bar time-series charts, pressing the mouse button hid the tooltip and it stayed hidden until you moved the cursor again. A press had to be treated as the start of a drag-to-highlight, because there was no way yet to tell the two apart. A drag now only begins once the cursor has actually travelled a few pixels, so a click leaves the tooltip exactly where it was and dragging a range still works as before
  - On the Processing Efficiency ranking, clicking a row tore its card away from the cursor and re-anchored it above the row, because clicking a row also focuses it and focusing was meant for keyboard use. Keyboard navigation still opens the card that way; a mouse click now leaves it alone
- **v1.5.0**: The hint under the Category Mix and Residence Status sunbursts ("Click a segment to zoom in · hover to inspect") was in English in every language. It is now translated, and reads differently on touch, where neither "click" nor "hover" describes anything you can do.
- **v1.4.4**: The Regional Map was sluggish to pan and zoom, and close to unusable on a phone — both are fixed —
  - Panning and zooming re-drew the entire map from scratch on every frame, and hovering a prefecture tore down and rebuilt all 47 shapes. Neither is needed: the map now redraws only what actually changed, which takes dragging from roughly 300ms a frame to a steady 60fps, and a great deal more than that on a phone
  - On a phone the map used to swallow the page scroll, so a finger landing on it left you stuck. One finger now scrolls the dashboard as it should, and two fingers pan and zoom the map
  - Tapping a prefecture on a touch device did nothing, because the map only ever listened for a mouse. Tapping one now opens its details, and tapping the sea closes them again
  - Zooming in thickened every prefecture border along with the shapes, until at the deepest zoom the outlines all but swallowed the prefectures they were outlining. Borders now stay the same hairline width at every zoom level, on both maps
  - Panning could throw the map clean out of its card, leaving an empty box and no obvious way back — worse since there is no longer a reset button. Both maps are now bounded: you can always see the map, and once zoomed in you can no longer wander off into open sea
  - The map's shape data carried far more coastline detail than a screen can show — enough for roughly nineteen points per pixel on a phone. It has been thinned to what actually renders, which also cuts the download from 416KB to 160KB. The map looks the same

- **v1.4.3**: Hovering the Population Growth chart drew a dot per series that sat below its own bar segment, bunched near the bottom of the plot, in both the by-purpose and by-region views. The dots are gone — the highlighted bars and the tooltip already give every value, and the dots only offered a second, wrong reading of them. Intake & Processing had the same problem on its two stacked bars; there the dot survives on the completed-applications line, where it tracks the line correctly.
- **v1.4.2**: World regions showed up as raw codes — `region.1000` instead of "Asia" — on Chrome and Edge, in every language. It affected the Resident Flows sankey's left column, the region filter, Population Growth's by-region view, and the Residence Status sunburst; "Stateless" was the only region that read correctly —
  - Continent names were being taken from the browser's own locale data, the same as country names. That works for countries everywhere, but Chrome and Edge ship no names for continents specifically, so they handed back the code they were given. Firefox and Safari were unaffected, which is what kept this out of sight
  - All seven regions are now written into each of the twelve translations, so they read the same whichever browser you use
- **v1.4.1**: The Intake & Processing and Application Types charts' axis labels and tooltips showed only month and day, dropping the year — ambiguous once a range spans more than one year, since every January looked the same. Both now show month and year instead.
- **v1.2.6**: Chart axis numbers could render as clipped or outright wrong values in German, Portuguese, Spanish, and Italian — repeated "0.000" ticks, a leading digit sheared off ("800 mil" reading as "00 mil"), or no labels at all on narrow screens. Two causes stacked together: a CSS rule was silently re-clipping an intentional label overflow, and the axis margin was sized for English-length numbers ("1.2M") rather than the wider forms other locales use ("1,2 Mio.", "800 mil"). The margin now measures each locale's actual label width instead of assuming one —
  - Longer translations in KPI cards, the processing-time estimator heading, and the approval-rate gauge caption no longer lose characters at cramped widths — they wrap instead of silently truncating, or were shortened where that read better
  - The Outcomes Sankey chart's node-label margins are sized the same way, fixing German and Portuguese labels that clipped against the chart edge

## 2026-07

### Added

- **Japanese**: the dashboard is now fully available in Japanese, and the language switcher is live —
  - All 330 interface strings are translated, using the Immigration Services Agency's own terminology: application types carry their official procedure names (在留資格変更許可申請 rather than a paraphrase), and each bureau its full office name including branch status (東京出入国在留管理局横浜支局). Prefecture names match the map data exactly, so the map tooltip no longer prints the same name twice
  - The switcher appears in the header and the mobile settings drawer, and a visitor whose browser asks for Japanese now lands on it — it stayed hidden while Japanese was a five-string stub, which is what the flag was waiting for
  - Numbers, dates, and counted phrases already followed the language; they now read as Japanese throughout — 万 and 億 on chart axes, 2026年9月22日 for dates, and 6か月 without an English plural
  - Bureaus and application types gained a third, narrower name for the dense charts. Without it every Tokyo-area office truncated to the same 「東京出入国在留」 in the Processing Efficiency ranking, which made them impossible to tell apart. English is unaffected — it says the same thing at both widths
  - Fixed three things that only surfaced once the interface was actually rendering Japanese: the Category Mix tooltip fell back to a font with no Japanese glyphs, animated numbers reverted to the browser's language mid-animation, and a chart axis label wide enough to wrap dropped 万 onto its own line
- **v1.2.0**: Groundwork for multiple languages —
  - Chart y-axis labels read better in English as a side effect of this work: a million now shows as "1M" instead of "1000k"
  - The language switcher is being rebuilt, but stays hidden until a language is actually ready — Japanese still only covers a handful of strings. `?lang=ja` continues to work for testing
  - Full translations aren't ready yet, but the interface — text, tooltips, numbers, dates, and pluralization — is now built to support them, so more languages can follow without a rewrite
- **v1.1.0**: Refinements on top of the Civic Glass redesign —
  - Processing Efficiency swapped to a ranked lollipop chart — bureaus ordered by completion rate, stem weight carrying intake volume, against a nationwide-rate guide line
  - A global airport toggle in the filter bar: one click removes the airport branch offices (Narita, Haneda, Kansai, Chubu) from every chart, stat, and table — nationwide totals shrink accordingly instead of quietly still counting them, and the toggle's icon crosses out while engaged
  - Chart tab bar collapsed to icons, with the active tab expanding to show its label, so it never needs horizontal scrolling
- **v1.0.0**: Civic Glass — a complete visual and technical redesign, marking the dashboard's first official production release —
  - Rebuilt on Tailwind CSS v4, shadcn/ui, and a vendored Bklit chart library, with a new design system, dark mode carried through every surface, and Anime.js-driven motion (a single reduced-motion chokepoint for accessibility)
  - Single unified dashboard shell with labeled chart tabs and shareable URL state for filters, chart selection, and the estimator
  - Two new charts — Outcomes (Sankey flow into granted/denied/other, plus an approval-rate gauge) and Processing Efficiency (bubble chart) — alongside a rebuilt interactive Regional Map and a per-bureau Category Mix view
  - Bureau-to-bureau comparison mode with side-by-side charts
  - Reworked Processing Time Estimator: collapsible on desktop, a bottom sheet on mobile, a reset button, a LaTeX-rendered formula breakdown, and a shareable permalink for a filled-out estimate
  - Mobile-first pass: a no-scroll summary card mosaic and a settings drawer for theme, language, and the changelog
  - A full data table + CSV export alternative to every chart, plus an accessibility pass (keyboard navigation, screen-reader labels)
  - An i18n scaffold (currently English/Japanese) to support additional languages going forward
- **v0.8.0**: Added a Changelog modal, opened from the version link in the header.
- **v0.7.0**: Added a permalink button to the Processing Time Estimator —
  - Share a filled-out estimate (bureau, application type, and date) via a copyable link
  - Opening a permalink automatically expands the estimator with those filters pre-filled
  ([#45](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/45))

### Changed

- **v1.2.0**: The estimator's completion date now follows the chosen language's date order (English reads "Sep 22, 2026" where it previously read "22 Sep 2026") — the old form was assembled by hand and couldn't reorder for languages that need a different one.
- **v1.1.0**: Hid the language switcher — the Japanese translation only covers a handful of strings so far, and full localization is planned as its own initiative rather than something to expose partially in the meantime.
- Updated prefectural population data on the Regional Map to the Statistics Bureau of Japan's official October 1, 2024 estimates. ([#52](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/52))

### Fixed

- **v1.1.2**: The Outcomes Sankey chart's tooltip labelled application counts "Sessions" — a leftover from the chart library's web-analytics defaults — instead of "Applications".
- **v1.1.1**: The Processing Efficiency chart clamped its axis at 100%, so bureaus clearing backlog above 100% all pinned to the right edge at the same position — the axis now scales past 100% to fit the highest rate. ([#57](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/57))
- **v1.1.0**: Layout and estimator fixes —
  - The formula breakdown listed its steps in reverse — the final calculation was shown first, ahead of the values it depends on
  - The filter bar's controls wrapped and crowded each other at the layout widths where the estimator sidebar narrows the panel
  - The outcomes Sankey chart's layout broke down on narrow and mobile viewports
- Fixed aggregate bureaus (Osaka, Fukuoka, Nagoya, Shinagawa) briefly showing inflated processing-time estimates when a branch office's data hadn't been published yet for the period. ([#44](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/44))

## 2026-02

### Added

- Added a friendly error screen instead of a blank page if the app hits an unexpected error. ([#36](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/36))

### Changed

- Improved tooltips: added touch support on mobile, and map tooltips now follow the cursor. ([#39](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/39))

### Fixed

- Fixed the intake/processing bar chart's Y-axis scaling when overlaying processed applications. ([#37](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/37))
- Filter selections now only apply to charts that actually support them, instead of leaking to charts they shouldn't affect. ([#40](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/40))

## 2025-10

### Changed

- **v0.5.2**: Renamed the Tokyo bureau to Shinagawa for clarity, and added the Kobe Branch Office as its own entity instead of folding it into Osaka's totals.
- Refreshed prefectural population statistics with 2024 data.

### Fixed

- **v0.5.1**: Fixed duplicated application figures in the Tokyo, Osaka, Nagoya, and Fukuoka bureaus, caused by e-Stat publishing branch totals that were already counted in the parent bureau's figures. ([#31](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/31))

## 2025-05

### Changed

- **v0.4.4**: Average processing-rate estimates now use the most recent 6 months of data, for better accuracy. ([#28](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/28))
- Reintroduced the formula/calculation details for applications already past their estimated completion date.

## 2025-04

### Fixed

- **v0.4.3**: Fixed a double-counting bug in the processed-applications estimate.
- **v0.4.2**: Simplified the estimation formula, fixing abnormal results that could occur when an application date shifted across a month boundary. ([#25](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/25))

## 2025-03

### Fixed

- **v0.3.2**: Fixed a discrepancy between the estimated completion date shown and the formula details displayed for the same application.

## 2025-02

### Added

- **v0.3.1**: A large feature release —
  - Refined the calculation model for more accurate monthly and daily estimates
  - Added four new charts: Bureau Distribution Ring, Bureau Performance Bubble, Monthly Radar, and Category Submissions
  - Added an interactive choropleth map of Japan for visualizing bureau and prefecture data
  - Rendered formulas with LaTeX for readability
  - Upgraded tooltips, including formula explanations
  - Improved accessibility for screen readers
  ([#21](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/21))

## 2025-01

### Added

- **v0.2.2**: Follow-up UI polish.
- **v0.2.1**: Mobile-first responsive design and dark mode —
  - Mobile-friendly layout with native breakpoints
  - Dark mode with a toggle switch
  - Drawer-style Estimation Card and tooltips on mobile
  ([#10](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/10))
- Initial launch: application-intake bar chart, Estimation Card, Filter Panel, and Stats Summary, with a collapsible details pane showing the underlying formula.

### Fixed

- **v0.1.2**: The Estimation Card no longer shows no details when an application's completion date is already past due. ([#5](https://github.com/RetroHazard/JP_Immigration_Dashboard/pull/5))
- **v0.1.1**: Added guidance text for the month picker on Safari (macOS), which didn't natively support that input type at the time; fixed the displayed "Last Updated" date so it reflects the actual build instead of updating every time the page loads.
