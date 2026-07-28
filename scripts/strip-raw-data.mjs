#!/usr/bin/env node
// Removes the raw e-Stat payload from the static export output. The client
// only needs public/data/dashboard.json; the verbose raw file stays a build
// input (and Actions cache artifact) but should never ship to visitors.
import { rmSync } from 'node:fs';

rmSync('build/datastore', { recursive: true, force: true });
console.log('✓ stripped raw datastore from export output');
