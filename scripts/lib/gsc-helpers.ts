/**
 * Pure helpers shared by GSC scripts. Kept side-effect free so vitest can
 * exercise the retry/backoff, CSV parsing, and issue-key logic without
 * touching the network or the filesystem.
 */

export interface BackoffOptions {
  baseMs?: number;
  maxMs?: number;
  /** Deterministic jitter factor in [0, 1). Defaults to Math.random(). */
  random?: () => number;
}

/**
 * Exponential backoff with full jitter, honoring an optional Retry-After
 * header (in seconds). Result is always clamped to [0, maxMs].
 */
export function backoffMs(
  attempt: number,
  retryAfterHeader?: string | null,
  opts: BackoffOptions = {},
): number {
  const baseMs = opts.baseMs ?? 1000;
  const maxMs = opts.maxMs ?? 30_000;
  const rand = opts.random ?? Math.random;
  if (retryAfterHeader != null && retryAfterHeader !== "") {
    const n = Number(retryAfterHeader);
    if (!Number.isNaN(n) && n > 0) return Math.min(Math.floor(n * 1000), maxMs);
  }
  const safeAttempt = Math.max(0, attempt);
  const exp = Math.min(baseMs * 2 ** safeAttempt, maxMs);
  const jittered = exp * (0.5 + rand() * 0.5);
  return Math.max(0, Math.min(Math.floor(jittered), maxMs));
}

/** True for HTTP status codes worth a retry (429 + 5xx). */
export function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

export interface CsvRow {
  url: string;
  isNa: boolean;
  coverage: string;
}

/**
 * Minimal CSV parser respecting double-quoted fields and escaped quotes.
 * Requires a header row with at least `url`, `coverage_state`, `is_na`.
 */
export function parseGscCsv(raw: string): CsvRow[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
  const header = lines.shift();
  if (!header) return [];
  const cols = header.split(",");
  const iUrl = cols.indexOf("url");
  const iCov = cols.indexOf("coverage_state");
  const iNa = cols.indexOf("is_na");
  if (iUrl < 0 || iNa < 0) return [];
  const out: CsvRow[] = [];
  for (const line of lines) {
    const cells: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') {
          inQ = false;
        } else {
          cur += c;
        }
      } else if (c === ",") {
        cells.push(cur);
        cur = "";
      } else if (c === '"') {
        inQ = true;
      } else {
        cur += c;
      }
    }
    cells.push(cur);
    const url = cells[iUrl] ?? "";
    if (!url) continue;
    out.push({
      url,
      coverage: iCov >= 0 ? cells[iCov] ?? "" : "",
      isNa: (cells[iNa] ?? "") === "true",
    });
  }
  return out;
}

/** Stable HTML-comment marker embedded in each auto-managed issue body. */
export function issueMarkerFor(url: string): string {
  return `<!-- gsc-na-url: ${url} -->`;
}

export function buildIssueTitle(url: string, staleDays: number): string {
  return `[SEO] GSC N/A > ${staleDays}d: ${url}`;
}

export interface IssueBodyInput {
  url: string;
  firstSeenNa: string;
  lastSeenNa: string;
  daysStuck: number;
  staleDays: number;
}

export function buildIssueBody(input: IssueBodyInput): string {
  return [
    issueMarkerFor(input.url),
    `Google Search Console reports this URL as **never crawled (N/A)** for **${input.daysStuck} days**.`,
    ``,
    `- URL: ${input.url}`,
    `- First seen N/A: \`${input.firstSeenNa}\``,
    `- Last confirmed N/A: \`${input.lastSeenNa}\``,
    `- Threshold: ${input.staleDays} days`,
    ``,
    `## Suggested actions`,
    `1. Verify the URL is in \`public/sitemap-*.xml\` and returns 200.`,
    `2. Confirm it is not blocked by \`robots.txt\` or a \`noindex\` tag.`,
    `3. Request indexing manually in Search Console → URL Inspection.`,
    `4. Check for canonical mismatch (\`googleCanonical\` vs \`userCanonical\`) in the latest \`reports/gsc-status-*.csv\`.`,
    ``,
    `_This issue is auto-managed by \`scripts/gsc-track-na-urls.ts\` and will be updated (not duplicated) on subsequent runs._`,
  ].join("\n");
}

export interface DiffResult<T> {
  added: T[];
  removed: T[];
  unchanged: number;
}

/** Set-diff helper used to summarize sitemap URL / hreflang mapping changes. */
export function diffStringSets(before: Iterable<string>, after: Iterable<string>): DiffResult<string> {
  const b = new Set(before);
  const a = new Set(after);
  const added: string[] = [];
  const removed: string[] = [];
  let unchanged = 0;
  for (const v of a) {
    if (b.has(v)) unchanged++;
    else added.push(v);
  }
  for (const v of b) if (!a.has(v)) removed.push(v);
  added.sort();
  removed.sort();
  return { added, removed, unchanged };
}

/** Extract every `<loc>...</loc>` value from a sitemap XML string. */
export function extractSitemapLocs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

/**
 * Extract hreflang mappings as "loc\threflang\thref" tuples so they can be
 * diffed as a flat string set.
 */
export function extractHreflangMappings(xml: string): string[] {
  const out: string[] = [];
  const urlRe = /<url>([\s\S]*?)<\/url>/g;
  let u: RegExpExecArray | null;
  while ((u = urlRe.exec(xml)) !== null) {
    const body = u[1];
    const loc = /<loc>([^<]+)<\/loc>/.exec(body)?.[1]?.trim();
    if (!loc) continue;
    const altRe = /<xhtml:link[^>]*hreflang="([^"]+)"[^>]*href="([^"]+)"[^>]*\/?>/g;
    let a: RegExpExecArray | null;
    while ((a = altRe.exec(body)) !== null) {
      out.push(`${loc}\t${a[1]}\t${a[2]}`);
    }
  }
  return out;
}