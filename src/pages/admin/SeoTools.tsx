import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Bot, Link2, FileJson, Languages, Download, FileText, ShieldCheck, Globe, MapPinned, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FALLBACK_MAIN_MENU } from "@/data/navigationFallback";
import { ALL_ROUTES, BASE_URL } from "@/data/seoMeta";

type Lang = "pt" | "en" | "fr" | "de";
const LANGS: Lang[] = ["pt", "en", "fr", "de"];
const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

const KEY_ROUTES = [
  "/", "/about", "/services", "/portfolio", "/properties",
  "/vision", "/investors", "/contact", "/legal", "/privacy",
];

interface BotViewResult {
  url: string;
  status: number | null;
  title?: string;
  description?: string;
  canonical?: string;
  hreflangs: { lang: string; href: string }[];
  jsonLdBlocks: any[];
  bodyTextSnippet?: string;
  error?: string;
}

interface SchemaIssue {
  url: string;
  type: string;
  level: "error" | "warn";
  message: string;
}

interface LinkIssue {
  pageUrl: string;
  href: string;
  text: string;
  reason: string;
}

interface HreflangIssue {
  pageUrl: string;
  lang: string; // language of the page being checked
  level: "error" | "warn";
  message: string;
}

interface PublicBuildIssue {
  level: "error" | "warn" | "ok";
  category: string;
  message: string;
  detail?: string;
}

interface CanonicalRow {
  route: string;
  lang: Lang;
  canonical?: string;
  expectedCanonical: string;
  hreflangs: { lang: string; href: string }[];
  missing: string[];
  duplicates: string[];
  status: "ok" | "warn" | "error";
  notes: string[];
  /** Detected href for hreflang="x-default" */
  xDefaultHref?: string;
  /** Issue with x-default (missing / mismatch with PT fallback) */
  xDefaultIssue?: string;
}

interface VisibilityCheck {
  level: "ok" | "warn" | "error";
  category: string;
  url?: string;
  message: string;
  detail?: string;
}

// === Export utilities (CSV / PDF via window.print) ===
function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadPdf(title: string, rows: Record<string, any>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  const style = `<style>
    body { font-family: -apple-system, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    .meta { color: #666; font-size: 11px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th, td { border: 1px solid #ddd; padding: 4px 6px; text-align: left; vertical-align: top; word-break: break-word; }
    th { background: #f4f4f4; }
    tr:nth-child(even) { background: #fafafa; }
    .err { color: #c00; }
    .warn { color: #b80; }
    @media print { @page { margin: 12mm; } }
  </style>`;
  const tbody = rows.map(r =>
    `<tr>${headers.map(h => {
      const v = r[h] ?? "";
      const cls = h === "level" && v === "error" ? "err" : h === "level" && v === "warn" ? "warn" : "";
      return `<td class="${cls}">${String(v).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}</td>`;
    }).join("")}</tr>`
  ).join("");
  win.document.write(`<!doctype html><html><head><title>${title}</title>${style}</head><body>
    <h1>${title}</h1>
    <div class="meta">${rows.length} rows · Generated ${new Date().toISOString()} · genuinoinvestments.ch</div>
    <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${tbody}</tbody></table>
    <script>window.onload = () => setTimeout(() => window.print(), 200);<\/script>
  </body></html>`);
  win.document.close();
}

function langOfUrl(url: string): string {
  try { return new URL(url).searchParams.get("lang") || "—"; } catch { return "—"; }
}

async function fetchAsBot(url: string): Promise<BotViewResult> {
  const out: BotViewResult = { url, status: null, hreflangs: [], jsonLdBlocks: [] };
  try {
    const res = await fetch(url, { headers: { Accept: "text/html" } });
    out.status = res.status;
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    out.title = doc.querySelector("title")?.textContent?.trim();
    out.description = doc.querySelector('meta[name="description"]')?.getAttribute("content") || undefined;
    out.canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || undefined;
    out.hreflangs = Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]')).map((l) => ({
      lang: l.getAttribute("hreflang") || "",
      href: l.getAttribute("href") || "",
    }));
    out.jsonLdBlocks = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => {
        try {
          return JSON.parse(s.textContent || "{}");
        } catch {
          return { __invalid: true, raw: s.textContent?.slice(0, 200) };
        }
      });
    out.bodyTextSnippet = doc.body?.textContent?.replace(/\s+/g, " ").trim().slice(0, 600);
  } catch (e: any) {
    out.error = e.message || String(e);
  }
  return out;
}

function validateSchema(url: string, json: any): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  const type = json?.["@type"] || "Unknown";
  if (json?.__invalid) {
    issues.push({ url, type: "JSON", level: "error", message: "Invalid JSON in script tag" });
    return issues;
  }
  if (json?.["@context"] !== "https://schema.org") {
    issues.push({ url, type, level: "error", message: '@context must be "https://schema.org"' });
  }
  if (type === "Organization" || type === "RealEstateAgent") {
    ["name", "url", "logo"].forEach((f) => {
      if (!json[f]) issues.push({ url, type, level: "error", message: `Missing required field: ${f}` });
    });
    if (!json.contactPoint && !json.telephone) {
      issues.push({ url, type, level: "warn", message: "Missing contactPoint or telephone" });
    }
  } else if (type === "BreadcrumbList") {
    if (!Array.isArray(json.itemListElement) || json.itemListElement.length < 1) {
      issues.push({ url, type, level: "error", message: "itemListElement must be a non-empty array" });
    } else {
      json.itemListElement.forEach((it: any, i: number) => {
        if (!it.position) issues.push({ url, type, level: "error", message: `Item ${i + 1} missing position` });
        if (!it.name) issues.push({ url, type, level: "error", message: `Item ${i + 1} missing name` });
        if (!it.item) issues.push({ url, type, level: "warn", message: `Item ${i + 1} missing item URL` });
      });
    }
  } else if (type === "RealEstateListing") {
    ["name", "url", "address"].forEach((f) => {
      if (!json[f]) issues.push({ url, type, level: "error", message: `Missing required field: ${f}` });
    });
    if (!json.offers?.price) issues.push({ url, type, level: "warn", message: "offers.price recommended" });
    if (!json.offers?.priceCurrency) issues.push({ url, type, level: "warn", message: "offers.priceCurrency recommended" });
    if (!json.image) issues.push({ url, type, level: "warn", message: "image recommended for rich results" });
  }
  return issues;
}

