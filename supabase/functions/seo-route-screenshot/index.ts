// Captures a real headless-browser screenshot of a public route + language and
// returns it as base64. Uses browserless.io via fetch (no native browser binary
// in Deno). Falls back to a server-side fetched HTML render if no browserless
// token is set, by serializing the rendered <head> as an SVG card.
//
// This function is admin-only: it requires a valid Supabase JWT and either the
// 'admin' or 'super_admin' role. The result is always returned base64-encoded
// so the caller can store it in seo_snapshots.payload.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function assertAdmin(authHeader: string | null) {
  if (!authHeader) throw new Error("Missing Authorization header");
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { data: userData, error: uerr } = await supa.auth.getUser(token);
  if (uerr || !userData?.user) throw new Error("Invalid token");
  const { data: roles } = await supa
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);
  const has = (r: string) => (roles || []).some((x: any) => x.role === r);
  if (!has("admin") && !has("super_admin")) throw new Error("Forbidden");
  return userData.user.id;
}

/** Render an SVG card containing the detected <head> tags as a fallback proof. */
function renderHeadSvg(url: string, head: {
  title?: string; description?: string; canonical?: string;
  hreflangs: { lang: string; href: string }[];
}): string {
  const lines: string[] = [];
  lines.push(`<text x="24" y="40" font-size="20" font-weight="700" fill="#0f172a">SEO head proof</text>`);
  lines.push(`<text x="24" y="64" font-size="11" fill="#64748b">${escapeXml(url)}</text>`);
  let y = 96;
  lines.push(`<text x="24" y="${y}" font-size="12" font-weight="600" fill="#0f172a">Title</text>`);
  y += 16;
  lines.push(`<text x="24" y="${y}" font-size="11" fill="#334155">${escapeXml(head.title || "(missing)")}</text>`);
  y += 22;
  lines.push(`<text x="24" y="${y}" font-size="12" font-weight="600" fill="#0f172a">Description</text>`);
  y += 16;
  for (const part of wrap(head.description || "(missing)", 90)) {
    lines.push(`<text x="24" y="${y}" font-size="11" fill="#334155">${escapeXml(part)}</text>`);
    y += 14;
  }
  y += 8;
  lines.push(`<text x="24" y="${y}" font-size="12" font-weight="600" fill="#0f172a">Canonical</text>`);
  y += 16;
  lines.push(`<text x="24" y="${y}" font-size="11" fill="#334155">${escapeXml(head.canonical || "(missing)")}</text>`);
  y += 22;
  lines.push(`<text x="24" y="${y}" font-size="12" font-weight="600" fill="#0f172a">Hreflang declarations (${head.hreflangs.length})</text>`);
  y += 16;
  for (const h of head.hreflangs.slice(0, 8)) {
    lines.push(`<text x="24" y="${y}" font-size="11" fill="#334155">${escapeXml(h.lang.padEnd(10))} → ${escapeXml(h.href)}</text>`);
    y += 14;
  }
  const height = Math.max(y + 24, 320);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${height}" viewBox="0 0 900 ${height}">
  <rect width="900" height="${height}" fill="#ffffff"/>
  <rect x="0" y="0" width="900" height="72" fill="#f1f5f9"/>
  ${lines.join("\n  ")}
</svg>`;
}

function escapeXml(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));
}
function wrap(s: string, n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  return out.slice(0, 4);
}

/** Try the headless-browser path via browserless.io REST API, if a token is configured. */
async function tryBrowserlessScreenshot(url: string): Promise<string | null> {
  const token = Deno.env.get("BROWSERLESS_TOKEN");
  if (!token) return null;
  try {
    const res = await fetch(`https://chrome.browserless.io/screenshot?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        options: { type: "png", fullPage: false },
        gotoOptions: { waitUntil: "networkidle2", timeout: 25000 },
        viewport: { width: 1280, height: 800 },
      }),
    });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    return btoa(String.fromCharCode(...buf));
  } catch (_e) {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    await assertAdmin(req.headers.get("Authorization"));
    const { url } = await req.json();
    if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
      return new Response(JSON.stringify({ error: "url required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Always also fetch the head as a structured fallback proof.
    const r = await fetch(url, { headers: { Accept: "text/html" } });
    const html = await r.text();
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
    const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
    const hreflangs = Array.from(html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["']/gi))
      .map((m) => ({ lang: m[1], href: m[2] }));
    const head = {
      title: titleMatch?.[1],
      description: descMatch?.[1],
      canonical: canonMatch?.[1],
      hreflangs,
    };

    // Prefer real screenshot if available; fall back to SVG head proof.
    const realPng = await tryBrowserlessScreenshot(url);
    if (realPng) {
      return new Response(JSON.stringify({
        ok: true, kind: "png", base64: realPng, head, url,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const svg = renderHeadSvg(url, head);
    const svgB64 = btoa(unescape(encodeURIComponent(svg)));
    return new Response(JSON.stringify({
      ok: true, kind: "svg", base64: svgB64, head, url,
      note: "BROWSERLESS_TOKEN not set — returning SVG head proof instead of a real screenshot.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});