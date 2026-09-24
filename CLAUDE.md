# CLAUDE.md

Japan Immigration Statistics Dashboard (dashboard.retrohazard.jp): a statically exported Next.js 15 app (React 19, Tailwind CSS v4, vendored shadcn/ui primitives and Bklit charts) that presents e-Stat immigration data in twelve languages. ARCHITECTURE.md, DEVELOPMENT.md and CONTRIBUTING.md cover the architecture and workflow.

## Commands

- `npm run dev`: dev server. Generates deterministic fixture data when no e-Stat payload is present.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`: the checks CI runs.

## Design system: Civic Glass

Every visual change follows Civic Glass. Read `docs/design-system/README.md` before touching styles or components.

- The live reference is the Civic Glass design-system artifact, https://claude.ai/artifact/NsKDYFNyqQc7AxzVjeoWqF (in the owner's claude.ai account): tokens with previews in both themes, 21 components, icons, logos and screenshots. `docs/design-system/` is a snapshot of its authored files. Change both together.
- Token values live in `src/index.css`. `docs/design-system/tokens.json` mirrors them with usage notes and contrast ratios; update it (and the artifact) whenever a token changes.
- A color used as a Tailwind utility (for example `text-chart-label`) must be registered as `--color-<name>` in the `@theme inline` block of `src/index.css`. Unregistered utilities compile to nothing, silently.
- Text meets 4.5:1 on the surface it sits on in both themes; borders, meaningful icons and focus rings meet 3:1. Check the dark theme too.
- Known gaps, with file references, are in `docs/design-system/sections/80-audit.md`; the order to fix them is in `90-roadmap.md`.
- Component guidelines are in `docs/design-system/components/<Name>/README.md`. Their `preview.html` files are static renditions that render inside the artifact, not app code.
- Every visible string comes from the catalogue in `src/i18n/locales`. Never hardcode copy.
