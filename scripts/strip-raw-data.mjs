#!/usr/bin/env node
// Removes the raw e-Stat payloads from the static export. They are build inputs
// (and the Actions cache) and never ship; the client loads the compact files in
// public/data/.
import { rmSync } from 'node:fs';

rmSync('build/datastore', { recursive: true, force: true });
console.log('✓ stripped raw datastore from export output');
