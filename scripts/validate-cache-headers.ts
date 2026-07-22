/**
 * Validate cache headers on published domain via HEAD requests.
 * Usage: bunx tsx scripts/validate-cache-headers.ts [https://host]
 *
 * Checks that images, fonts, and hashed JS/CSS assets are served with
 * a long-lived immutable Cache-Control (>= 30 days).
 */
const HOST = process.argv[2] || 'https://genuinoinvestments.ch';
const MIN_SECONDS = 60 * 60 * 24 * 30; // 30 days

const paths = [
  '/logo.png',
  '/favicon.ico',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
];

// Discover a hashed JS + CSS asset from the homepage.
async function discoverHashedAssets(): Promise<string[]> {
  try {
    const res = await fetch(HOST + '/');
    const html = await res.text();
    const found = new Set<string>();
    for (const m of html.matchAll(/["'](\/assets\/[^"']+\.(?:js|css|woff2?|webp|avif|png|jpg|svg))["']/g)) {
      found.add(m[1]);
      if (found.size >= 6) break;
    }
    return [...found];
  } catch {
    return [];
  }
}

function parseMaxAge(header: string | null): number {
  if (!header) return 0;
  const m = /max-age=(\d+)/i.exec(header);
  return m ? parseInt(m[1], 10) : 0;
}

async function check(path: string) {
  const url = HOST + path;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    const cc = res.headers.get('cache-control');
    const age = parseMaxAge(cc);
    const ok = age >= MIN_SECONDS;
    return { url, status: res.status, cacheControl: cc, maxAge: age, ok };
  } catch (e) {
    return { url, status: 0, cacheControl: null, maxAge: 0, ok: false, error: String(e) };
  }
}

(async () => {
  const discovered = await discoverHashedAssets();
  const targets = [...paths, ...discovered];
  const results = await Promise.all(targets.map(check));
  let failed = 0;
  for (const r of results) {
    const mark = r.ok ? '✅' : '❌';
    console.log(`${mark} ${r.status} ${r.url}  →  ${r.cacheControl ?? '(no Cache-Control)'}`);
    if (!r.ok) failed++;
  }
  console.log(`\n${results.length - failed}/${results.length} assets meet the 30-day cache floor.`);
  if (failed > 0) process.exit(1);
})();