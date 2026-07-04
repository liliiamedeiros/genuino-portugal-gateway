/**
 * Pre-deploy validator for multi-language SEO metadata.
 *
 * Checks:
 *   1. Every <loc> in public/sitemap-{pt,en,fr,de}.xml is param-free
 *      (no ?lang=xx) so it matches the per-route canonical.
 *   2. Every <url> block declares xhtml:link rel="alternate" for
 *      every supported language + x-default.
 *   3. hreflang alternates within a <url> block share the same
 *      base URL (same path — only the ?lang param differs).
 *   4. index.html sitewide <link rel="alternate" hreflang="..."> block
 *      includes all supported languages + x-default and points at the
 *      canonical host.
 *
 * Wired into `prebuild`; fails the build (exit 1) on any violation.
 * Run manually: bunx tsx scripts/validate-hreflang.ts
 */
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const EXPECTED_HOST = 'genuinoinvestments.ch';
const LANGS = ['pt', 'en', 'fr', 'de'] as const;
const REQUIRED_HREFLANGS = [...LANGS, 'x-default'] as const;
const PUBLIC_DIR = resolve('public');

interface Issue { file: string; where: string; reason: string; }
const issues: Issue[] = [];

function stripLangParam(url: string): string {
  return url.replace(/([?&])lang=[a-z-]+(&|$)/i, (_m, p1, p2) => (p2 ? p1 : '')).replace(/[?&]$/, '');
}

function parseUrlBlocks(xml: string): { loc: string; alternates: { hreflang: string; href: string }[]; raw: string }[] {
  const blocks: { loc: string; alternates: { hreflang: string; href: string }[]; raw: string }[] = [];
  const re = /<url>([\s\S]*?)<\/url>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const body = m[1];
    const locMatch = /<loc>([^<]+)<\/loc>/.exec(body);
    if (!locMatch) continue;
    const alternates: { hreflang: string; href: string }[] = [];
    const altRe = /<xhtml:link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"[^>]*\/?>/g;
    let a: RegExpExecArray | null;
    while ((a = altRe.exec(body)) !== null) {
      alternates.push({ hreflang: a[1], href: a[2] });
    }
    blocks.push({ loc: locMatch[1].trim(), alternates, raw: body });
  }
  return blocks;
}

function validateSitemap(file: string) {
  const path = resolve(PUBLIC_DIR, file);
  const xml = readFileSync(path, 'utf8');
  const blocks = parseUrlBlocks(xml);
  if (blocks.length === 0) {
    issues.push({ file, where: '(root)', reason: 'no <url> entries found' });
    return;
  }

  for (const b of blocks) {
    // (1) canonical (<loc>) must be param-free
    if (/[?&]lang=/i.test(b.loc)) {
      issues.push({ file, where: b.loc, reason: '<loc> contains ?lang= — canonical must be param-free' });
    }
    try {
      const u = new URL(b.loc);
      if (u.host !== EXPECTED_HOST) {
        issues.push({ file, where: b.loc, reason: `<loc> host ${u.host} ≠ ${EXPECTED_HOST}` });
      }
    } catch {
      issues.push({ file, where: b.loc, reason: '<loc> is not a valid URL' });
    }

    // (2) required hreflangs present
    const declared = new Set(b.alternates.map((a) => a.hreflang.toLowerCase()));
    for (const req of REQUIRED_HREFLANGS) {
      if (!declared.has(req)) {
        issues.push({ file, where: b.loc, reason: `missing hreflang="${req}"` });
      }
    }

    // (3) alternates must share the same base URL as <loc>
    const canonicalBase = stripLangParam(b.loc);
    for (const alt of b.alternates) {
      const altBase = stripLangParam(alt.href);
      if (altBase !== canonicalBase) {
        issues.push({
          file,
          where: b.loc,
          reason: `hreflang="${alt.hreflang}" href base ${altBase} ≠ canonical ${canonicalBase}`,
        });
      }
      try {
        const u = new URL(alt.href);
        if (u.host !== EXPECTED_HOST) {
          issues.push({ file, where: b.loc, reason: `hreflang="${alt.hreflang}" host ${u.host} ≠ ${EXPECTED_HOST}` });
        }
      } catch {
        issues.push({ file, where: b.loc, reason: `hreflang="${alt.hreflang}" href not a valid URL` });
      }
    }
  }
  console.log(`✓ ${file}: ${blocks.length} <url> entries checked`);
}

function validateIndexHtml() {
  const html = readFileSync(resolve('index.html'), 'utf8');
  const re = /<link[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"[^>]*\/?>/g;
  const found = new Map<string, string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    found.set(m[1].toLowerCase(), m[2]);
  }
  for (const req of REQUIRED_HREFLANGS) {
    if (!found.has(req)) {
      issues.push({ file: 'index.html', where: '<head>', reason: `missing hreflang="${req}"` });
    }
  }
  for (const [hreflang, href] of found) {
    try {
      const u = new URL(href);
      if (u.host !== EXPECTED_HOST) {
        issues.push({ file: 'index.html', where: `hreflang="${hreflang}"`, reason: `host ${u.host} ≠ ${EXPECTED_HOST}` });
      }
    } catch {
      issues.push({ file: 'index.html', where: `hreflang="${hreflang}"`, reason: 'invalid URL' });
    }
  }
  console.log(`✓ index.html: ${found.size} hreflang link(s) checked`);
}

const perLangSitemaps = readdirSync(PUBLIC_DIR).filter((f) => /^sitemap-(pt|en|fr|de)\.xml$/.test(f));
if (perLangSitemaps.length === 0) {
  console.error('❌ No per-language sitemaps (sitemap-{pt,en,fr,de}.xml) found in public/');
  process.exit(1);
}
for (const f of perLangSitemaps) validateSitemap(f);
validateIndexHtml();

if (issues.length === 0) {
  console.log(`\n✅ Multi-language canonical & hreflang consistency OK (${LANGS.join(', ')} + x-default).`);
  process.exit(0);
}

console.error(`\n❌ ${issues.length} hreflang/canonical issue(s):`);
for (const i of issues) console.error(`  [${i.file}] ${i.where} → ${i.reason}`);
process.exit(1);
