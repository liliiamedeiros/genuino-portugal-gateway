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
import {
  parseGscCsv,
  issueMarkerFor,
  buildIssueBody,
  buildIssueTitle,
} from './lib/gsc-helpers';

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
  return parseGscCsv(readFileSync(path, 'utf8'));
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

/**
 * Locate an auto-managed issue for a URL by scanning body for a stable
 * HTML-comment marker. Title-based search is unreliable (title changes when
 * `STALE_DAYS` is tuned, plus GitHub search is eventually consistent), so the
 * marker-in-body approach is the source of truth for dedup and open-issue
 * updates across reruns. Prefers open issues; falls back to a closed one so
 * we reopen instead of duplicating.
 */
async function findExistingIssueForUrl(
  url: string,
  hint?: number,
): Promise<{ number: number; state: string } | null> {
  if (hint) {
    try {
      const issue = await gh(`/repos/${REPO}/issues/${hint}`);
      if (issue && typeof issue.body === 'string' && issue.body.includes(issueMarkerFor(url))) {
        return { number: issue.number, state: issue.state };
      }
    } catch { /* fall through to search */ }
  }
  // Search open first, then closed. `in:body` matches the HTML comment marker.
  const marker = issueMarkerFor(url);
  const base = `repo:${REPO} is:issue label:${ISSUE_LABEL} in:body "${marker}"`;
  for (const state of ['is:open', 'is:closed']) {
    const q = encodeURIComponent(`${base} ${state}`);
    const data = await gh(`/search/issues?q=${q}`);
    const items = (data.items || []) as { number: number; state: string; body?: string }[];
    const hit = items.find((i) => (i.body || '').includes(marker));
    if (hit) return { number: hit.number, state: hit.state };
  }
  return null;
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
  const title = buildIssueTitle(url, STALE_DAYS);
  const body = buildIssueBody({
    url,
    firstSeenNa: entry.firstSeenNa,
    lastSeenNa: entry.lastSeenNa,
    daysStuck,
    staleDays: STALE_DAYS,
  });

  const existing = await findExistingIssueForUrl(url, entry.issueNumber);
  if (existing) {
    // Update in place — never open a duplicate for the same URL.
    await gh(`/repos/${REPO}/issues/${existing.number}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, body, state: 'open' }),
    });
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
  // Be defensive: only close if this issue really is ours (marker match). Prevents
  // accidentally closing an unrelated issue if the history file gets corrupted.
  try {
    const issue = await gh(`/repos/${REPO}/issues/${num}`);
    if (!issue?.body?.includes(issueMarkerFor(url))) return;
    if (issue.state === 'closed') return;
  } catch { return; }
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
          if (!entry.issueNumber) opened++;
          else if (entry.issueNumber !== num) opened++;
          else updated++;
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

  // Emit a summary line CI can grep to fire threshold alerts (Slack/email).
  const naCount = Object.keys(history).length;
  const alertLimit = Number(process.env.NA_ALERT_LIMIT || 0);
  console.log(`GSC_NA_SUMMARY na_total=${naCount} opened=${opened} closed=${closed} limit=${alertLimit}`);
  if (process.env.GITHUB_OUTPUT) {
    writeFileSync(process.env.GITHUB_OUTPUT, [
      `na_total=${naCount}`,
      `opened=${opened}`,
      `closed=${closed}`,
      `over_limit=${alertLimit > 0 && naCount > alertLimit ? 'true' : 'false'}`,
      '',
    ].join('\n'), { flag: 'a' });
  }
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1); });