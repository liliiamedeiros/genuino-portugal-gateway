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
const SITE_URL = Deno.env.get("SITE_URL") || "";

const BLOCKED_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^169\.254\./,
  /^0\./,
  /^\[?::1\]?$/,
  /^\[?fc[0-9a-f]{2}:/i,
  /^\[?fe80:/i,
  /metadata\.google\.internal$/i,
];

function isUrlAllowed(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname;
    if (BLOCKED_HOST_PATTERNS.some((r) => r.test(host))) return false;
    // If SITE_URL is configured, require same host
    if (SITE_URL) {
      try {
        const allowedHost = new URL(SITE_URL).hostname;
        const allowedHosts = new Set([
          allowedHost,
          "genuino-portugal-gateway.lovable.app",
        ]);
        // Allow lovable preview subdomains
        if (
          !allowedHosts.has(host) &&
          !/\.lovable\.app$/i.test(host) &&
          !/\.lovableproject\.com$/i.test(host)
        ) {
          return false;
        }
      } catch {
        // ignore SITE_URL parse error
      }
    }
    return true;
  } catch {
    return false;
  }
}

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
type BrowserlessResult =
  | { ok: true; base64: string }
  | { ok: false; reason: "missing_token" | "http_error" | "exception"; detail?: string; status?: number };

async function tryBrowserlessScreenshot(
  url: string,
  viewport: { width: number; height: number } = { width: 1280, height: 800 },
): Promise<BrowserlessResult> {
  const token = Deno.env.get("BROWSERLESS_TOKEN");
  if (!token) {
    console.log("[seo-route-screenshot] BROWSERLESS_TOKEN missing — using SVG fallback for", url);
    return { ok: false, reason: "missing_token" };
  }
  try {
    const res = await fetch(`https://chrome.browserless.io/screenshot?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        options: { type: "png", fullPage: false },
        gotoOptions: { waitUntil: "networkidle2", timeout: 25000 },
        viewport,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const detail = text.slice(0, 300);
      console.error(
        `[seo-route-screenshot] Browserless HTTP ${res.status} for ${url} (viewport ${viewport.width}x${viewport.height}). Body: ${detail}`,
      );
      return { ok: false, reason: "http_error", status: res.status, detail };
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    const base64 = btoa(String.fromCharCode(...buf));
    console.log(
      `[seo-route-screenshot] Browserless PNG OK for ${url} — ${buf.byteLength} bytes (viewport ${viewport.width}x${viewport.height})`,
    );
    return { ok: true, base64 };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    console.error(`[seo-route-screenshot] Browserless exception for ${url}: ${detail}`);
    return { ok: false, reason: "exception", detail };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    await assertAdmin(req.headers.get("Authorization"));
    const body = await req.json().catch(() => ({}));
    const { url, viewport } = body as { url?: string; viewport?: { width: number; height: number } };
    if (typeof url !== "string" || !/^https?:\/\//.test(url) || !isUrlAllowed(url)) {
      return new Response(JSON.stringify({ error: "url not allowed" }), {
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

    // Prefer real screenshot if available; only fall back to SVG when token is missing
    // OR when the upstream call failed (with reason captured in the response + logs).
    const real = await tryBrowserlessScreenshot(url, viewport);
    if (real.ok) {
      return new Response(
        JSON.stringify({
          ok: true,
          kind: "png",
          base64: real.base64,
          bytes: Math.floor((real.base64.length * 3) / 4),
          head,
          url,
          viewport: viewport ?? { width: 1280, height: 800 },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const svg = renderHeadSvg(url, head);
    const svgB64 = btoa(unescape(encodeURIComponent(svg)));
    const note =
      real.reason === "missing_token"
        ? "BROWSERLESS_TOKEN not set — returning SVG head proof instead of a real screenshot."
        : real.reason === "http_error"
          ? `Browserless returned HTTP ${real.status ?? "?"} — falling back to SVG. Detail: ${real.detail ?? ""}`
          : `Browserless threw an exception — falling back to SVG. Detail: ${real.detail ?? ""}`;
    return new Response(
      JSON.stringify({
        ok: true,
        kind: "svg",
        base64: svgB64,
        bytes: svgB64.length,
        head,
        url,
        viewport: viewport ?? { width: 1280, height: 800 },
        fallback_reason: real.reason,
        fallback_detail: "detail" in real ? real.detail : undefined,
        fallback_status: "status" in real ? real.status : undefined,
        note,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});