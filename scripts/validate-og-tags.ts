/**
 * Validate that for each route × language defined in src/data/seoMeta.ts,
 * the SEO metadata produced by SEOHead.tsx contains non-empty og:title,
 * og:description, og:url and twitter:* equivalents within sane limits.
 *
 * Run: bunx tsx scripts/validate-og-tags.ts
 * Exits 1 on any failure (suitable for CI / pre-publish hooks).
 */
import { ROUTE_META, LANGS, BASE_URL, type Lang } from '../src/data/seoMeta';

const BRAND_SUFFIX = 'Genuíno Investments';
const TITLE_MAX = 60;
const DESC_MIN = 50;
const DESC_MAX = 160;

const LOCALE_MAP: Record<Lang, string> = {
  pt: 'pt_PT', en: 'en_US', fr: 'fr_FR', de: 'de_CH',
};

interface Failure { route: string; lang: Lang; field: string; reason: string; }
const failures: Failure[] = [];

function check(route: string, lang: Lang) {
  const meta = ROUTE_META[route];
  const title = meta.title[lang] || meta.title.pt;
  const description = meta.description[lang] || meta.description.pt;
  const fullTitle = title ? `${title} | ${BRAND_SUFFIX}` : '';
  const ogUrl = `${BASE_URL}${route}?lang=${lang}`;
  const ogLocale = LOCALE_MAP[lang];

  // Mirror SEOHead output shape (Helmet-emitted tags)
  const tags = {
    'og:title': fullTitle,
    'og:description': description,
    'og:url': ogUrl,
    'og:locale': ogLocale,
    'twitter:title': fullTitle,
    'twitter:description': description,
  };

  for (const [field, value] of Object.entries(tags)) {
    if (!value || !value.trim()) {
      failures.push({ route, lang, field, reason: 'empty' });
    }
  }
  if (fullTitle.length > TITLE_MAX) {
    failures.push({ route, lang, field: 'og:title', reason: `length ${fullTitle.length} > ${TITLE_MAX}` });
  }
  if (description && description.length < DESC_MIN) {
    failures.push({ route, lang, field: 'og:description', reason: `length ${description.length} < ${DESC_MIN}` });
  }
  if (description && description.length > DESC_MAX) {
    failures.push({ route, lang, field: 'og:description', reason: `length ${description.length} > ${DESC_MAX}` });
  }
  if (!ogUrl.startsWith('https://')) {
    failures.push({ route, lang, field: 'og:url', reason: 'not absolute https://' });
  }
}

const routes = Object.keys(ROUTE_META);
for (const route of routes) for (const lang of LANGS) check(route, lang);

const total = routes.length * LANGS.length;
console.log(`✓ Checked ${total} route × language combinations`);

if (failures.length === 0) {
  console.log('✅ All OG/Twitter tags valid');
  process.exit(0);
}

console.error(`\n❌ ${failures.length} validation issue(s):`);
for (const f of failures) {
  console.error(`  [${f.route} · ${f.lang}] ${f.field} → ${f.reason}`);
}
process.exit(1);