import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Bot, Link2, FileJson } from "lucide-react";
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bot"><Bot className="w-4 h-4 mr-2" />Bot View / URLs</TabsTrigger>
            <TabsTrigger value="schema"><FileJson className="w-4 h-4 mr-2" />JSON-LD Validator</TabsTrigger>
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
