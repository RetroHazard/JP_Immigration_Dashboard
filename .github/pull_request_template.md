<!--
Thanks for contributing. Lines inside these comment markers don't show up once the PR is opened.

Using a different template: add ?template=translation.md or ?template=dependencies.md
to the compare URL. Both live in .github/PULL_REQUEST_TEMPLATE/.

For a larger change, open an issue to discuss it first (CONTRIBUTING.md, "Before You Start").
-->

## Summary

<!-- What changed, and why. Name the behaviour the user sees, not just the files. -->

## Related issues

<!-- "Fixes #123" closes the issue on merge. "Refs #123" links it without closing it. -->

## Type of change

- [ ] Bug fix
- [ ] New feature, or a visible change to an existing one
- [ ] Data pipeline or new dataset (`scripts/`, `public/data`)
- [ ] Refactor, no behaviour change
- [ ] Documentation only
- [ ] CI, tooling or repo config

## Screenshots

<!--
UI changes only. Show before and after, in light and dark themes, at phone and desktop widths.
Delete this section if nothing visible changed.
-->

| | Before | After |
| --- | --- | --- |
| Light | | |
| Dark | | |

## Checklist

<!-- Tick what you did. Strike through (~~like this~~) anything that doesn't apply, rather than deleting it. -->

### Checks

- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass locally. CI runs the same four, plus a lockfile check, in `verify.yaml`
- [ ] Tried it in the browser at phone and desktop widths, in both light and dark themes
- [ ] No leftover `console.log` or debugging edits

### Design system (Civic Glass)

- [ ] Followed `docs/design-system/README.md` and the guideline for any component touched (`docs/design-system/components/<Name>/README.md`)
- [ ] Text meets 4.5:1 against its surface, and borders, meaningful icons and focus rings meet 3:1, in **both** themes
- [ ] Any color used as a Tailwind utility is registered as `--color-<name>` in the `@theme inline` block of `src/index.css`
- [ ] If a token changed: updated `docs/design-system/tokens.json` too, and noted that the Civic Glass artifact needs the same change

### Localization

- [ ] No hardcoded copy. Every visible string comes from `src/i18n/locales`
- [ ] New or removed keys are changed in all twelve locale files, not just `en.ts`
- [ ] Ran `npm run i18n:template` after changing keys in `en.ts`
- [ ] Any locale I couldn't translate is listed below (don't paste English in)

### Documentation and version

- [ ] `CHANGELOG.md` entry under the current month, if users will notice the change
- [ ] Bumped `version` in `package.json` **and** the README badge together: minor for features, patch for fixes
- [ ] Added any new or renamed file under `src/` to the file tree in `DEVELOPMENT.md`
- [ ] Gave any new component, module or pattern a section in `ARCHITECTURE.md`
- [ ] Updated `README.md`, `CONTRIBUTING.md`, `DEVELOPMENT.md` or `src/i18n/README.md` where a workflow they describe changed

### From a fork

- [ ] "Allow edits by maintainers" is checked

## Notes for reviewers

<!-- Trade-offs, follow-ups left out of scope, locales you couldn't translate, anything you're unsure of. -->
