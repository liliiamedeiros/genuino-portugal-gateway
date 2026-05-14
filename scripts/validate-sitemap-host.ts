/**
 * Validate that public/robots.txt and every public/sitemap*.xml file reference
 * URLs on the canonical production host only. Catches accidental leaks of
 * preview/lovable.app URLs into shipped SEO files.
 *
 * Run: bunx tsx scripts/validate-sitemap-host.ts
 * Exits 1 on any mismatch.
 */
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const EXPECTED_HOST = 'genuinoinvestments.ch';
const PUBLIC_DIR = resolve('public');

interface Issue { file: string; url: string; reason: string; }
const issues: Issue[] = [];

function extractUrls(content: string): string[] {
  const re = /https?:\/\/[^\s"'<>)]+/g;
  return content.match(re) || [];
}

function checkFile(file: string) {
  const path = resolve(PUBLIC_DIR, file);
  const content = readFileSync(path, 'utf8');
  const urls = extractUrls(content);
  if (urls.length === 0) {
    issues.push({ file, url: '(none)', reason: 'no URLs found' });
    return;
  }
  for (const u of urls) {
    let host: string;
    try { host = new URL(u).host; } catch { continue; }
    if (host !== EXPECTED_HOST) {
      issues.push({ file, url: u, reason: `host ${host} ≠ ${EXPECTED_HOST}` });
    }
    if (!u.startsWith('https://')) {
      issues.push({ file, url: u, reason: 'not https' });
    }
  }
  console.log(`✓ ${file}: ${urls.length} URL(s) checked`);
}

// robots.txt
checkFile('robots.txt');

// All sitemap*.xml files
const sitemaps = readdirSync(PUBLIC_DIR).filter(
  (f) => f.startsWith('sitemap') && f.endsWith('.xml'),
);
if (sitemaps.length === 0) {
  console.error('❌ No sitemap*.xml files found in public/');
  process.exit(1);
}
for (const f of sitemaps) checkFile(f);

// Cross-check: robots.txt must reference each language sitemap
const robotsContent = readFileSync(resolve(PUBLIC_DIR, 'robots.txt'), 'utf8');
const requiredSitemapRefs = ['sitemap-index.xml', 'sitemap-pt.xml', 'sitemap-en.xml', 'sitemap-fr.xml', 'sitemap-de.xml'];
for (const ref of requiredSitemapRefs) {
  if (!robotsContent.includes(ref)) {
    issues.push({ file: 'robots.txt', url: ref, reason: 'missing Sitemap: directive' });
  }
}

if (issues.length === 0) {
  console.log(`\n✅ All sitemap & robots URLs point to ${EXPECTED_HOST}`);
  process.exit(0);
}

console.error(`\n❌ ${issues.length} issue(s):`);
for (const i of issues) console.error(`  [${i.file}] ${i.url} → ${i.reason}`);
process.exit(1);