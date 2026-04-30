// Weekly automated audit: responsive audit + WebP serving check on
// recently published pages. Triggered via pg_cron with the service role key.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://genuino-portugal-gateway.lovable.app";
const BROWSERLESS_TOKEN = Deno.env.get("BROWSERLESS_TOKEN");

const BREAKPOINTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1440, height: 900 },
];

async function authorize(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token === SERVICE_KEY) return true;
  const supa = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: u } = await supa.auth.getUser(token);
  if (!u?.user) return false;
  const { data: roles } = await supa.from("user_roles").select("role").eq("user_id", u.user.id);
  return (roles || []).some((r: any) => r.role === "admin" || r.role === "super_admin");
}

async function captureScreenshot(url: string, width: number, height: number) {
  if (!BROWSERLESS_TOKEN) return { kind: "skipped", reason: "no_token" as const };
  try {
    const res = await fetch(`https://production-sfo.browserless.io/screenshot?token=${BROWSERLESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        viewport: { width, height },
        gotoOptions: { waitUntil: "networkidle2", timeout: 25000 },
      }),
    });
    if (!res.ok) return { kind: "error" as const, reason: `http_${res.status}` };
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    return { kind: "png" as const, base64: btoa(bin), bytes: buf.length };
  } catch (e) {
    return { kind: "error" as const, reason: e instanceof Error ? e.message : "fetch_failed" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const ok = await authorize(req);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supa = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const sinceDays = 7;
    const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();

    // 1) Discover recently published pages
    const { data: recent, error: recentErr } = await supa.rpc("recent_published_pages", {
      p_since: since, p_until: new Date().toISOString(),
    });
    if (recentErr) console.error("[weekly-audit] recent_published_pages error:", recentErr);

    const routes: { path: string; label: string }[] = (recent || []).map((r: any) => ({ path: r.path, label: r.label }));
    if (routes.length === 0) routes.push({ path: "/", label: "Home" });

    // 2) Create responsive audit run
    const { data: run, error: runErr } = await supa.from("responsive_audit_runs").insert({
      source: "scheduled_weekly",
      label: `Weekly auto · ${new Date().toISOString().slice(0, 10)}`,
      environment: SITE_URL,
      breakpoints: BREAKPOINTS,
      routes,
      filters: { mode: "recent_published", since_days: sinceDays },
      status: "running",
    }).select().single();
    if (runErr) throw runErr;

    let okCount = 0, failCount = 0;
    for (const r of routes) {
      for (const bp of BREAKPOINTS) {
        const url = `${SITE_URL}${r.path}`;
        const shot = await captureScreenshot(url, bp.width, bp.height);
        const status = shot.kind === "png" ? "ok" : shot.kind === "skipped" ? "skipped" : "error";
        if (status === "ok") okCount++; else if (status === "error") failCount++;
        await supa.from("responsive_audit_results").insert({
          run_id: run.id,
          route: r.path,
          breakpoint_name: bp.name,
          viewport_width: bp.width,
          viewport_height: bp.height,
          status,
          screenshot_kind: shot.kind === "png" ? "png" : null,
          screenshot_base64: shot.kind === "png" ? shot.base64 : null,
          screenshot_bytes: shot.kind === "png" ? shot.bytes : null,
          fallback_reason: shot.kind !== "png" ? (shot as any).reason : null,
        });
      }
    }

    await supa.from("responsive_audit_runs").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      summary: { ok: okCount, errors: failCount, routes: routes.length, breakpoints: BREAKPOINTS.length },
    }).eq("id", run.id);

    // 3) WebP serving check on database images
    const tables = [
      { name: "projects", col: "main_image" },
      { name: "portfolio_projects", col: "main_image" },
      { name: "project_images", col: "image_url" },
      { name: "portfolio_images", col: "image_url" },
    ];
    const webpReport: Record<string, { total: number; webp: number; non_webp: number; pct: number }> = {};
    let totalImgs = 0, totalWebp = 0;
    for (const t of tables) {
      const { data: rows } = await supa.from(t.name).select(`id, ${t.col}`).not(t.col, "is", null).limit(1000);
      const total = rows?.length || 0;
      const webp = (rows || []).filter((r: any) => /\.webp(\?|$)/i.test(r[t.col] || "")).length;
      webpReport[t.name] = {
        total, webp, non_webp: total - webp,
        pct: total ? Math.round((webp / total) * 100) : 0,
      };
      totalImgs += total; totalWebp += webp;
    }

    await supa.from("seo_snapshots").insert({
      snapshot_type: "weekly_webp_check",
      environment: SITE_URL,
      payload: {
        timestamp: new Date().toISOString(),
        total_images: totalImgs,
        webp_images: totalWebp,
        coverage_pct: totalImgs ? Math.round((totalWebp / totalImgs) * 100) : 0,
        per_table: webpReport,
      },
    });

    await supa.from("seo_snapshots").insert({
      snapshot_type: "weekly_audit_summary",
      environment: SITE_URL,
      payload: {
        timestamp: new Date().toISOString(),
        run_id: run.id,
        routes_audited: routes.length,
        breakpoints: BREAKPOINTS.length,
        ok: okCount,
        errors: failCount,
        webp_coverage_pct: totalImgs ? Math.round((totalWebp / totalImgs) * 100) : 0,
      },
    });

    return new Response(JSON.stringify({
      ok: true,
      run_id: run.id,
      routes: routes.length,
      ok_screenshots: okCount,
      failed_screenshots: failCount,
      webp: webpReport,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("[weekly-audit] error:", e);
    return new Response(JSON.stringify({ error: e.message || String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});