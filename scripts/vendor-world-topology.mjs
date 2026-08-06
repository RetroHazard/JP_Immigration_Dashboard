#!/usr/bin/env node
/**
 * Vendors the world TopoJSON the World Origins map draws, the same way
 * japan.topo.json is checked in: as a build-independent static asset rather
 * than an npm dependency the client would have to fetch.
 *
 * Source: world-atlas (ISC, Natural Earth 1:110m via Mike Bostock).
 * Run after bumping the version below; the output is committed.
 *
 *   node scripts/vendor-world-topology.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const VERSION = '2.0.2';
const OUT = 'public/static/world.topo.json';

const work = mkdtempSync(join(tmpdir(), 'world-atlas-'));
try {
  execFileSync('npm', ['pack', `world-atlas@${VERSION}`, '--pack-destination', work], { stdio: 'inherit' });
  execFileSync('tar', ['xzf', join(work, `world-atlas-${VERSION}.tgz`), '-C', work]);

  const topology = JSON.parse(readFileSync(join(work, 'package/countries-110m.json'), 'utf8'));
  const geometries = topology.objects.countries.geometries;

  // Natural Earth ships Kosovo, Northern Cyprus and Somaliland without an ISO
  // numeric code, since none has one. Kosovo is the only one e-Stat counts, so
  // it gets the 926 code that is conventionally used for it — matching
  // `iso3n` in src/constants/nationalities.ts. Without this the map silently
  // leaves Kosovo unshaded while the figure exists in the data.
  const kosovo = geometries.find((geometry) => geometry.id == null && geometry.properties?.name === 'Kosovo');
  if (!kosovo) throw new Error('Kosovo feature not found — has the upstream topology changed?');
  kosovo.id = '926';

  const unidentified = geometries.filter((geometry) => geometry.id == null).map((g) => g.properties?.name);
  writeFileSync(OUT, JSON.stringify(topology));
  console.log(`✓ ${OUT} from world-atlas@${VERSION}: ${geometries.length} features`);
  console.log(`  left without an ISO code (not counted by e-Stat): ${unidentified.join(', ')}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