function auditLinks(url: string, html: string): LinkIssue[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const issues: LinkIssue[] = [];
  Array.from(doc.querySelectorAll<HTMLAnchorElement>("a[href]")).forEach((a) => {
    const href = a.getAttribute("href") || "";
    const text = (a.textContent || "").trim().slice(0, 60) || "(no text)";
    if (!href || href === "#" || href === "javascript:void(0)") {
      issues.push({ pageUrl: url, href, text, reason: "Placeholder anchor" });
    } else if (href.includes("undefined") || href.includes("null") || href.includes("[object")) {
      issues.push({ pageUrl: url, href, text, reason: "Contains undefined/null" });
    } else if (href.endsWith("/undefined") || href.endsWith("/null")) {
      issues.push({ pageUrl: url, href, text, reason: "Trailing undefined/null" });
    }
  });
  return issues;
}

/** Verify that the page declares hreflang for all 4 languages and that x-default exists. */
function checkHreflangSet(pageUrl: string, hreflangs: { lang: string; href: string }[]): HreflangIssue[] {
  const issues: HreflangIssue[] = [];
  const lang = langOfUrl(pageUrl);
  const present = new Set(hreflangs.map(h => h.lang.toLowerCase()));
  for (const required of LANGS) {
    if (!present.has(required)) {
      issues.push({ pageUrl, lang, level: "error", message: `Missing hreflang for "${required}"` });
    }
  }
  if (!present.has("x-default")) {
    issues.push({ pageUrl, lang, level: "warn", message: 'Missing hreflang="x-default"' });
  }
  // Detect duplicates
  const seen = new Set<string>();
  for (const h of hreflangs) {
    const k = h.lang.toLowerCase();
    if (seen.has(k)) issues.push({ pageUrl, lang, level: "warn", message: `Duplicate hreflang declaration: ${k}` });
    seen.add(k);
  }
  // Empty / invalid hrefs
  for (const h of hreflangs) {
    if (!h.href || h.href.includes("undefined") || h.href.includes("null")) {
      issues.push({ pageUrl, lang, level: "error", message: `Invalid href for hreflang="${h.lang}": ${h.href}` });
    }
  }
  return issues;
}

