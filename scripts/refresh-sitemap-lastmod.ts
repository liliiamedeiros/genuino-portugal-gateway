/**
 * Bumps <lastmod> in every public/sitemap*.xml to today's date and
 * refreshes the sitemap-index entries.
 *
 * Intended for CI: run whenever content that appears in the sitemap
 * changes (routes under src/pages, static data in src/data, portfolio/
 * project rows). The companion GitHub Actions workflow
 * (.github/workflows/sitemap.yml) invokes this on push to main and
 * commits the refreshed sitemaps automatically.
 *
 * Only updates when content actually changed (checks that the target
 * date differs from what's already in the file) so no-op runs don't
 * create empty commits.
 *
 * Run manually: bunx tsx scripts/refresh-sitemap-lastmod.ts
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const PUBLIC_DIR = resolve('public');
const TODAY = new Date().toISOString().slice(0, 10);

function refresh(file: string): boolean {
  const path = resolve(PUBLIC_DIR, file);
  const original = readFileSync(path, 'utf8');
  const updated = original.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${TODAY}</lastmod>`,
  );
  if (updated === original) {
    console.log(`· ${file}: already at ${TODAY}`);
    return false;
  }
  writeFileSync(path, updated, 'utf8');
  const count = (original.match(/<lastmod>/g) || []).length;
  console.log(`✓ ${file}: ${count} <lastmod> tag(s) refreshed → ${TODAY}`);
  return true;
}

const files = readdirSync(PUBLIC_DIR).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'));
if (files.length === 0) {
  console.error('❌ No sitemap*.xml files found in public/');
  process.exit(1);
}

let changed = 0;
for (const f of files) if (refresh(f)) changed++;

console.log(`\n${changed}/${files.length} sitemap file(s) updated for ${TODAY}.`);
process.exit(0);
