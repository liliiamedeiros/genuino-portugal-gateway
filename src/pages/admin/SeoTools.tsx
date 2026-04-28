import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Bot, Link2, FileJson, Languages, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SEO Tools</h1>
          <p className="text-muted-foreground">Bot view, sitemap/robots/hreflang tester, JSON-LD validator, link audit.</p>
        </div>

        <Tabs defaultValue="bot">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bot"><Bot className="w-4 h-4 mr-2" />Bot View / URLs</TabsTrigger>
            <TabsTrigger value="schema"><FileJson className="w-4 h-4 mr-2" />JSON-LD Validator</TabsTrigger>
            <TabsTrigger value="hreflang"><Languages className="w-4 h-4 mr-2" />Hreflang Reciprocity</TabsTrigger>
            <TabsTrigger value="links"><Link2 className="w-4 h-4 mr-2" />Internal Links</TabsTrigger>
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">robots.txt</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button size="sm" onClick={loadRobots}>Test /robots.txt</Button>
                  {robotsContent && <pre className="bg-muted p-2 rounded text-xs max-h-60 overflow-auto">{robotsContent}</pre>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">sitemap.xml</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => loadSitemap(false)}>Static /sitemap.xml</Button>
                    <Button size="sm" variant="outline" onClick={() => loadSitemap(true)}>Edge (dynamic)</Button>
                  </div>
                  {sitemapContent && <pre className="bg-muted p-2 rounded text-xs max-h-60 overflow-auto">{sitemapContent}</pre>}
                </CardContent>
              </Card>
            </div>
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
        </Tabs>
      </div>
    </AdminLayout>
  );
}
