/**
 * Reads the latest reports/gsc-status-<date>.csv produced by
 * gsc-url-status-report.ts, updates a persistent history file
 * (reports/gsc-na-history.json) tracking when each URL first went N/A,
 * and opens/updates a GitHub issue for every URL that has been stuck
 * as N/A (never crawled by Google) for more than STALE_DAYS days.
 *
 * Env:
 *   GITHUB_TOKEN       — required (GITHUB_TOKEN or GH_TOKEN)
 *   GITHUB_REPOSITORY  — required (owner/repo, auto-set in Actions)
 *   STALE_DAYS         — optional, defaults to 14
 *
 * Run: bunx tsx scripts/gsc-track-na-urls.ts
 * Exits 0 on success; 1 on config/API failure.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const STALE_DAYS = Number(process.env.STALE_DAYS || 14);
const REPO = process.env.GITHUB_REPOSITORY || '';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const REPORTS_DIR = resolve('reports');
const HISTORY_FILE = resolve(REPORTS_DIR, 'gsc-na-history.json');
const ISSUE_LABEL = 'seo:gsc-na';

if (!REPO || !TOKEN) {
  console.error('❌ GITHUB_REPOSITORY and GITHUB_TOKEN are required.');
  process.exit(1);
}

interface HistoryEntry { firstSeenNa: string; lastSeenNa: string; issueNumber?: number; }
type History = Record<string, HistoryEntry>;

function loadHistory(): History {
  if (!existsSync(HISTORY_FILE)) return {};
  try { return JSON.parse(readFileSync(HISTORY_FILE, 'utf8')); } catch { return {}; }
}

function saveHistory(h: History) {
  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(HISTORY_FILE, JSON.stringify(h, null, 2) + '\n', 'utf8');
}

function findLatestCsv(): string | null {
  if (!existsSync(REPORTS_DIR)) return null;
  const files = readdirSync(REPORTS_DIR)
    .filter((f) => /^gsc-status-\d{4}-\d{2}-\d{2}\.csv$/.test(f))
    .sort();
  return files.length ? resolve(REPORTS_DIR, files[files.length - 1]) : null;
}

function parseCsv(path: string): { url: string; isNa: boolean; coverage: string }[] {
  const raw = readFileSync(path, 'utf8').split(/\r?\n/).filter(Boolean);
  const header = raw.shift();
  if (!header) return [];
  const cols = header.split(',');
  const iUrl = cols.indexOf('url');
  const iCov = cols.indexOf('coverage_state');
  const iNa = cols.indexOf('is_na');
  return raw.map((line) => {
    // Simple CSV split respecting quoted fields.
    const cells: string[] = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === ',') { cells.push(cur); cur = ''; }
        else if (c === '"') inQ = true;
        else cur += c;
      }
    }
    cells.push(cur);
    return { url: cells[iUrl] || '', coverage: cells[iCov] || '', isNa: (cells[iNa] || '') === 'true' };
  }).filter((r) => r.url);
}

const GH = 'https://api.github.com';
async function gh(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${GH}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GitHub ${init.method || 'GET'} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

async function findExistingIssueByTitle(title: string): Promise<{ number: number; state: string } | null> {
  const q = encodeURIComponent(`repo:${REPO} is:issue in:title "${title}" label:${ISSUE_LABEL}`);
  const data = await gh(`/search/issues?q=${q}`);
  const hit = (data.items || []).find((i: any) => i.title === title);
  return hit ? { number: hit.number, state: hit.state } : null;
}

async function ensureLabel() {
  try { await gh(`/repos/${REPO}/labels/${encodeURIComponent(ISSUE_LABEL)}`); }
  catch {
    await gh(`/repos/${REPO}/labels`, {
      method: 'POST',
      body: JSON.stringify({ name: ISSUE_LABEL, color: 'd93f0b', description: 'URL stuck as N/A in Google Search Console' }),
    }).catch(() => { /* race-condition safe */ });
  }
}

async function upsertIssue(url: string, entry: HistoryEntry, daysStuck: number): Promise<number> {
  const title = `[SEO] GSC N/A > ${STALE_DAYS}d: ${url}`;
  const body = [
    `Google Search Console reports this URL as **never crawled (N/A)** for **${daysStuck} days**.`,
    ``,
    `- URL: ${url}`,
    `- First seen N/A: \`${entry.firstSeenNa}\``,
    `- Last confirmed N/A: \`${entry.lastSeenNa}\``,
    `- Threshold: ${STALE_DAYS} days`,
    ``,
    `## Suggested actions`,
    `1. Verify the URL is in \`public/sitemap-*.xml\` and returns 200.`,
    `2. Confirm it is not blocked by \`robots.txt\` or a \`noindex\` tag.`,
    `3. Request indexing manually in Search Console → URL Inspection.`,
    `4. Check for canonical mismatch (\`googleCanonical\` vs \`userCanonical\`) in the latest \`reports/gsc-status-*.csv\`.`,
    ``,
    `_This issue is auto-managed by \`scripts/gsc-track-na-urls.ts\` and will be closed automatically once Google crawls the URL._`,
  ].join('\n');

  const existing = await findExistingIssueByTitle(title);
  if (existing) {
    if (existing.state === 'closed') {
      await gh(`/repos/${REPO}/issues/${existing.number}`, { method: 'PATCH', body: JSON.stringify({ state: 'open' }) });
    }
    await gh(`/repos/${REPO}/issues/${existing.number}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body: `Still N/A after ${daysStuck} days (checked ${entry.lastSeenNa}).` }),
    });
    return existing.number;
  }
  const created = await gh(`/repos/${REPO}/issues`, {
    method: 'POST',
    body: JSON.stringify({ title, body, labels: [ISSUE_LABEL] }),
  });
  return created.number;
}

async function closeIssue(num: number, url: string) {
  await gh(`/repos/${REPO}/issues/${num}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body: `✅ Google has crawled \`${url}\`. Auto-closing.` }),
  });
  await gh(`/repos/${REPO}/issues/${num}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed' }) });
}

async function main() {
  const csv = findLatestCsv();
  if (!csv) { console.log('No GSC report CSV found — nothing to do.'); return; }
  console.log(`Using latest report: ${csv}`);

  const rows = parseCsv(csv);
  const today = new Date().toISOString().slice(0, 10);
  const history = loadHistory();
  await ensureLabel();

  let opened = 0, closed = 0, updated = 0;

  for (const r of rows) {
    const existing = history[r.url];
    if (r.isNa) {
      const firstSeenNa = existing?.firstSeenNa || today;
      const entry: HistoryEntry = { ...existing, firstSeenNa, lastSeenNa: today };
      const days = Math.floor((Date.parse(today) - Date.parse(firstSeenNa)) / 86_400_000);
      if (days >= STALE_DAYS) {
        try {
          const num = await upsertIssue(r.url, entry, days);
          if (entry.issueNumber !== num) opened++; else updated++;
          entry.issueNumber = num;
        } catch (e) {
          console.error(`  ✗ issue upsert failed for ${r.url}:`, e);
        }
      }
      history[r.url] = entry;
    } else if (existing) {
      if (existing.issueNumber) {
        try { await closeIssue(existing.issueNumber, r.url); closed++; }
        catch (e) { console.error(`  ✗ close issue #${existing.issueNumber} failed:`, e); }
      }
      delete history[r.url];
    }
  }

  saveHistory(history);
  console.log(`\nDone. opened=${opened} updated=${updated} closed=${closed} tracked=${Object.keys(history).length}`);
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });