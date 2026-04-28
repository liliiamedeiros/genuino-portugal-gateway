// Daily automated SEO check: runs visibility test + sitemap diff and emails the
// summary to all admin/super_admin profile emails. Triggered by pg_cron.
//
// Public function (verify_jwt = false in config.toml is the platform default for
// Lovable-managed functions). It does not accept any user input that could leak
// data; it only fetches public URLs and reads admin emails from the profiles
// table via the service role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://genuinoinvestments.ch";

const LANGS = ["pt", "en", "fr", "de"] as const;
const KEY_PAGES = ["/", "/about", "/portfolio", "/contact"];
const SITEMAPS = [
  "/robots.txt",
  "/sitemap-index.xml",
  "/sitemap.xml",
  "/sitemap-pt.xml",
  "/sitemap-en.xml",
  "/sitemap-fr.xml",
  "/sitemap-de.xml",
];

type Check = { level: "ok" | "warn" | "error"; category: string; message: string; url?: string };

async function fetchHead(url: string) {
  try {
    const r = await fetch(url, { headers: { Accept: "text/html" } });
    const html = await r.text();
    return {
      status: r.status,
      title: html.match(/<title>([^<]*)<\/title>/i)?.[1],
      description: html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1],
      canonical: html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)?.[1],
      hreflangs: Array.from(html.matchAll(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["']/gi)).length,
    };
  } catch (e: any) {
    return { status: 0, error: e.message };
  }
}

function extractLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
}

async function runVisibilityChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  for (const sm of SITEMAPS) {
    try {
      const r = await fetch(`${SITE_URL}${sm}`, { headers: { "cache-control": "no-cache" } });
      const body = await r.text();
      if (r.status !== 200) {
        checks.push({ level: "error", category: "endpoint", url: sm, message: `HTTP ${r.status}` });
      } else if (sm.endsWith(".xml") && !body.trim().startsWith("<?xml") && !body.includes("<urlset") && !body.includes("<sitemapindex")) {
        checks.push({ level: "error", category: "endpoint", url: sm, message: "Not XML — fallback HTML returned" });
      } else {
        const count = (body.match(/<loc>/g) || []).length;
        checks.push({ level: "ok", category: "endpoint", url: sm, message: `200 OK${count ? ` (${count} <loc>)` : ""}` });
      }
    } catch (e: any) {
      checks.push({ level: "error", category: "endpoint", url: sm, message: `Network: ${e.message}` });
    }
  }
  for (const route of KEY_PAGES) {
    for (const lang of LANGS) {
      const url = `${SITE_URL}${route}?lang=${lang}`;
      const head = await fetchHead(url);
      if (head.status !== 200) {
        checks.push({ level: "error", category: `page ${route}`, url, message: `HTTP ${head.status}` });
        continue;
      }
      const probs: string[] = [];
      if (!head.title) probs.push("no title");
      if (!head.description) probs.push("no description");
      if (!head.canonical) probs.push("no canonical");
      if ((head.hreflangs || 0) < LANGS.length) probs.push(`only ${head.hreflangs} hreflangs`);
      checks.push({
        level: probs.length === 0 ? "ok" : "warn",
        category: `page ${route}`,
        url,
        message: probs.length === 0 ? `${lang.toUpperCase()} OK` : `${lang.toUpperCase()}: ${probs.join("; ")}`,
      });
    }
  }
  return checks;
}

async function runSitemapDiff(supa: any) {
  const sitemaps = ["/sitemap-pt.xml", "/sitemap-en.xml", "/sitemap-fr.xml", "/sitemap-de.xml"];
  const all: string[] = [];
  for (const sm of sitemaps) {
    try {
      const r = await fetch(`${SITE_URL}${sm}`, { headers: { "cache-control": "no-cache" } });
      if (r.status === 200) all.push(...extractLocs(await r.text()));
    } catch {/* ignore */}
  }
  const current = Array.from(new Set(all)).sort();

  // Pull the latest stored baseline from seo_snapshots
  const { data: prev } = await supa
    .from("seo_snapshots")
    .select("payload, created_at")
    .eq("snapshot_type", "sitemap_baseline")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const prevLocs: string[] = prev?.payload?.locs || [];
  const prevSet = new Set(prevLocs);
  const currSet = new Set(current);
  const added = current.filter((u) => !prevSet.has(u));
  const removed = prevLocs.filter((u) => !currSet.has(u));

  // Persist new baseline so the next run compares against today's set.
  await supa.from("seo_snapshots").insert({
    snapshot_type: "sitemap_baseline",
    label: "daily-cron",
    environment: SITE_URL,
    payload: { locs: current, capturedAt: new Date().toISOString() },
  });

  return { previousAt: prev?.created_at, currentCount: current.length, added, removed };
}

async function getAdminEmails(supa: any): Promise<string[]> {
  // Read admin/super_admin user IDs, then their profile emails.
  const { data: roles } = await supa
    .from("user_roles")
    .select("user_id")
    .in("role", ["admin", "super_admin"]);
  const ids = Array.from(new Set((roles || []).map((r: any) => r.user_id)));
  if (ids.length === 0) return [];
  const { data: profiles } = await supa
    .from("profiles")
    .select("email")
    .in("id", ids);
  return (profiles || []).map((p: any) => p.email).filter((e: any): e is string => !!e);
}

