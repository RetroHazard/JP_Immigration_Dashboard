// scripts/vendor-bklit.mjs overwrites the vendored Bklit tree wholesale, so
// every local divergence is re-applied by hand from ARCHITECTURE.md. A file
// missing there is a change nobody knows to re-apply. The marker comments in
// the source are the source of truth; this checks the prose names them all.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '../../../..');
const VENDORED_DIRS = ['src/components/bklit', 'src/lib'];
const LEDGER = 'ARCHITECTURE.md';
const MARKER = /LOCAL (MODIFICATION|ADDITION)/;

const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.tsx?$/.test(entry) && !full.includes('__tests__')) {
      out.push(full);
    }
  }
  return out;
};

/** Files whose source carries a local-divergence marker. */
const markedFiles = (): string[] =>
  VENDORED_DIRS.flatMap((dir) => walk(join(ROOT, dir)))
    .filter((file) => MARKER.test(readFileSync(file, 'utf8')))
    .map((file) => file.slice(ROOT.length + 1))
    .sort();

/**
 * Every filename the ledger names, with `dir/{a,b}.tsx` shorthand expanded.
 * Two passages are removed first: fenced code blocks, whose backtick runs
 * desynchronise the `…` pairing, and the "Deliberately **not** converted"
 * sentence, whose files were left alone and must not count as documented.
 */
const namedInLedger = (): Set<string> => {
  const prose = readFileSync(join(ROOT, LEDGER), 'utf8')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/Deliberately \*\*not\*\* converted[^\n]*/g, '');
  const names = new Set<string>();
  for (const [, token] of prose.matchAll(/`([^`\n]+)`/g)) {
    const braces = /^(.*?)\{([^}]+)\}(.*)$/.exec(token);
    if (braces) {
      const [, before, list, after] = braces;
      for (const part of (list ?? '').split(',')) {
        names.add(basename(`${before}${part.trim()}${after}`));
      }
    } else {
      names.add(basename(token));
    }
  }
  return names;
};

describe('vendored-divergence ledger', () => {
  it('finds the marked files at all (guards the walker itself)', () => {
    // If a refactor moves the tree, an empty list would make every assertion
    // below vacuously pass.
    expect(markedFiles().length).toBeGreaterThan(10);
  });

  it('names every locally modified vendored file in ARCHITECTURE.md', () => {
    const named = namedInLedger();
    const undocumented = markedFiles().filter((file) => !named.has(basename(file)));
    expect(undocumented).toEqual([]);
  });

  it('tells the reader how to re-derive the list', () => {
    const prose = readFileSync(join(ROOT, LEDGER), 'utf8');
    expect(prose).toContain('LOCAL MODIFICATION');
    expect(prose).toContain('vendor-bklit.mjs');
  });
});
