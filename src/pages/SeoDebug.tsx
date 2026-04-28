import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { ROUTE_META, BASE_URL, LANGS } from "@/data/seoMeta";

interface DetectedTag {
  rel: string;
  hreflang?: string;
  href: string;
}

/**
 * Public-facing SEO debug page.
 * Renders the canonical link and every hreflang declaration that React/Helmet
 * has injected into <head> for the current route+language. Useful in production
 * for quickly spotting wrong canonical hosts, missing locales or x-default mismatches.
 *
 * Mounted at /seo-debug. Safe for public access — only reads document.head.
 */
export default function SeoDebug() {
  const { language } = useLanguage();
  const { pathname, search } = useLocation();
  const [canonical, setCanonical] = useState<string | null>(null);
  const [hreflangs, setHreflangs] = useState<DetectedTag[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [refreshTick, setRefreshTick] = useState(0);

  // Re-read document.head on route change, language change and explicit refresh.
  useEffect(() => {
    // Wait one tick so react-helmet-async has flushed its updates to <head>.
    const t = setTimeout(() => {
      const can = document.querySelector('link[rel="canonical"]')?.getAttribute("href") || null;
      const tags: DetectedTag[] = Array.from(
        document.querySelectorAll('link[rel="alternate"][hreflang]')
      ).map((el) => ({
        rel: "alternate",
        hreflang: el.getAttribute("hreflang") || "",
        href: el.getAttribute("href") || "",
      }));
      setCanonical(can);
      setHreflangs(tags);
      setTitle(document.title || "");
      setDescription(document.querySelector('meta[name="description"]')?.getAttribute("content") || "");
    }, 50);
    return () => clearTimeout(t);
  }, [pathname, search, language, refreshTick]);

  // Validation
  const expectedRoute = pathname === "/seo-debug" ? "/" : pathname;
  const expectedCanonicalBase = `${BASE_URL}${expectedRoute}`;
  const declaredLangs = new Set(hreflangs.map((h) => (h.hreflang || "").toLowerCase()));
  const missingLangs = LANGS.filter((l) => !declaredLangs.has(l));
  const xDefault = hreflangs.find((h) => (h.hreflang || "").toLowerCase() === "x-default");
  const ptHref = hreflangs.find((h) => (h.hreflang || "").toLowerCase() === "pt")?.href;
  const xDefaultMismatch =
    xDefault && ptHref &&
    // x-default should normally point to the fallback language (PT for this site)
    xDefault.href !== ptHref &&
    !xDefault.href.endsWith(expectedRoute) &&
    !xDefault.href.endsWith(`${expectedRoute}?lang=pt`);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
        <title>Hreflang &amp; Canonical Debug | GenuinoInvestments Switzerland</title>
      </Helmet>
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Hreflang &amp; Canonical Debug</h1>
            <p className="text-muted-foreground text-sm">
              Live view of the SEO tags rendered into <code>&lt;head&gt;</code> for the current page and language.
              This page is set to <code>noindex</code>.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current context</CardTitle>
              <CardDescription>What this page is reading from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><b>Route:</b> <code>{pathname}{search}</code></div>
              <div><b>Active language:</b> <Badge variant="outline" className="uppercase">{language}</Badge></div>
              <div><b>Document title:</b> {title || <span className="text-destructive">missing</span>}</div>
              <div><b>Meta description:</b> {description || <span className="text-destructive">missing</span>}</div>
              <button
                onClick={() => setRefreshTick((t) => t + 1)}
                className="text-primary underline text-xs"
              >
                Re-read &lt;head&gt;
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Canonical URL
                {canonical
                  ? canonical.startsWith(BASE_URL)
                    ? <Badge className="bg-green-600">OK</Badge>
                    : <Badge variant="destructive">Wrong host</Badge>
                  : <Badge variant="destructive">Missing</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><b>Expected base:</b> <code className="break-all">{expectedCanonicalBase}</code></div>
              <div><b>Detected:</b> {canonical ? (
                <a href={canonical} target="_blank" rel="noreferrer" className="text-primary underline break-all inline-flex items-center gap-1">
                  {canonical} <ExternalLink className="w-3 h-3" />
                </a>
              ) : <span className="text-destructive">No canonical link found</span>}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Hreflang declarations ({hreflangs.length})
                {missingLangs.length === 0 && !xDefaultMismatch
                  ? <Badge className="bg-green-600">Complete</Badge>
                  : <Badge variant="destructive">Issues</Badge>}
              </CardTitle>
              <CardDescription>
                Site fallback language is <code>pt</code> — <code>x-default</code> should resolve to the PT version.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {missingLangs.length > 0 && (
                <div className="flex items-start gap-2 text-destructive">
                  <XCircle className="w-4 h-4 mt-0.5" />
                  <div>Missing hreflang for: <b>{missingLangs.join(", ")}</b></div>
                </div>
              )}
              {!xDefault && (
                <div className="flex items-start gap-2 text-yellow-600">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <div>Missing <code>hreflang="x-default"</code></div>
                </div>
              )}
              {xDefaultMismatch && (
                <div className="flex items-start gap-2 text-destructive">
                  <XCircle className="w-4 h-4 mt-0.5" />
                  <div>
                    <b>x-default mismatch:</b> points to <code className="break-all">{xDefault?.href}</code> but the
                    PT fallback is <code className="break-all">{ptHref}</code>.
                  </div>
                </div>
              )}
              {missingLangs.length === 0 && xDefault && !xDefaultMismatch && (
                <div className="flex items-start gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" />
                  <div>All 4 languages declared and <code>x-default</code> resolves to the PT fallback.</div>
                </div>
              )}
              <table className="w-full text-xs border rounded">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2">hreflang</th>
                    <th className="text-left p-2">href</th>
                  </tr>
                </thead>
                <tbody>
                  {hreflangs.map((t, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2 uppercase font-mono">{t.hreflang}</td>
                      <td className="p-2 font-mono break-all">{t.href}</td>
                    </tr>
                  ))}
                  {hreflangs.length === 0 && (
                    <tr><td colSpan={2} className="p-3 text-center text-muted-foreground">No hreflang declarations found.</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expected metadata for this route</CardTitle>
              <CardDescription>From <code>src/data/seoMeta.ts</code></CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {ROUTE_META[expectedRoute] ? (
                <>
                  <div><b>Title ({language}):</b> {ROUTE_META[expectedRoute].title[language]}</div>
                  <div><b>Description ({language}):</b> {ROUTE_META[expectedRoute].description[language]}</div>
                  <div><b>H1 ({language}):</b> {ROUTE_META[expectedRoute].h1[language]}</div>
                </>
              ) : (
                <p className="text-muted-foreground">No central metadata defined for <code>{expectedRoute}</code>.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