function renderEmail(checks: Check[], diff: { previousAt?: string; currentCount: number; added: string[]; removed: string[] }) {
  const ok = checks.filter((c) => c.level === "ok").length;
  const warn = checks.filter((c) => c.level === "warn").length;
  const err = checks.filter((c) => c.level === "error").length;
  const errorRows = checks.filter((c) => c.level !== "ok").slice(0, 30);

  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));

  return `<!doctype html><html><body style="font-family:-apple-system,sans-serif;background:#f6f7fb;padding:24px;color:#0f172a">
    <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;padding:24px">
      <h1 style="margin:0 0 8px 0;font-size:20px">Daily SEO check — ${esc(SITE_URL)}</h1>
      <p style="color:#64748b;margin:0 0 16px 0;font-size:12px">${new Date().toUTCString()}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr>
          <td style="background:#dcfce7;color:#166534;padding:12px;border-radius:8px;text-align:center;width:33%"><b style="font-size:22px">${ok}</b><br/>passed</td>
          <td style="width:8px"></td>
          <td style="background:#fef3c7;color:#854d0e;padding:12px;border-radius:8px;text-align:center;width:33%"><b style="font-size:22px">${warn}</b><br/>warnings</td>
          <td style="width:8px"></td>
          <td style="background:#fee2e2;color:#991b1b;padding:12px;border-radius:8px;text-align:center;width:33%"><b style="font-size:22px">${err}</b><br/>errors</td>
        </tr>
      </table>
      <h2 style="font-size:16px;margin:0 0 8px 0">Sitemap diff vs last run</h2>
      <p style="margin:0 0 12px 0;font-size:13px;color:#334155">
        Baseline: ${diff.previousAt ? esc(diff.previousAt) : "(none — first run)"}<br/>
        Current URLs: <b>${diff.currentCount}</b> ·
        <span style="color:#166534">+${diff.added.length} added</span> ·
        <span style="color:#991b1b">-${diff.removed.length} removed</span>
      </p>
      ${diff.added.length ? `<details><summary style="cursor:pointer;color:#166534">${diff.added.length} added URLs</summary><ul style="font-size:12px;font-family:monospace">${diff.added.slice(0, 50).map((u) => `<li>${esc(u)}</li>`).join("")}</ul></details>` : ""}
      ${diff.removed.length ? `<details><summary style="cursor:pointer;color:#991b1b">${diff.removed.length} removed URLs</summary><ul style="font-size:12px;font-family:monospace">${diff.removed.slice(0, 50).map((u) => `<li>${esc(u)}</li>`).join("")}</ul></details>` : ""}

      <h2 style="font-size:16px;margin:24px 0 8px 0">Issues</h2>
      ${errorRows.length === 0
        ? `<p style="color:#166534">All checks passed.</p>`
        : `<table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead><tr style="background:#f1f5f9"><th align="left" style="padding:6px">Level</th><th align="left" style="padding:6px">Category</th><th align="left" style="padding:6px">Message</th></tr></thead>
            <tbody>${errorRows.map((c) => `<tr style="border-top:1px solid #e2e8f0">
              <td style="padding:6px;color:${c.level === "error" ? "#991b1b" : "#854d0e"}">${c.level.toUpperCase()}</td>
              <td style="padding:6px">${esc(c.category)}</td>
              <td style="padding:6px">${esc(c.message)}${c.url ? `<br/><span style="color:#64748b;font-family:monospace;font-size:11px">${esc(c.url)}</span>` : ""}</td>
            </tr>`).join("")}</tbody>
          </table>`}
      <p style="color:#64748b;font-size:11px;margin-top:24px">
        Automated daily SEO check · Manage in /admin/seo/tools
      </p>
    </div>
  </body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const checks = await runVisibilityChecks();
    const diff = await runSitemapDiff(supa);

    // Persist a snapshot of this run for cross-browser inspection.
    await supa.from("seo_snapshots").insert({
      snapshot_type: "visibility_test",
      label: "daily-cron",
      environment: SITE_URL,
      payload: { checks, diff, at: new Date().toISOString() },
    });

    // Send email summary
    const emails = await getAdminEmails(supa);
    let emailSent = 0;
    let emailError: string | undefined;
    if (emails.length > 0) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (RESEND_API_KEY && LOVABLE_API_KEY) {
        try {
          const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "X-Connection-Api-Key": RESEND_API_KEY,
            },
            body: JSON.stringify({
              from: "GenuinoInvestments SEO <onboarding@resend.dev>",
              to: emails,
              subject: `Daily SEO check — ${checks.filter((c) => c.level === "error").length} errors, ${checks.filter((c) => c.level === "warn").length} warnings`,
              html: renderEmail(checks, diff),
            }),
          });
          if (res.ok) emailSent = emails.length;
          else emailError = `Resend HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`;
        } catch (e: any) {
          emailError = e.message;
        }
      } else {
        emailError = "RESEND_API_KEY or LOVABLE_API_KEY not configured";
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      checks_count: checks.length,
      diff: { added: diff.added.length, removed: diff.removed.length, currentCount: diff.currentCount },
      emails_attempted: emails.length,
      emails_sent: emailSent,
      email_error: emailError,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});