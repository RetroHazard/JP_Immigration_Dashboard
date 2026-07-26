#!/usr/bin/env node
/**
 * Vendors Bklit UI registry items from a local clone of bklit/bklit-ui into
 * this project, mimicking `npx shadcn add @bklit/<item>` (which is blocked by
 * the network policy here). Resolves registryDependencies recursively, copies
 * files, and prints the npm deps that must be installed.
 *
 * Usage: node vendor-bklit.mjs <clone-dir> <project-dir> <item> [item...]
 */
import { cpSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const [cloneDir, projectDir, ...items] = process.argv.slice(2);
if (!cloneDir || !projectDir || items.length === 0) {
  console.error('usage: node vendor-bklit.mjs <clone-dir> <project-dir> <item> [item...]');
  process.exit(1);
}

const uiPkg = join(cloneDir, 'packages/ui');
const registry = JSON.parse(readFileSync(join(uiPkg, 'registry.json'), 'utf8'));
const byName = new Map(registry.items.map((i) => [i.name, i]));

const wanted = new Set();
function resolve(name) {
  const bare = name.replace(/^@bklit\//, '');
  if (wanted.has(bare)) return;
  const item = byName.get(bare);
  if (!item) throw new Error(`registry item not found: ${name}`);
  wanted.add(bare);
  for (const dep of item.registryDependencies ?? []) resolve(dep);
}
items.forEach(resolve);

const files = new Set();
const deps = new Set();
for (const name of wanted) {
  const item = byName.get(name);
  for (const f of item.files ?? []) files.add(f.path);
  for (const d of item.dependencies ?? []) deps.add(d);
}

let copied = 0;
for (const rel of files) {
  const src = join(uiPkg, rel);
  // src/charts/foo.tsx -> src/components/bklit/charts/foo.tsx
  // src/lib/utils.ts stays at src/lib/utils.ts (shared with shadcn cn())
  const destRel = rel.startsWith('src/lib/')
    ? rel
    : rel.replace(/^src\//, 'src/components/bklit/');
  const dest = join(projectDir, destRel);
  if (rel === 'src/lib/utils.ts' && existsSync(dest)) continue;
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
  copied++;
}

console.log(`items: ${[...wanted].join(', ')}`);
console.log(`copied ${copied} files`);
console.log(`npm deps: ${[...deps].join(' ')}`);
