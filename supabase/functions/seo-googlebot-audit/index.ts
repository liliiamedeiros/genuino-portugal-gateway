// SEO Googlebot Audit
// Crawls all public routes (static + every property + every portfolio item) in
// all 4 languages (PT, EN, FR, DE), simulating Googlebot, and returns a detailed
// report: indexability, hreflang completeness, x-default, canonical, translated
// content, robots/meta-robots, status codes, broken redirects.
//
// Admin-only.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LANGS = ["pt", "en", "fr", "de"] as const;
const STATIC_ROUTES = ["/", "/about", "/services", "/portfolio", "/properties", "/contact", "/vision", "/investors", "/legal", "/privacy"];
const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

async function assertAdmin(authHeader: string | null) {
  if (!authHeader) throw new Error("Missing Authorization header");
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: userData, error } = await supa.auth.getUser(token);
  if (error || !userData?.user) throw new Error("Invalid token");
  const { data: roles } = await supa.from("user_roles").select("role").eq("user_id", userData.user.id);
  const has = (r: string) => (roles || []).some((x: any) => x.role === r);
  if (!has("admin") && !has("super_admin")) throw new Error("Forbidden");
  return supa;
}

interface RouteCheck {
  url: string;
  lang: string;
  status: number;
  ok: boolean;
  title?: string;
  description?: string;
  canonical?: string;
  hreflangs: { lang: string; href: string }[];
  hasXDefault: boolean;
  metaRobots?: string;
  indexable: boolean;
  htmlBytes: number;
  errors: string[];
  warnings: string[];
}

function parseHead(html: string) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i);
  const hreflangs = Array.from(
    html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["']/gi),
  ).map((m) => ({ lang: m[1], href: m[2] }));
  return {
    title: titleMatch?.[1],
    description: descMatch?.[1],
    canonical: canonMatch?.[1],
    metaRobots: robotsMatch?.[1],
    hreflangs,
  };
}

async function checkRoute(origin: string, path: string, lang: string): Promise<RouteCheck> {
  const url = `${origin}${path}${path.includes("?") ? "&" : "?"}lang=${lang}`;
  const errors: string[] = [];
  const warnings: string[] = [];
  let status = 0;
  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": GOOGLEBOT_UA, Accept: "text/html", "Accept-Language": lang },
      redirect: "follow",
    });
    status = res.status;
    html = await res.text();
  } catch (e) {
    errors.push(`Fetch failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  const head = parseHead(html);
  const langSet = new Set(head.hreflangs.map((h) => h.lang.toLowerCase()));
  const hasXDefault = langSet.has("x-default");
  const indexable = !head.metaRobots?.toLowerCase().includes("noindex");

  if (status === 0) errors.push("No response");
  else if (status >= 400) errors.push(`HTTP ${status}`);
  if (!head.title) errors.push("Missing <title>");
  else if (head.title.length < 10) warnings.push("Title too short (<10 chars)");
  if (!head.description) warnings.push("Missing meta description");
  if (!head.canonical) errors.push("Missing canonical");
  if (!indexable) errors.push("Marked noindex");
  for (const expected of LANGS) {
    if (!langSet.has(expected)) warnings.push(`Missing hreflang=${expected}`);
  }
  if (!hasXDefault) warnings.push("Missing hreflang=x-default");
  // Translated content check: detect obvious untranslated PT defaults when lang != pt
  if (lang !== "pt" && head.title && /(Imóveis|Sobre nós|Início|Contacto)/i.test(head.title)) {
    warnings.push(`Title appears in PT for lang=${lang}`);
  }

  return {
    url,
    lang,
    status,
    ok: errors.length === 0,
    title: head.title,
    description: head.description,
    canonical: head.canonical,
    hreflangs: head.hreflangs,
    hasXDefault,
    metaRobots: head.metaRobots,
    indexable,
    htmlBytes: html.length,
    errors,
    warnings,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supa = await assertAdmin(req.headers.get("Authorization"));
    const body = await req.json().catch(() => ({}));
    const { origin, depth = "full", concurrency = 4 } = body as { origin?: string; depth?: "shallow" | "full"; concurrency?: number };
    if (!origin || !/^https?:\/\//.test(origin)) {
      return new Response(JSON.stringify({ error: "origin required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build full route list
    const routes: string[] = [...STATIC_ROUTES];
    if (depth === "full") {
      const { data: properties } = await supa.from("projects").select("id").eq("status", "active");
      const { data: portfolio } = await supa.from("portfolio_projects").select("id").eq("status", "active");
      for (const p of properties || []) routes.push(`/properties/${p.id}`);
      for (const p of portfolio || []) routes.push(`/portfolio/${p.id}`);
    }

    // robots.txt + sitemap quick checks
    const robotsRes = await fetch(`${origin}/robots.txt`, { headers: { "User-Agent": GOOGLEBOT_UA } }).catch(() => null);
    const sitemapRes = await fetch(`${origin}/sitemap.xml`, { headers: { "User-Agent": GOOGLEBOT_UA } }).catch(() => null);
    const robots = {
      status: robotsRes?.status || 0,
      ok: !!robotsRes?.ok,
      blocksAll: robotsRes?.ok ? /Disallow:\s*\/\s*$/im.test(await robotsRes.clone().text()) : false,
    };
    const sitemap = { status: sitemapRes?.status || 0, ok: !!sitemapRes?.ok };

    // Fan out × langs with limited concurrency
    const checks: RouteCheck[] = [];
    const tasks: { path: string; lang: string }[] = [];
    for (const r of routes) for (const l of LANGS) tasks.push({ path: r, lang: l });

    const queue = [...tasks];
    const workers = Array.from({ length: Math.max(1, Math.min(concurrency, 8)) }, async () => {
      while (queue.length) {
        const t = queue.shift();
        if (!t) break;
        const c = await checkRoute(origin, t.path, t.lang);
        checks.push(c);
      }
    });
    await Promise.all(workers);

    const totalChecks = checks.length;
    const errorRoutes = checks.filter((c) => c.errors.length > 0);
    const warnRoutes = checks.filter((c) => c.warnings.length > 0);
    const indexable = checks.filter((c) => c.indexable).length;

    // Hreflang coverage per lang
    const hreflangCoverage = LANGS.map((l) => {
      const total = routes.length;
      const present = checks.filter((c) => c.lang === l && c.hreflangs.some((h) => h.lang.toLowerCase() === l)).length;
      return { lang: l, total, present, pct: total ? Math.round((present / total) * 100) : 0 };
    });

    const summary = {
      origin,
      depth,
      total_routes: routes.length,
      total_checks: totalChecks,
      errors: errorRoutes.length,
      warnings: warnRoutes.length,
      indexable,
      robots,
      sitemap,
      hreflang_coverage: hreflangCoverage,
      timestamp: new Date().toISOString(),
    };

    // Persist as seo_snapshot
    await supa.from("seo_snapshots").insert({
      snapshot_type: "googlebot_audit",
      environment: origin,
      payload: { summary, checks: checks.slice(0, 500) },
    });

    return new Response(JSON.stringify({ ok: true, summary, checks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});