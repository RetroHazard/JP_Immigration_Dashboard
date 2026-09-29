// Copies the repo-root CHANGELOG.md into public/ so the static export serves it
// for the Changelog modal to fetch at runtime.
const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'CHANGELOG.md');
const destination = path.join(__dirname, '..', 'public', 'CHANGELOG.md');

fs.copyFileSync(source, destination);
