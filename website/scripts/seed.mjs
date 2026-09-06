/**
 * Reset the local demo store back to its seeded state.
 *
 *     npm run seed          (from the repo root)
 *
 * This deletes website/data/db.json and regenerates it from lib/db/seed.ts.
 * It never touches Supabase.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.resolve(__dirname, '..');
const dataFile = path.join(websiteRoot, 'data', 'db.json');
const uploadsDir = path.join(websiteRoot, 'data', 'uploads');

if (process.env.DATA_SOURCE === 'supabase') {
  console.error('✋ DATA_SOURCE=supabase — refusing to reset production data.');
  console.error('   Run `npm run seed` with DATA_SOURCE=local (or unset) instead.');
  process.exit(1);
}

for (const target of [dataFile, uploadsDir]) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`  removed ${path.relative(websiteRoot, target)}`);
  }
}

fs.mkdirSync(path.dirname(dataFile), { recursive: true });
console.log('\n🌱 Local demo data reset.');
console.log('   The store will be regenerated from lib/db/seed.ts on the next request.');
console.log(`\n   Admin dashboard : /admin      (password from ADMIN_PASSWORD)`);
console.log(`   Sabiha's Day    : /day        (demo login shown on the screen)\n`);
