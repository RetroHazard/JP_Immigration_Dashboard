// Regenerates src/i18n/locales/_template.ts, the file a translator copies to
// start a language: en.ts with every entry commented out, so a half-finished
// copy is still a valid partial dictionary. Run `npm run i18n:template` after
// adding or removing an English key; a catalogue test fails on a stale template.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTemplate, EN_RELATIVE, TEMPLATE_RELATIVE } from './localeTemplate';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = resolve(ROOT, TEMPLATE_RELATIVE);

writeFileSync(templatePath, buildTemplate(readFileSync(resolve(ROOT, EN_RELATIVE), 'utf8')));
console.log(`Wrote ${templatePath}`);
