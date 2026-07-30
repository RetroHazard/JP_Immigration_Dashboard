// scripts/generate-locale-template.mts
// Regenerates src/i18n/locales/_template.ts from the English catalogue.
//
// The template is the file a translator copies to start a language: the whole
// of en.ts with every entry commented out, so uncommenting a line and replacing
// its value yields a valid partial dictionary at any point — a half-finished
// file still type-checks and still passes the catalogue tests.
//
// Run it after adding or removing an English key:
//
//   npm run i18n:template
//
// A test asserts the committed template matches, so a forgotten run fails CI
// rather than leaving contributors a stale list.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTemplate, EN_RELATIVE, TEMPLATE_RELATIVE } from './localeTemplate';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = resolve(ROOT, TEMPLATE_RELATIVE);

writeFileSync(templatePath, buildTemplate(readFileSync(resolve(ROOT, EN_RELATIVE), 'utf8')));
console.log(`Wrote ${templatePath}`);
