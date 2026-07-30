// scripts/localeTemplate.ts
// The transform behind `npm run i18n:template`, kept apart from the CLI so the
// catalogue tests can import it and assert the committed template is current.
// See scripts/generate-locale-template.mts for the command itself.

/** Paths the template pipeline reads and writes, relative to the repo root. */
export const EN_RELATIVE = 'src/i18n/locales/en.ts';
export const TEMPLATE_RELATIVE = 'src/i18n/locales/_template.ts';

const HEADER = `// src/i18n/locales/_template.ts
// TEMPLATE — not a locale. Nothing imports this file and the registry does not
// list it; it exists to be copied.
//
// GENERATED from en.ts by \`npm run i18n:template\`. Do not edit it by hand —
// regenerate it instead, or your changes will be overwritten.
//
// To start a language:
//   1. Copy this file to <code>.ts (ko, zh, vi, pt — the code the language is
//      normally written with) and rename the exported constant to match.
//   2. Uncomment the lines you have translated and replace the English value.
//      Leave the rest commented: a missing key falls back to English, which
//      reads better than a blank space or a half-translated sentence.
//   3. Register it in index.ts, starting at status: 'in-progress'.
//   4. Run \`npx vitest run src/i18n\` and \`npx tsc --noEmit\`.
//
// Rules the catalogue tests enforce (see README.md):
//   - Keep every {placeholder}. You may reorder them, and often should.
//   - Never leave a value empty — re-comment the line instead.
//   - Underscores mark plural families. Translate the members your language
//     actually uses; \`_other\` alone is correct for a language that does not
//     inflect for number, and anything absent falls back to it.
import type { Dictionary } from '../types';

export const template: Dictionary = {
`;

/** True for the first line of a `'key': value` entry. */
const isEntryStart = (line: string): boolean => /^\s{2}'[^']+':/.test(line);

/** True once the accumulated entry has been closed off by its trailing comma. */
const isEntryEnd = (line: string): boolean => line.trimEnd().endsWith(',');

/**
 * Comments a line out at the object's own indent, keeping whatever extra
 * indentation it carried. Entries wrapped onto a second line stay visibly
 * attached to their key instead of jumping to column zero.
 */
const commentOut = (line: string): string => {
  const indent = line.length - line.trimStart().length;
  return `  // ${' '.repeat(Math.max(0, indent - 2))}${line.trimStart()}`;
};

/**
 * Rewrites the English catalogue source into the contributor template.
 * Section banners and blank lines survive verbatim so the template reads in
 * the same order, and by the same groupings, as the file it mirrors.
 */
export const buildTemplate = (source: string): string => {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.startsWith('export const en'));
  if (start === -1) throw new Error('en.ts: could not find the catalogue declaration');

  const body: string[] = [];
  let inEntry = false;

  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('}')) break;

    if (inEntry) {
      body.push(commentOut(line));
      if (isEntryEnd(line)) inEntry = false;
      continue;
    }

    if (isEntryStart(line)) {
      body.push(commentOut(line));
      inEntry = !isEntryEnd(line);
      continue;
    }

    // Section banners, explanatory comments, and the blank lines between them.
    body.push(line);
  }

  // Drop trailing blank lines so the closing brace sits tight against the last
  // entry, the way a hand-written locale file would.
  while (body.length > 0 && body[body.length - 1].trim() === '') body.pop();

  return `${HEADER}${body.join('\n')}\n};\n`;
};
