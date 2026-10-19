#!/usr/bin/env node
// Fails if `npm run generate` would change anything that is committed.
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
execSync('node scripts/generate.mjs', { cwd: root, stdio: 'inherit' });
const diff = execSync('git status --porcelain -- dist src/generated', { cwd: root }).toString().trim();
if (diff) {
  console.error('\nGenerated output is out of date. Run `pnpm generate` and commit:\n' + diff);
  process.exit(1);
}
console.log('Generated output is current.');