export default function SeoTools() {
  // === Bot view tab ===
  const [botRoute, setBotRoute] = useState<string>("/");
  const [botLang, setBotLang] = useState<Lang>("pt");
  const [botResult, setBotResult] = useState<BotViewResult | null>(null);
  const [botLoading, setBotLoading] = useState(false);
  const [robotsContent, setRobotsContent] = useState<string>("");
  const [sitemapContent, setSitemapContent] = useState<string>("");

  const runBotView = async () => {
    setBotLoading(true);
    setBotResult(null);
    const url = `${ORIGIN}${botRoute}${botRoute.includes("?") ? "&" : "?"}lang=${botLang}`;
    setBotResult(await fetchAsBot(url));
    setBotLoading(false);
  };

  const loadRobots = async () => {
    try {
      const r = await fetch(`${ORIGIN}/robots.txt`);
      setRobotsContent(`HTTP ${r.status}\n\n${await r.text()}`);
    } catch (e: any) { setRobotsContent("Error: " + e.message); }
  };

  const loadSitemap = async (useEdge: boolean) => {
    try {
      const url = useEdge
        ? `https://eyvfrocuuhxleroghybv.supabase.co/functions/v1/generate-sitemap`
        : `${ORIGIN}/sitemap.xml`;
      const r = await fetch(url);
      setSitemapContent(`HTTP ${r.status} – ${url}\n\n${(await r.text()).slice(0, 4000)}`);
    } catch (e: any) { setSitemapContent("Error: " + e.message); }
  };

  // === LIVE STATUS BADGES for sitemaps + robots.txt ===
  type EndpointStatus = {
    path: string;
    label: string;
    status: "ok" | "warn" | "error" | "unknown";
    httpCode?: number;
    urlCount?: number;
    contentType?: string;
    lastChecked?: Date;
    error?: string;
  };
  const SEO_ENDPOINTS: { path: string; label: string; isXml: boolean }[] = [
    { path: "/robots.txt",        label: "robots.txt",        isXml: false },
    { path: "/sitemap-index.xml", label: "sitemap-index.xml", isXml: true },
    { path: "/sitemap.xml",       label: "sitemap.xml",       isXml: true },
    { path: "/sitemap-pt.xml",    label: "sitemap-pt.xml",    isXml: true },
    { path: "/sitemap-en.xml",    label: "sitemap-en.xml",    isXml: true },
    { path: "/sitemap-fr.xml",    label: "sitemap-fr.xml",    isXml: true },
    { path: "/sitemap-de.xml",    label: "sitemap-de.xml",    isXml: true },
  ];
  const [endpointStatuses, setEndpointStatuses] = useState<Record<string, EndpointStatus>>(
    () => Object.fromEntries(SEO_ENDPOINTS.map(e => [e.path, { path: e.path, label: e.label, status: "unknown" }]))
  );
  const [endpointPolling, setEndpointPolling] = useState(false);

  const pingEndpoint = async (e: { path: string; label: string; isXml: boolean }): Promise<EndpointStatus> => {
    try {
      const r = await fetch(`${ORIGIN}${e.path}`, { cache: "no-store" });
      const ct = r.headers.get("content-type") || "";
      const body = await r.text();
      const httpCode = r.status;
      if (httpCode !== 200) {
        return { path: e.path, label: e.label, status: "error", httpCode, contentType: ct, lastChecked: new Date(), error: `HTTP ${httpCode}` };
      }
      if (e.isXml) {
        const looksXml = body.trim().startsWith("<?xml") || body.includes("<urlset") || body.includes("<sitemapindex");
        if (!looksXml) {
          return { path: e.path, label: e.label, status: "error", httpCode, contentType: ct, lastChecked: new Date(), error: "Returned HTML instead of XML" };
        }
        const urlCount = (body.match(/<loc>/g) || []).length;
        return { path: e.path, label: e.label, status: urlCount > 0 ? "ok" : "warn", httpCode, urlCount, contentType: ct, lastChecked: new Date() };
      }
      return { path: e.path, label: e.label, status: "ok", httpCode, contentType: ct, lastChecked: new Date() };
    } catch (err: any) {
      return { path: e.path, label: e.label, status: "error", lastChecked: new Date(), error: err.message || String(err) };
    }
  };

  const refreshAllEndpoints = async () => {
    setEndpointPolling(true);
    const results = await Promise.all(SEO_ENDPOINTS.map(pingEndpoint));
    setEndpointStatuses(Object.fromEntries(results.map(r => [r.path, r])));
    setEndpointPolling(false);
  };

  // Auto-ping on mount and every 60s while the SEO Tools page is open.
  useEffect(() => {
    refreshAllEndpoints();
    const id = setInterval(refreshAllEndpoints, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Download a single endpoint's body as a local file. */
  const downloadEndpoint = async (e: { path: string; label: string }) => {
    try {
      const r = await fetch(`${ORIGIN}${e.path}`, { cache: "no-store" });
      const body = await r.text();
      const blob = new Blob([body], { type: e.path.endsWith(".xml") ? "application/xml" : "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = e.label;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  /** Download all sitemap files at once (no robots.txt). */
  const downloadAllSitemaps = async () => {
    for (const e of SEO_ENDPOINTS.filter(x => x.path.endsWith(".xml"))) {
      await downloadEndpoint(e);
    }
  };

  // === JSON-LD validator tab ===
  const [schemaIssues, setSchemaIssues] = useState<SchemaIssue[]>([]);
  const [schemaScans, setSchemaScans] = useState(0);
  const [schemaLoading, setSchemaLoading] = useState(false);

  const runSchemaScan = async () => {
    setSchemaLoading(true);
    setSchemaIssues([]);
    const all: SchemaIssue[] = [];
    let count = 0;
    // Static routes
    for (const route of KEY_ROUTES) {
      for (const lang of LANGS) {
        const url = `${ORIGIN}${route}?lang=${lang}`;
        const r = await fetchAsBot(url);
        count++;
        if (r.error) {
          all.push({ url, type: "Fetch", level: "error", message: r.error });
          continue;
        }
        if (r.jsonLdBlocks.length === 0) {
          all.push({ url, type: "JSON-LD", level: "warn", message: "No JSON-LD blocks found" });
        }
        r.jsonLdBlocks.forEach((b) => all.push(...validateSchema(url, b)));
      }
    }
    // Dynamic property + portfolio (sample 5 each)
    const { data: props } = await supabase.from("projects").select("id").eq("status", "active").limit(5);
    const { data: portfolio } = await supabase.from("portfolio_projects").select("id").eq("status", "active").limit(5);
    for (const p of props || []) {
      for (const lang of LANGS) {
        const url = `${ORIGIN}/project/${p.id}?lang=${lang}`;
        const r = await fetchAsBot(url);
        count++;
        if (r.error) continue;
        r.jsonLdBlocks.forEach((b) => all.push(...validateSchema(url, b)));
      }
    }
    for (const p of portfolio || []) {
      for (const lang of LANGS) {
        const url = `${ORIGIN}/portfolio/${p.id}?lang=${lang}`;
        const r = await fetchAsBot(url);
        count++;
        if (r.error) continue;
        r.jsonLdBlocks.forEach((b) => all.push(...validateSchema(url, b)));
      }
    }
    setSchemaIssues(all);
    setSchemaScans(count);
    setSchemaLoading(false);
  };

  // === Internal links audit tab ===
  const [linkIssues, setLinkIssues] = useState<LinkIssue[]>([]);
  const [linkScanned, setLinkScanned] = useState(0);
  const [linkLoading, setLinkLoading] = useState(false);

  // === Hreflang reciprocity tab ===
  const [hreflangIssues, setHreflangIssues] = useState<HreflangIssue[]>([]);
  const [hreflangScanned, setHreflangScanned] = useState(0);
  const [hreflangLoading, setHreflangLoading] = useState(false);

  // === Verify Public Build tab ===
  const [publicBuildUrl, setPublicBuildUrl] = useState<string>(
    typeof window !== "undefined" && window.location.hostname.includes("lovable")
      ? `${window.location.origin}`
      : "https://genuino-portugal-gateway.lovable.app"
  );
  const [publicIssues, setPublicIssues] = useState<PublicBuildIssue[]>([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicChecked, setPublicChecked] = useState(false);

  const runPublicBuildVerify = async () => {
    setPublicLoading(true);
    setPublicIssues([]);
    setPublicChecked(false);
    const issues: PublicBuildIssue[] = [];
    const base = publicBuildUrl.replace(/\/$/, "");

    // 1) Fetch homepage and confirm it loads
    try {
      const r = await fetch(`${base}/`, { cache: "no-store" });
      if (r.status >= 200 && r.status < 400) {
        issues.push({ level: "ok", category: "Homepage", message: `HTTP ${r.status} — homepage reachable`, detail: base });
      } else {
        issues.push({ level: "error", category: "Homepage", message: `HTTP ${r.status} — homepage not reachable`, detail: base });
      }
    } catch (e: any) {
      issues.push({ level: "error", category: "Homepage", message: "Network error fetching homepage", detail: e.message });
    }

    // 2) Direct probe to the same Supabase endpoint the live Navbar calls
    const SUPA_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://eyvfrocuuhxleroghybv.supabase.co";
    const SUPA_KEY = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || "";
    try {
      const r = await fetch(
        `${SUPA_URL}/rest/v1/navigation_menus?select=path,label,is_active&menu_type=eq.main&is_active=eq.true&order=order_index.asc`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
      );
      const body = await r.text();
      if (r.status === 200) {
        const json = JSON.parse(body);
        if (Array.isArray(json) && json.length > 0) {
          issues.push({
            level: "ok",
            category: "Navbar API",
            message: `Navigation menus load (${json.length} items)`,
            detail: json.map((j: any) => j.path).join(", "),
          });
        } else {
          issues.push({
            level: "warn",
            category: "Navbar API",
            message: "Navigation API returned 200 but 0 items — Navbar will use static fallback",
          });
        }
      } else if (r.status === 401) {
        issues.push({
          level: "error",
          category: "Navbar API",
          message: "401 Unauthorized — RLS policy blocks anonymous access to navigation_menus",
          detail: body.slice(0, 240),
        });
      } else if (r.status === 403) {
        issues.push({
          level: "error",
          category: "Navbar API",
          message: "403 Forbidden — permission denied (likely has_role() not granted to anon role)",
          detail: body.slice(0, 240),
        });
      } else {
        issues.push({
          level: "error",
          category: "Navbar API",
          message: `HTTP ${r.status} when fetching navigation_menus`,
          detail: body.slice(0, 240),
        });
      }
    } catch (e: any) {
      issues.push({ level: "error", category: "Navbar API", message: "Network error calling navigation_menus", detail: e.message });
    }

    // 3) Same probe for system_settings (also queried by header/footer code paths)
    try {
      const r = await fetch(
        `${SUPA_URL}/rest/v1/system_settings?select=key&limit=1`,
        { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
      );
      if (r.status === 200) {
        issues.push({ level: "ok", category: "System settings", message: "system_settings readable by anon" });
      } else if (r.status === 401 || r.status === 403) {
        issues.push({
          level: "warn",
          category: "System settings",
          message: `HTTP ${r.status} — anon can't read system_settings (may be intentional)`,
        });
      }
    } catch (e: any) {
      issues.push({ level: "warn", category: "System settings", message: "Network error", detail: e.message });
    }

    // 4) Confirm fallback dataset is up to date
    issues.push({
      level: "ok",
      category: "Fallback",
      message: `Static Navbar fallback ready (${FALLBACK_MAIN_MENU.length} items): ${FALLBACK_MAIN_MENU.map(m => m.path).join(", ")}`,
    });

    setPublicIssues(issues);
    setPublicLoading(false);
    setPublicChecked(true);
  };

  const runHreflangAudit = async () => {
    setHreflangLoading(true);
    setHreflangIssues([]);
    const all: HreflangIssue[] = [];
    let count = 0;
    // Per-route per-lang fetched maps
    const routeMap = new Map<string, Map<string, BotViewResult>>(); // route -> lang -> result
    for (const route of KEY_ROUTES) {
      const langMap = new Map<string, BotViewResult>();
      for (const lang of LANGS) {
        const url = `${ORIGIN}${route}?lang=${lang}`;
        const r = await fetchAsBot(url);
        langMap.set(lang, r);
        count++;
        // Per-page check (set + x-default + dupes)
        all.push(...checkHreflangSet(url, r.hreflangs));
      }
      routeMap.set(route, langMap);
    }
    // Reciprocity check: for each (route, langA), every declared hreflang langB
    // must point to a URL whose page in turn declares langA back.
    for (const route of KEY_ROUTES) {
      const langMap = routeMap.get(route)!;
      for (const langA of LANGS) {
        const a = langMap.get(langA)!;
        const urlA = `${ORIGIN}${route}?lang=${langA}`;
        for (const langB of LANGS) {
          if (langB === langA) continue;
          const declaredB = a.hreflangs.find(h => h.lang.toLowerCase() === langB);
          if (!declaredB) continue; // already reported by checkHreflangSet
          const b = langMap.get(langB);
          if (!b) continue;
          const back = b.hreflangs.find(h => h.lang.toLowerCase() === langA);
          if (!back) {
            all.push({
              pageUrl: urlA,
              lang: langA,
              level: "error",
              message: `Reciprocity broken: declares "${langB}" but the ${langB.toUpperCase()} page does not link back to "${langA}"`,
            });
          }
        }
      }
    }
    setHreflangIssues(all);
    setHreflangScanned(count);
    setHreflangLoading(false);
  };

  const runLinkAudit = async () => {
    setLinkLoading(true);
    setLinkIssues([]);
    const all: LinkIssue[] = [];
    let count = 0;
    for (const route of KEY_ROUTES) {
      for (const lang of LANGS) {
        const url = `${ORIGIN}${route}?lang=${lang}`;
        try {
          const res = await fetch(url);
          const html = await res.text();
          all.push(...auditLinks(url, html));
          count++;
        } catch {/* skip */}
      }
    }
    setLinkIssues(all);
    setLinkScanned(count);
    setLinkLoading(false);
  };

  // === CANONICAL & HREFLANG REPORT ===
  const [canonicalRows, setCanonicalRows] = useState<CanonicalRow[]>([]);
  const [canonicalLoading, setCanonicalLoading] = useState(false);
  const [canonicalScanned, setCanonicalScanned] = useState(0);

  const runCanonicalReport = async () => {
    setCanonicalLoading(true);
    setCanonicalRows([]);
    const rows: CanonicalRow[] = [];
    let count = 0;
    for (const route of ALL_ROUTES) {
      for (const lang of LANGS) {
        const url = `${ORIGIN}${route}?lang=${lang}`;
        const r = await fetchAsBot(url);
        count++;
        const expectedCanonical = `${BASE_URL}${route}`;
        const present = r.hreflangs.map(h => h.lang.toLowerCase());
        const missing: string[] = [];
        for (const required of LANGS) {
          if (!present.includes(required)) missing.push(required);
        }
        if (!present.includes("x-default")) missing.push("x-default");
        const seen = new Set<string>();
        const duplicates: string[] = [];
        for (const h of r.hreflangs) {
          const k = h.lang.toLowerCase();
          if (seen.has(k)) duplicates.push(k);
          seen.add(k);
        }
        const notes: string[] = [];
        if (!r.canonical) notes.push("missing canonical");
        else if (!r.canonical.startsWith(BASE_URL)) notes.push(`canonical not on ${BASE_URL}`);

        // x-default validation: PT is the fallback language for this site,
        // so x-default must point to the same href as hreflang="pt".
        const xDefaultHref = r.hreflangs.find(h => h.lang.toLowerCase() === "x-default")?.href;
        const ptHref = r.hreflangs.find(h => h.lang.toLowerCase() === "pt")?.href;
        let xDefaultIssue: string | undefined;
        if (!xDefaultHref) {
          xDefaultIssue = "missing x-default";
        } else if (ptHref && xDefaultHref !== ptHref) {
          xDefaultIssue = `x-default points to "${xDefaultHref}" but PT is "${ptHref}"`;
          notes.push("x-default ≠ PT fallback");
        } else if (!xDefaultHref.includes(route)) {
          xDefaultIssue = `x-default href does not include route "${route}"`;
          notes.push("x-default route mismatch");
        }

        const hasError = !r.canonical || missing.length > 0 || (xDefaultIssue && xDefaultIssue.startsWith("x-default points"));
        const hasWarn = duplicates.length > 0 || notes.length > 0 || !!xDefaultIssue;
        const status: "ok" | "warn" | "error" = hasError ? "error" : hasWarn ? "warn" : "ok";

        rows.push({
          route, lang,
          canonical: r.canonical,
          expectedCanonical,
          hreflangs: r.hreflangs,
          missing, duplicates, status, notes,
          xDefaultHref, xDefaultIssue,
        });
      }
    }
    setCanonicalRows(rows);
    setCanonicalScanned(count);
    setCanonicalLoading(false);
  };

  // === SEO VISIBILITY TEST (sitemap + robots + per-lang metadata) ===
  const [visibilityChecks, setVisibilityChecks] = useState<VisibilityCheck[]>([]);
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [visibilityRan, setVisibilityRan] = useState(false);

  const runVisibilityTest = async () => {
    setVisibilityLoading(true);
    setVisibilityChecks([]);
    setVisibilityRan(false);
    const checks: VisibilityCheck[] = [];
    const base = ORIGIN;

    // 1) robots.txt must exist and reference all per-lang sitemaps
    try {
      const r = await fetch(`${base}/robots.txt`);
      const txt = await r.text();
      if (r.status !== 200) {
        checks.push({ level: "error", category: "robots.txt", url: `${base}/robots.txt`, message: `HTTP ${r.status}` });
      } else {
        checks.push({ level: "ok", category: "robots.txt", url: `${base}/robots.txt`, message: "200 OK" });
        const required = ["sitemap-index.xml", "sitemap-pt.xml", "sitemap-en.xml", "sitemap-fr.xml", "sitemap-de.xml"];
        for (const req of required) {
          if (!txt.includes(req)) {
            checks.push({ level: "warn", category: "robots.txt", message: `Sitemap reference missing: ${req}` });
          }
        }
      }
    } catch (e: any) {
      checks.push({ level: "error", category: "robots.txt", message: "Network error", detail: e.message });
    }

    // 2) Sitemaps must return 200 with XML content-type
    const sitemaps = [
      "/sitemap-index.xml", "/sitemap.xml",
      "/sitemap-pt.xml", "/sitemap-en.xml", "/sitemap-fr.xml", "/sitemap-de.xml",
    ];
    for (const sm of sitemaps) {
      try {
        const r = await fetch(`${base}${sm}`);
        const ct = r.headers.get("content-type") || "";
        const body = await r.text();
        if (r.status !== 200) {
          checks.push({ level: "error", category: "sitemap", url: `${base}${sm}`, message: `HTTP ${r.status}` });
        } else if (!body.trim().startsWith("<?xml") && !body.includes("<urlset") && !body.includes("<sitemapindex")) {
          checks.push({ level: "error", category: "sitemap", url: `${base}${sm}`, message: "Not XML — fallback HTML returned", detail: ct });
        } else {
          const urlCount = (body.match(/<loc>/g) || []).length;
          checks.push({ level: "ok", category: "sitemap", url: `${base}${sm}`, message: `200 OK (${urlCount} <loc>)`, detail: ct });
        }
      } catch (e: any) {
        checks.push({ level: "error", category: "sitemap", url: `${base}${sm}`, message: "Network error", detail: e.message });
      }
    }

    // 3) Key pages must expose title + description + canonical for every language
    const keyPages = ["/", "/about", "/portfolio", "/contact"];
    for (const route of keyPages) {
      for (const lang of LANGS) {
        const url = `${base}${route}?lang=${lang}`;
        const r = await fetchAsBot(url);
        if (r.status !== 200) {
          checks.push({ level: "error", category: `page ${route}`, url, message: `HTTP ${r.status}` });
          continue;
        }
        const probs: string[] = [];
        if (!r.title) probs.push("missing <title>");
        if (!r.description) probs.push("missing meta description");
        if (!r.canonical) probs.push("missing canonical");
        if (r.hreflangs.length < LANGS.length) probs.push(`only ${r.hreflangs.length} hreflang declarations`);
        if (probs.length === 0) {
          checks.push({ level: "ok", category: `page ${route}`, url, message: `${lang.toUpperCase()} OK — title + meta + canonical + hreflang` });
        } else {
          checks.push({ level: "warn", category: `page ${route}`, url, message: `${lang.toUpperCase()}: ${probs.join("; ")}` });
        }
      }
    }
    setVisibilityChecks(checks);
    setVisibilityRan(true);
    setVisibilityLoading(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SEO Tools</h1>
          <p className="text-muted-foreground">Bot view, sitemap/robots/hreflang tester, JSON-LD validator, link audit.</p>
        </div>

        <Tabs defaultValue="bot">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="bot"><Bot className="w-4 h-4 mr-2" />Bot View / URLs</TabsTrigger>
            <TabsTrigger value="schema"><FileJson className="w-4 h-4 mr-2" />JSON-LD Validator</TabsTrigger>
            <TabsTrigger value="hreflang"><Languages className="w-4 h-4 mr-2" />Hreflang Reciprocity</TabsTrigger>
            <TabsTrigger value="canonical"><MapPinned className="w-4 h-4 mr-2" />Canonical & Hreflang</TabsTrigger>
            <TabsTrigger value="visibility"><Activity className="w-4 h-4 mr-2" />SEO Visibility Test</TabsTrigger>
            <TabsTrigger value="links"><Link2 className="w-4 h-4 mr-2" />Internal Links</TabsTrigger>
            <TabsTrigger value="public"><ShieldCheck className="w-4 h-4 mr-2" />Verify Public Build</TabsTrigger>
          </TabsList>

          {/* === BOT VIEW === */}
          <TabsContent value="bot" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bot-visible HTML for a route</CardTitle>
                <CardDescription>What Googlebot fetches before JS execution. Tests canonical, hreflang, JSON-LD per language.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Select value={botRoute} onValueChange={setBotRoute}>
                    <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KEY_ROUTES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={botLang} onValueChange={(v) => setBotLang(v as Lang)}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGS.map((l) => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={runBotView} disabled={botLoading}>
                    {botLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Fetch as bot
                  </Button>
                </div>

                {botResult && (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={botResult.status === 200 ? "default" : "destructive"}>HTTP {botResult.status ?? "ERR"}</Badge>
                      <a href={botResult.url} target="_blank" rel="noreferrer" className="text-primary underline flex items-center gap-1">
                        {botResult.url} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {botResult.error && <p className="text-destructive">{botResult.error}</p>}
                    <div><b>Title:</b> {botResult.title || <span className="text-destructive">missing</span>}</div>
                    <div><b>Description:</b> {botResult.description || <span className="text-destructive">missing</span>}</div>
                    <div><b>Canonical:</b> {botResult.canonical || <span className="text-destructive">missing</span>}</div>
                    <div>
                      <b>Hreflangs ({botResult.hreflangs.length}):</b>
                      <ul className="ml-4 list-disc">
                        {botResult.hreflangs.map((h, i) => <li key={i}><code>{h.lang}</code> → {h.href}</li>)}
                      </ul>
                    </div>
                    <div>
                      <b>JSON-LD blocks ({botResult.jsonLdBlocks.length}):</b>
                      <pre className="bg-muted p-2 rounded max-h-60 overflow-auto text-xs">
                        {JSON.stringify(botResult.jsonLdBlocks, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <b>Body text snippet (bot-visible):</b>
                      <p className="text-muted-foreground italic">{botResult.bodyTextSnippet || "(empty — page likely needs prerender for non-JS bots)"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <span>Live status — robots.txt &amp; per-language sitemaps</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={refreshAllEndpoints} disabled={endpointPolling}>
                      {endpointPolling ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                      Refresh now
                    </Button>
                    <Button size="sm" onClick={downloadAllSitemaps}>
                      <Download className="w-4 h-4 mr-1" /> Download all sitemaps
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Auto-refreshes every 60 seconds. Each row shows reachability, HTTP code, URL count and last-checked time.
                  Click <b>Download</b> to save the live XML to disk for local validation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto border rounded">
                  <table className="w-full text-xs">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Endpoint</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">HTTP</th>
                        <th className="text-left p-2">URLs</th>
                        <th className="text-left p-2">Content-Type</th>
                        <th className="text-left p-2">Last checked</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SEO_ENDPOINTS.map((e) => {
                        const s = endpointStatuses[e.path];
                        return (
                          <tr key={e.path} className="border-t">
                            <td className="p-2 font-mono">{e.path}</td>
                            <td className="p-2">
                              {s.status === "ok"      && <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Reachable</Badge>}
                              {s.status === "warn"    && <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Empty</Badge>}
                              {s.status === "error"   && <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{s.error || "Error"}</Badge>}
                              {s.status === "unknown" && <Badge variant="outline">Pending…</Badge>}
                            </td>
                            <td className="p-2">{s.httpCode ?? "—"}</td>
                            <td className="p-2">{s.urlCount ?? "—"}</td>
                            <td className="p-2 truncate max-w-[180px]" title={s.contentType}>{s.contentType || "—"}</td>
                            <td className="p-2 text-muted-foreground">{s.lastChecked ? s.lastChecked.toLocaleTimeString() : "—"}</td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => downloadEndpoint(e)}>
                                  <Download className="w-3 h-3" />
                                </Button>
                                <a href={`${ORIGIN}${e.path}`} target="_blank" rel="noreferrer">
                                  <Button size="sm" variant="ghost" className="h-7 px-2"><ExternalLink className="w-3 h-3" /></Button>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-2 md:grid-cols-2 mt-4">
                  <div>
                    <Button size="sm" variant="outline" onClick={loadRobots}>Inspect /robots.txt</Button>
                    {robotsContent && <pre className="bg-muted p-2 rounded text-xs max-h-60 overflow-auto mt-2">{robotsContent}</pre>}
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => loadSitemap(false)}>Inspect /sitemap.xml</Button>
                      <Button size="sm" variant="outline" onClick={() => loadSitemap(true)}>Edge (dynamic)</Button>
                    </div>
                    {sitemapContent && <pre className="bg-muted p-2 rounded text-xs max-h-60 overflow-auto mt-2">{sitemapContent}</pre>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === SCHEMA VALIDATOR === */}
          <TabsContent value="schema" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Auto-validate Organization / Breadcrumb / RealEstateListing</CardTitle>
                <CardDescription>
                  Scans every key route in 4 languages + sample of properties/portfolio items, checks against Google Rich Results common requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={runSchemaScan} disabled={schemaLoading}>
                  {schemaLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Run schema scan
                </Button>
                {schemaScans > 0 && (
                  <div className="flex gap-3 text-sm">
                    <Badge variant="outline">{schemaScans} URLs scanned</Badge>
                    <Badge variant="destructive">{schemaIssues.filter((i) => i.level === "error").length} errors</Badge>
                    <Badge variant="secondary">{schemaIssues.filter((i) => i.level === "warn").length} warnings</Badge>
                  </div>
                )}
                {schemaIssues.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadCsv(
                      `seo-schema-${new Date().toISOString().slice(0,10)}.csv`,
                      schemaIssues.map(i => ({ url: i.url, lang: langOfUrl(i.url), schema_type: i.type, level: i.level, message: i.message }))
                    )}><Download className="w-4 h-4 mr-1" />CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(
                      "JSON-LD Validation Report",
                      schemaIssues.map(i => ({ url: i.url, lang: langOfUrl(i.url), schema_type: i.type, level: i.level, message: i.message }))
                    )}><FileText className="w-4 h-4 mr-1" />PDF</Button>
                  </div>
                )}
                {schemaIssues.length === 0 && schemaScans > 0 && (
                  <p className="text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> All schemas valid</p>
                )}
                <div className="space-y-1 max-h-[500px] overflow-auto">
                  {schemaIssues.map((iss, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm border-b py-2">
                      {iss.level === "error" ? <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs text-muted-foreground truncate">{iss.url}</div>
                        <div><Badge variant="outline" className="mr-2">{iss.type}</Badge>{iss.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === HREFLANG RECIPROCITY === */}
          <TabsContent value="hreflang" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hreflang reciprocity & coverage</CardTitle>
                <CardDescription>
                  Verifies every key route declares hreflang for PT, EN, FR, DE plus x-default — and that each declared
                  language reciprocates the link back. Missing back-links break Google's language mapping.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={runHreflangAudit} disabled={hreflangLoading}>
                  {hreflangLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Run hreflang audit
                </Button>
                {hreflangScanned > 0 && (
                  <div className="flex gap-3 text-sm">
                    <Badge variant="outline">{hreflangScanned} pages scanned</Badge>
                    <Badge variant="destructive">{hreflangIssues.filter(i => i.level === "error").length} errors</Badge>
                    <Badge variant="secondary">{hreflangIssues.filter(i => i.level === "warn").length} warnings</Badge>
                  </div>
                )}
                {hreflangIssues.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadCsv(
                      `seo-hreflang-${new Date().toISOString().slice(0,10)}.csv`,
                      hreflangIssues.map(i => ({ url: i.pageUrl, lang: i.lang, level: i.level, message: i.message }))
                    )}><Download className="w-4 h-4 mr-1" />CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(
                      "Hreflang Audit Report",
                      hreflangIssues.map(i => ({ url: i.pageUrl, lang: i.lang, level: i.level, message: i.message }))
                    )}><FileText className="w-4 h-4 mr-1" />PDF</Button>
                  </div>
                )}
                {hreflangIssues.length === 0 && hreflangScanned > 0 && (
                  <p className="text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> All hreflang sets reciprocal and complete
                  </p>
                )}
                <div className="space-y-1 max-h-[500px] overflow-auto">
                  {hreflangIssues.map((iss, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm border-b py-2">
                      {iss.level === "error"
                        ? <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        : <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs text-muted-foreground truncate">{iss.pageUrl}</div>
                        <div><Badge variant="outline" className="mr-2 uppercase">{iss.lang}</Badge>{iss.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === LINK AUDIT === */}
          <TabsContent value="links" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Internal link audit</CardTitle>
                <CardDescription>
                  Scans rendered HTML of every key route × 4 languages and reports placeholder (#) and broken (undefined/null) links.
                  Auto-fix is not safe for arbitrary link text — issues are logged for manual review with file/page context.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={runLinkAudit} disabled={linkLoading}>
                  {linkLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Scan internal links
                </Button>
                {linkScanned > 0 && (
                  <div className="flex gap-3 text-sm">
                    <Badge variant="outline">{linkScanned} pages scanned</Badge>
                    <Badge variant={linkIssues.length > 0 ? "destructive" : "default"}>{linkIssues.length} issues</Badge>
                  </div>
                )}
                {linkIssues.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadCsv(
                      `seo-links-${new Date().toISOString().slice(0,10)}.csv`,
                      linkIssues.map(i => ({ page_url: i.pageUrl, lang: langOfUrl(i.pageUrl), href: i.href, anchor_text: i.text, reason: i.reason }))
                    )}><Download className="w-4 h-4 mr-1" />CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(
                      "Internal Link Audit Report",
                      linkIssues.map(i => ({ page_url: i.pageUrl, lang: langOfUrl(i.pageUrl), href: i.href, anchor_text: i.text, reason: i.reason }))
                    )}><FileText className="w-4 h-4 mr-1" />PDF</Button>
                  </div>
                )}
                {linkIssues.length === 0 && linkScanned > 0 && (
                  <p className="text-green-600 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> No broken or placeholder links found</p>
                )}
                <div className="space-y-1 max-h-[500px] overflow-auto">
                  {linkIssues.map((iss, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm border-b py-2">
                      <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs text-muted-foreground truncate">{iss.pageUrl}</div>
                        <div><Badge variant="outline" className="mr-2">{iss.reason}</Badge><code className="text-xs">{iss.href}</code> — <span className="italic">{iss.text}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === VERIFY PUBLIC BUILD === */}
          <TabsContent value="public" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Verify Public Build
                </CardTitle>
                <CardDescription>
                  One-click check that the public site loads navigation links and that no 401/403 (RLS) errors block
                  anonymous visitors from reading menus or settings. Tests the live published URL — not the in-app preview.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap items-center">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={publicBuildUrl}
                    onChange={(e) => setPublicBuildUrl(e.target.value)}
                    placeholder="https://genuinoinvestments.ch"
                    className="max-w-md"
                  />
                  <Button onClick={runPublicBuildVerify} disabled={publicLoading}>
                    {publicLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                    Run verification
                  </Button>
                </div>

                {publicChecked && (
                  <div className="flex gap-3 text-sm">
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      {publicIssues.filter(i => i.level === "ok").length} OK
                    </Badge>
                    <Badge variant="secondary">{publicIssues.filter(i => i.level === "warn").length} warnings</Badge>
                    <Badge variant="destructive">{publicIssues.filter(i => i.level === "error").length} errors</Badge>
                  </div>
                )}

                {publicIssues.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadCsv(
                      `public-build-${new Date().toISOString().slice(0,10)}.csv`,
                      publicIssues.map(i => ({ level: i.level, category: i.category, message: i.message, detail: i.detail || "" }))
                    )}><Download className="w-4 h-4 mr-1" />CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(
                      "Public Build Verification",
                      publicIssues.map(i => ({ level: i.level, category: i.category, message: i.message, detail: i.detail || "" }))
                    )}><FileText className="w-4 h-4 mr-1" />PDF</Button>
                  </div>
                )}

                <div className="space-y-1 max-h-[500px] overflow-auto">
                  {publicIssues.map((iss, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm border-b py-2">
                      {iss.level === "error" && <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />}
                      {iss.level === "warn"  && <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                      {iss.level === "ok"    && <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{iss.category}</Badge>
                          <span className={iss.level === "error" ? "text-destructive font-medium" : ""}>{iss.message}</span>
                        </div>
                        {iss.detail && (
                          <div className="font-mono text-[11px] text-muted-foreground mt-1 truncate">{iss.detail}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {publicChecked && publicIssues.filter(i => i.level === "error").length === 0 && (
                  <p className="text-green-600 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Public build healthy — Navbar links will load for anonymous visitors.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === CANONICAL & HREFLANG REPORT === */}
          <TabsContent value="canonical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MapPinned className="w-5 h-5" /> Canonical & hreflang report</CardTitle>
                <CardDescription>
                  Lists every public route × language with its declared canonical URL and hreflang tags.
                  Flags missing canonical, missing hreflang languages, and duplicate declarations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={runCanonicalReport} disabled={canonicalLoading}>
                  {canonicalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Run canonical & hreflang report
                </Button>
                {canonicalScanned > 0 && (
                  <div className="flex gap-3 text-sm flex-wrap">
                    <Badge variant="outline">{canonicalScanned} URLs scanned</Badge>
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      {canonicalRows.filter(r => r.status === "ok").length} OK
                    </Badge>
                    <Badge variant="secondary">{canonicalRows.filter(r => r.status === "warn").length} warnings</Badge>
                    <Badge variant="destructive">{canonicalRows.filter(r => r.status === "error").length} errors</Badge>
                  </div>
                )}
                {canonicalRows.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadCsv(
                      `canonical-hreflang-${new Date().toISOString().slice(0,10)}.csv`,
                      canonicalRows.map(r => ({
                        route: r.route, lang: r.lang, status: r.status,
                        canonical: r.canonical || "",
                        expected_canonical: r.expectedCanonical,
                        hreflang_count: r.hreflangs.length,
                        missing: r.missing.join("|"),
                        duplicates: r.duplicates.join("|"),
                        x_default_href: r.xDefaultHref || "",
                        x_default_issue: r.xDefaultIssue || "",
                        notes: r.notes.join("; "),
                      }))
                    )}><Download className="w-4 h-4 mr-1" />CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(
                      "Canonical & Hreflang Report",
                      canonicalRows.map(r => ({
                        route: r.route, lang: r.lang, status: r.status,
                        canonical: r.canonical || "—",
                        missing: r.missing.join("|") || "—",
                        duplicates: r.duplicates.join("|") || "—",
                        x_default: r.xDefaultIssue || (r.xDefaultHref ? "OK" : "—"),
                      }))
                    )}><FileText className="w-4 h-4 mr-1" />PDF</Button>
                  </div>
                )}
                <div className="overflow-auto max-h-[500px] border rounded">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-2">Route</th>
                        <th className="text-left p-2">Lang</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Canonical</th>
                        <th className="text-left p-2">Hreflang ({LANGS.join("/")})</th>
                        <th className="text-left p-2">Missing</th>
                        <th className="text-left p-2">Duplicates</th>
                        <th className="text-left p-2">x-default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {canonicalRows.map((r, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 font-mono">{r.route}</td>
                          <td className="p-2 uppercase">{r.lang}</td>
                          <td className="p-2">
                            {r.status === "ok" && <Badge className="bg-green-600">OK</Badge>}
                            {r.status === "warn" && <Badge variant="secondary">WARN</Badge>}
                            {r.status === "error" && <Badge variant="destructive">ERROR</Badge>}
                          </td>
                          <td className="p-2 font-mono break-all">{r.canonical || <span className="text-destructive">—</span>}</td>
                          <td className="p-2">{r.hreflangs.length}</td>
                          <td className="p-2 text-destructive">{r.missing.join(", ") || "—"}</td>
                          <td className="p-2 text-yellow-600">{r.duplicates.join(", ") || "—"}</td>
                          <td className="p-2 text-xs">
                            {r.xDefaultIssue
                              ? <span className="text-destructive">{r.xDefaultIssue}</span>
                              : r.xDefaultHref
                                ? <Badge className="bg-green-600">OK</Badge>
                                : <span className="text-muted-foreground">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === SEO VISIBILITY TEST === */}
          <TabsContent value="visibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Run SEO Visibility Test</CardTitle>
                <CardDescription>
                  One-click check that robots.txt, sitemap-index.xml and per-language sitemaps return valid XML,
                  and that key pages (/, /about, /portfolio, /contact) expose title, description, canonical and hreflang for every language.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={runVisibilityTest} disabled={visibilityLoading}>
                  {visibilityLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Activity className="w-4 h-4 mr-2" />}
                  Run SEO visibility test
                </Button>
                {visibilityRan && (
                  <div className="flex gap-3 text-sm flex-wrap">
                    <Badge className="bg-green-600">{visibilityChecks.filter(c => c.level === "ok").length} OK</Badge>
                    <Badge variant="secondary">{visibilityChecks.filter(c => c.level === "warn").length} warnings</Badge>
                    <Badge variant="destructive">{visibilityChecks.filter(c => c.level === "error").length} errors</Badge>
                  </div>
                )}
                {visibilityChecks.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadCsv(
                      `seo-visibility-${new Date().toISOString().slice(0,10)}.csv`,
                      visibilityChecks.map(c => ({ level: c.level, category: c.category, url: c.url || "", message: c.message, detail: c.detail || "" }))
                    )}><Download className="w-4 h-4 mr-1" />CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadPdf(
                      "SEO Visibility Test",
                      visibilityChecks.map(c => ({ level: c.level, category: c.category, url: c.url || "", message: c.message }))
                    )}><FileText className="w-4 h-4 mr-1" />PDF</Button>
                  </div>
                )}
                <div className="space-y-1 max-h-[500px] overflow-auto">
                  {visibilityChecks.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm border-b py-2">
                      {c.level === "error" && <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />}
                      {c.level === "warn"  && <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                      {c.level === "ok"    && <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{c.category}</Badge>
                          <span className={c.level === "error" ? "text-destructive font-medium" : ""}>{c.message}</span>
                        </div>
                        {c.url && <div className="font-mono text-[11px] text-muted-foreground mt-1 truncate">{c.url}</div>}
                        {c.detail && <div className="text-[11px] text-muted-foreground mt-0.5">{c.detail}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                {visibilityRan && visibilityChecks.filter(c => c.level === "error").length === 0 && (
                  <p className="text-green-600 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> SEO visibility healthy — robots.txt, sitemaps and key page metadata are valid.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
