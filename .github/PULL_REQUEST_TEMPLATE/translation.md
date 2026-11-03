<!--
For correcting wording in an existing locale. A one- or two-line fix doesn't need an issue first.
Adding or removing keys is a code change: use the default template instead.
See CONTRIBUTING.md, "Localization", and src/i18n/README.md.
-->

## Language

<!-- e.g. ja (Japanese), vi (Vietnamese) -->

## What changed

<!-- Catalogue key(s), or the on-screen text if you don't know the key. Add rows as needed. -->

| Key | Before | After |
| --- | --- | --- |
| | | |

## Why

<!--
What was wrong (mistranslation, wrong terminology, awkward phrasing, wrong register) and why the
replacement is right. Citations help: official Immigration Services Agency terminology, a style guide, etc.
-->

## Fluency

- [ ] I'm a fluent or native reader of this language
- [ ] I'm not. Please get a second opinion from a fluent reader

## Checklist

- [ ] Only edited `src/i18n/locales/<code>.ts`. No keys added, removed or renamed
- [ ] `npx vitest run src/i18n` passes (placeholders intact, no blank values, script check for `ja`/`ko`/`zh-CN`/`zh-TW`)
- [ ] Placeholders such as `{count}` and plural forms are unchanged
- [ ] If the key is a `metric.*` name: I know it is also written into CSV export headers, and the change is worth that
- [ ] Checked the new text fits where it renders, in the dashboard at phone width

## Screenshot (optional)

<!-- The corrected text in context, if it's somewhere visible. -->
