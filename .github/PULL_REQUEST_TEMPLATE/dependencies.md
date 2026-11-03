<!--
For dependency changes made by hand, such as an npm audit fix, a pinned-package bump or an
Actions version change. Dependabot writes its own PR body and doesn't use this.
See DEVELOPMENT.md, "Managing Dependencies".
-->

## What changed

<!-- Package, old version → new version. Add rows as needed. -->

| Package | From | To | Type |
| --- | --- | --- | --- |
| | | | patch / minor / major |

## Why

<!-- Security advisory (link the GHSA/CVE), a needed fix or feature, peer-dependency alignment, etc. -->

## Breaking changes

<!--
Majors only: link the release notes or migration guide, and list what in this repo had to change
to match. Write "None" for minor and patch bumps.
-->

## Checklist

- [ ] Ran `npm install` (not `--ignore-scripts`) and committed the re-shaken `package-lock.json`. `verify.yaml` fails an unshaken lockfile
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass locally
- [ ] `npm audit` shows nothing new
- [ ] Pinned packages (listed in DEVELOPMENT.md, "Dependency Pinning Strategy") keep exact versions, and the Next.js packages move together
- [ ] Clicked through the dashboard in dev for anything that renders (charts, map, sankey, animations)
- [ ] No `CHANGELOG.md` entry, unless the update changes something users can see
