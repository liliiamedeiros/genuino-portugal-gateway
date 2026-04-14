import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Content-Type': 'application/xml',
  'Access-Control-Allow-Origin': '*',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const baseUrl = 'https://genuinoinvestments.ch'
  const today = new Date().toISOString().split('T')[0]

  // Static pages
  const staticPages = [
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
  ]

  // Fetch active projects
  const { data: projects } = await supabase
    .from('projects')
    .select('id, updated_at')
    .eq('status', 'active')

  // Fetch active portfolio
  const { data: portfolio } = await supabase
    .from('portfolio_projects')
    .select('id, updated_at')
    .eq('status', 'active')

  let urls = ''

  // Static pages with hreflang
  for (const page of staticPages) {
    const langs = ['pt', 'en', 'fr', 'de']
    const hreflangs = langs.map(l => 
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${baseUrl}${page.path}?lang=${l}"/>`
    ).join('\n')
    
    urls += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${hreflangs}
  </url>\n`
  }

  // Project pages
  if (projects) {
    for (const p of projects) {
      const lastmod = p.updated_at ? p.updated_at.split('T')[0] : today
      urls += `  <url>
    <loc>${baseUrl}/project/${p.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`
    }
  }

  // Portfolio pages
  if (portfolio) {
    for (const p of portfolio) {
      const lastmod = p.updated_at ? p.updated_at.split('T')[0] : today
      urls += `  <url>
    <loc>${baseUrl}/portfolio/${p.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}</urlset>`

  return new Response(sitemap, { headers: corsHeaders })
})
