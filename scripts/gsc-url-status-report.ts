/**
 * Exports the Google Search Console indexing status for every URL
 * listed in the shipped sitemaps and writes a Markdown + CSV report
 * highlighting the URLs still stuck as "N/A" (never crawled) so we
 * can track resolution over time.
 *
 * Auth: uses the Lovable Search Console connector via the gateway.
 * Required env:
 *   LOVABLE_API_KEY               — gateway auth
 *   GOOGLE_SEARCH_CONSOLE_API_KEY — connection token
 *   GSC_SITE_URL                  — property URL, defaults to
 *                                   https://genuinoinvestments.ch/
 *
 * Output: reports/gsc-status-<YYYY-MM-DD>.{md,csv}
 *
 * Run manually:   bunx tsx scripts/gsc-url-status-report.ts
 * Recommended CI: weekly cron in .github/workflows/gsc-report.yml
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { backoffMs as computeBackoff, isRetryableStatus } from './lib/gsc-helpers';

const GATEWAY = 'https://connector-gateway.lovable.dev/google_search_console';
const SITE_URL = process.env.GSC_SITE_URL || 'https://genuinoinvestments.ch/';
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const GSC_KEY = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;

// Rate limiting / retry knobs. GSC URL inspection quota is ~600 req/min per
// property (2000/day). Stay well below with a token-bucket-style pacing and
// exponential backoff on 429/5xx.
const MIN_INTERVAL_MS = Number(process.env.GSC_MIN_INTERVAL_MS || 300); // ~200 req/min
const MAX_RETRIES = Number(process.env.GSC_MAX_RETRIES || 5);
const BASE_BACKOFF_MS = Number(process.env.GSC_BASE_BACKOFF_MS || 1000);
const MAX_BACKOFF_MS = Number(process.env.GSC_MAX_BACKOFF_MS || 30_000);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let lastCallAt = 0;
async function pace() {
  const wait = lastCallAt + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();
}

function backoffMs(attempt: number, retryAfterHeader?: string | null): number {
  return computeBackoff(attempt, retryAfterHeader, {
    baseMs: BASE_BACKOFF_MS,
    maxMs: MAX_BACKOFF_MS,
  });
}

if (!LOVABLE_API_KEY || !GSC_KEY) {
  console.error(
    '❌ Missing credentials. Set LOVABLE_API_KEY and GOOGLE_SEARCH_CONSOLE_API_KEY ' +
      '(link the Google Search Console connector in Lovable to obtain them).',
  );
  process.exit(1);
}

interface Row {
  url: string;
  coverageState: string;
  verdict: string;
  lastCrawlTime: string;
  googleCanonical: string;
  userCanonical: string;
  isNA: boolean;
  error?: string;
}

function collectUrlsFromSitemaps(): string[] {
  const publicDir = resolve('public');
  const files = readdirSync(publicDir).filter((f) => /^sitemap-(pt|en|fr|de)\.xml$/.test(f));
  const set = new Set<string>();
  for (const f of files) {
    const xml = readFileSync(resolve(publicDir, f), 'utf8');
    const re = /<loc>([^<]+)<\/loc>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) set.add(m[1].trim());
  }
  return [...set].sort();
}

async function inspect(url: string): Promise<Row> {
  let lastErr = '';
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await pace();
    let res: Response;
    try {
      res = await fetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': GSC_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL }),
      });
    } catch (e) {
      lastErr = `network: ${String(e)}`;
      const wait = backoffMs(attempt);
      console.warn(`  ↻ ${url} network error, retry in ${wait}ms (${attempt + 1}/${MAX_RETRIES})`);
      await sleep(wait);
      continue;
    }
    const text = await res.text();
    // Retry on 429 and 5xx
    if (isRetryableStatus(res.status)) {
      lastErr = `HTTP ${res.status}: ${text.slice(0, 200)}`;
      if (attempt === MAX_RETRIES) break;
      const wait = backoffMs(attempt, res.headers.get('retry-after'));
      console.warn(`  ↻ ${url} HTTP ${res.status}, retry in ${wait}ms (${attempt + 1}/${MAX_RETRIES})`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      return {
        url,
        coverageState: 'ERROR',
        verdict: 'ERROR',
        lastCrawlTime: '',
        googleCanonical: '',
        userCanonical: '',
        isNA: true,
        error: `HTTP ${res.status}: ${text.slice(0, 200)}`,
      };
    }
    let data: any;
    try { data = JSON.parse(text); } catch {
      return { url, coverageState: 'ERROR', verdict: 'ERROR', lastCrawlTime: '', googleCanonical: '', userCanonical: '', isNA: true, error: 'invalid JSON response' };
    }
    const idx = data?.inspectionResult?.indexStatusResult || {};
    const lastCrawl = idx.lastCrawlTime || '';
    const coverage = idx.coverageState || 'N/A';
    const verdict = idx.verdict || 'N/A';
    return {
      url,
      coverageState: coverage,
      verdict,
      lastCrawlTime: lastCrawl,
      googleCanonical: idx.googleCanonical || '',
      userCanonical: idx.userCanonical || '',
      isNA: !lastCrawl,
    };
  }
  return {
    url,
    coverageState: 'ERROR',
    verdict: 'ERROR',
    lastCrawlTime: '',
    googleCanonical: '',
    userCanonical: '',
    isNA: true,
    error: `retries exhausted — ${lastErr}`,
  };
}

function esc(v: string): string {
  const s = String(v ?? '').replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

async function main() {
  const urls = collectUrlsFromSitemaps();
  console.log(`Inspecting ${urls.length} URL(s) via GSC connector...`);
  const rows: Row[] = [];

  // Paced serial calls (see MIN_INTERVAL_MS) with per-call retry + backoff.
  for (const url of urls) {
    const r = await inspect(url);
    rows.push(r);
    console.log(`  ${r.isNA ? '⚠ N/A' : '✓    '} ${r.coverageState.padEnd(24)} ${url}`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const outDir = resolve('reports');
  mkdirSync(outDir, { recursive: true });

  // CSV
  const csvHeader = ['url', 'coverage_state', 'verdict', 'last_crawl_time', 'google_canonical', 'user_canonical', 'is_na', 'error'];
  const csv = [
    csvHeader.join(','),
    ...rows.map((r) =>
      [r.url, r.coverageState, r.verdict, r.lastCrawlTime, r.googleCanonical, r.userCanonical, String(r.isNA), r.error || '']
        .map(esc)
        .join(','),
    ),
  ].join('\n');
  writeFileSync(resolve(outDir, `gsc-status-${today}.csv`), csv, 'utf8');

  // Markdown
  const na = rows.filter((r) => r.isNA);
  const crawled = rows.filter((r) => !r.isNA);
  const md = [
    `# GSC URL status — ${today}`,
    ``,
    `- Property: \`${SITE_URL}\``,
    `- Total URLs inspected: **${rows.length}**`,
    `- Crawled: **${crawled.length}**`,
    `- Still N/A (never crawled): **${na.length}**`,
    ``,
    `## ⚠ URLs still as N/A`,
    ``,
    na.length === 0
      ? '_None. All sitemap URLs have been crawled at least once._'
      : ['| URL | Coverage | Verdict | Error |', '| --- | --- | --- | --- |', ...na.map((r) => `| ${r.url} | ${r.coverageState} | ${r.verdict} | ${r.error || ''} |`)].join('\n'),
    ``,
    `## Crawled URLs`,
    ``,
    crawled.length === 0
      ? '_No crawled URLs yet._'
      : ['| URL | Coverage | Last crawled | Google canonical |', '| --- | --- | --- | --- |', ...crawled.map((r) => `| ${r.url} | ${r.coverageState} | ${r.lastCrawlTime} | ${r.googleCanonical} |`)].join('\n'),
    ``,
  ].join('\n');
  writeFileSync(resolve(outDir, `gsc-status-${today}.md`), md, 'utf8');

  console.log(`\n📄 reports/gsc-status-${today}.md`);
  console.log(`📄 reports/gsc-status-${today}.csv`);
  console.log(`\n${na.length} URL(s) still N/A out of ${rows.length}.`);
  // Non-zero exit if any URL is stuck as N/A so CI surfaces it as a warning
  // (dedicated workflow decides whether to fail hard or just publish artifact).
  process.exit(na.length > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
