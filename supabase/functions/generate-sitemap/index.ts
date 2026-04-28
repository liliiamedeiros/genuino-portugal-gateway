import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=3600',
}

const BASE = 'https://genuinoinvestments.ch'
const LANGS = ['pt', 'en', 'fr', 'de'] as const
type Lang = typeof LANGS[number]

const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/services', priority: '0.8', changefreq: 'monthly' },
  { path: '/portfolio', priority: '0.9', changefreq: 'weekly' },
  { path: '/properties', priority: '0.9', changefreq: 'daily' },
  { path: '/vision', priority: '0.7', changefreq: 'monthly' },
  { path: '/investors', priority: '0.8', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'monthly' },
  { path: '/legal', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/disputes', priority: '0.3', changefreq: 'yearly' },
  { path: '/install', priority: '0.4', changefreq: 'yearly' },
]

function hreflangBlock(path: string): string {
  return LANGS.map(l =>
    `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE}${path}?lang=${l}"/>`
  ).join('\n') + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${path}"/>`
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string, hreflang?: string) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${hreflang ? '\n' + hreflang : ''}
  </url>\n`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const url = new URL(req.url)
  // Routing: ?type=index | ?type=lang&lang=pt | ?type=combined (default = combined for back-compat)
  const type = url.searchParams.get('type') || 'combined'
  const langParam = (url.searchParams.get('lang') || '') as Lang
  const today = new Date().toISOString().split('T')[0]

  // === SITEMAP INDEX ===
  if (type === 'index') {
    const sitemaps = LANGS.map(
      l => `  <sitemap>
    <loc>${BASE}/sitemap-${l}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
    ).join('\n')
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`
    return new Response(xml, { headers: corsHeaders })
  }

  // === Fetch dynamic content ===
  const { data: projects } = await supabase
    .from('projects').select('id, updated_at').eq('status', 'active')
  const { data: portfolio } = await supabase
    .from('portfolio_projects').select('id, updated_at').eq('status', 'active')

  // === LANGUAGE-SPECIFIC SITEMAP ===
  if (type === 'lang' && LANGS.includes(langParam)) {
    let urls = ''
    for (const page of STATIC_PAGES) {
      urls += urlEntry(
        `${BASE}${page.path}?lang=${langParam}`,
        today, page.changefreq, page.priority,
        hreflangBlock(page.path)
      )
    }
    for (const p of projects || []) {
      const lastmod = p.updated_at ? p.updated_at.split('T')[0] : today
      urls += urlEntry(
        `${BASE}/project/${p.id}?lang=${langParam}`,
        lastmod, 'weekly', '0.8',
        hreflangBlock(`/project/${p.id}`)
      )
    }
    for (const p of portfolio || []) {
      const lastmod = p.updated_at ? p.updated_at.split('T')[0] : today
      urls += urlEntry(
        `${BASE}/portfolio/${p.id}?lang=${langParam}`,
        lastmod, 'weekly', '0.7',
        hreflangBlock(`/portfolio/${p.id}`)
      )
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}</urlset>`
    return new Response(xml, { headers: corsHeaders })
  }

  // === COMBINED (default / back-compat) ===
  let urls = ''
  for (const page of STATIC_PAGES) {
    urls += urlEntry(`${BASE}${page.path}`, today, page.changefreq, page.priority, hreflangBlock(page.path))
  }
  for (const p of projects || []) {
    const lastmod = p.updated_at ? p.updated_at.split('T')[0] : today
    urls += urlEntry(`${BASE}/project/${p.id}`, lastmod, 'weekly', '0.8', hreflangBlock(`/project/${p.id}`))
  }
  for (const p of portfolio || []) {
    const lastmod = p.updated_at ? p.updated_at.split('T')[0] : today
    urls += urlEntry(`${BASE}/portfolio/${p.id}`, lastmod, 'weekly', '0.7', hreflangBlock(`/portfolio/${p.id}`))
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}</urlset>`
  return new Response(xml, { headers: corsHeaders })
})
