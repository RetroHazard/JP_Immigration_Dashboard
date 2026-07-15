// scripts/sync-changelog.js
// Copies the repo-root CHANGELOG.md into public/ so it's served as a static
// asset by the exported SPA (see next.config.ts `output: 'export'`) and can
// be fetched at runtime by the Changelog modal.
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'CHANGELOG.md');
const destination = path.join(__dirname, '..', 'public', 'CHANGELOG.md');

fs.copyFileSync(source, destination);
