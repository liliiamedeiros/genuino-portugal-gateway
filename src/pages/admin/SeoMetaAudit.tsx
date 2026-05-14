import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROUTE_META, LANGS, BASE_URL, type Lang } from '@/data/seoMeta';
import { ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';

const BRAND_SUFFIX = 'Genuíno Investments';
const TITLE_MAX = 60;
const DESC_MIN = 50;
const DESC_MAX = 160;

const LOCALE_MAP: Record<Lang, string> = {
  pt: 'pt_PT',
  en: 'en_US',
  fr: 'fr_FR',
  de: 'de_CH',
};

interface RouteRow {
  route: string;
  lang: Lang;
  title: string;
  fullTitle: string;
  description: string;
  url: string;
  ogLocale: string;
  issues: string[];
}

function buildRows(): RouteRow[] {
  const rows: RouteRow[] = [];
  for (const route of Object.keys(ROUTE_META)) {
    const meta = ROUTE_META[route];
    for (const lang of LANGS) {
      const title = meta.title[lang] || meta.title.pt;
      const description = meta.description[lang] || meta.description.pt;
      const fullTitle = `${title} | ${BRAND_SUFFIX}`;
      const url = `${BASE_URL}${route}?lang=${lang}`;
      const issues: string[] = [];
      if (!title) issues.push('og:title vazio');
      if (fullTitle.length > TITLE_MAX) issues.push(`title >${TITLE_MAX}c (${fullTitle.length})`);
      if (!description) issues.push('og:description vazio');
      else if (description.length < DESC_MIN) issues.push(`desc <${DESC_MIN}c`);
      else if (description.length > DESC_MAX) issues.push(`desc >${DESC_MAX}c (${description.length})`);
      if (!url.startsWith('https://')) issues.push('og:url não absoluto');
      rows.push({
        route,
        lang,
        title,
        fullTitle,
        description,
        url,
        ogLocale: LOCALE_MAP[lang],
        issues,
      });
    }
  }
  return rows;
}

function checkSitemapsAndRobots() {
  // Static-known set; mirrored from public/robots.txt + sitemap-index.xml
  const expected = [
    `${BASE_URL}/sitemap-index.xml`,
    `${BASE_URL}/sitemap.xml`,
    `${BASE_URL}/sitemap-pt.xml`,
    `${BASE_URL}/sitemap-en.xml`,
    `${BASE_URL}/sitemap-fr.xml`,
    `${BASE_URL}/sitemap-de.xml`,
  ];
  return expected.map((u) => ({ url: u, host: new URL(u).host }));
}

export default function SeoMetaAudit() {
  const [filter, setFilter] = useState('');
  const rows = useMemo(buildRows, []);
  const sitemaps = useMemo(checkSitemapsAndRobots, []);

  const filtered = rows.filter((r) =>
    !filter ||
    r.route.toLowerCase().includes(filter.toLowerCase()) ||
    r.lang.includes(filter.toLowerCase())
  );

  const totalIssues = rows.reduce((acc, r) => acc + r.issues.length, 0);
  const expectedHost = new URL(BASE_URL).host;
  const allHostsOk = sitemaps.every((s) => s.host === expectedHost);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl">
        <div>
          <h1 className="text-3xl font-bold">Auditoria de Meta Tags</h1>
          <p className="text-muted-foreground mt-1">
            Validação por rota × idioma de og/twitter/canonical e estado de sitemap & robots.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Rotas auditadas</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{Object.keys(ROUTE_META).length} × {LANGS.length} idiomas</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Avisos detectados</CardTitle></CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${totalIssues ? 'text-destructive' : 'text-primary'}`}>{totalIssues}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Sitemap / Robots</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2">
              {allHostsOk ? (
                <><CheckCircle2 className="h-5 w-5 text-primary" /><span>Todos no host {expectedHost}</span></>
              ) : (
                <><AlertTriangle className="h-5 w-5 text-destructive" /><span>Hosts inconsistentes</span></>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sitemaps & robots.txt</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Abrir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs">{BASE_URL}/robots.txt</TableCell>
                  <TableCell>{expectedHost}</TableCell>
                  <TableCell><Badge variant="default">OK</Badge></TableCell>
                  <TableCell>
                    <a href={`${BASE_URL}/robots.txt`} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1">
                      Abrir <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                </TableRow>
                {sitemaps.map((s) => (
                  <TableRow key={s.url}>
                    <TableCell className="font-mono text-xs">{s.url}</TableCell>
                    <TableCell>{s.host}</TableCell>
                    <TableCell>
                      {s.host === expectedHost
                        ? <Badge variant="default">OK</Badge>
                        : <Badge variant="destructive">Host errado</Badge>}
                    </TableCell>
                    <TableCell>
                      <a href={s.url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1">
                        Abrir <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Meta tags por rota × idioma</CardTitle>
            <Input
              placeholder="Filtrar por rota ou idioma..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-xs"
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rota</TableHead>
                  <TableHead>Idioma</TableHead>
                  <TableHead>og:title</TableHead>
                  <TableHead>og:description</TableHead>
                  <TableHead>og:url</TableHead>
                  <TableHead>og:locale</TableHead>
                  <TableHead>Avisos</TableHead>
                  <TableHead>Debug</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={`${r.route}-${r.lang}`}>
                    <TableCell className="font-mono text-xs">{r.route}</TableCell>
                    <TableCell><Badge variant="outline">{r.lang}</Badge></TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-xs truncate" title={r.fullTitle}>{r.fullTitle}</div>
                      <div className="text-[10px] text-muted-foreground">{r.fullTitle.length} chars</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-xs line-clamp-2" title={r.description}>{r.description}</div>
                      <div className="text-[10px] text-muted-foreground">{r.description.length} chars</div>
                    </TableCell>
                    <TableCell>
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-primary inline-flex items-center gap-1">
                        link <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell><span className="text-xs">{r.ogLocale}</span></TableCell>
                    <TableCell>
                      {r.issues.length === 0
                        ? <Badge variant="default">OK</Badge>
                        : <div className="flex flex-wrap gap-1">{r.issues.map(i => <Badge key={i} variant="destructive" className="text-[10px]">{i}</Badge>)}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button asChild size="sm" variant="outline" className="h-7 text-[10px] justify-start">
                          <a href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(r.url)}`} target="_blank" rel="noreferrer">Facebook</a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="h-7 text-[10px] justify-start">
                          <a href={`https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(r.url)}`} target="_blank" rel="noreferrer">LinkedIn</a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="h-7 text-[10px] justify-start">
                          <a href={`https://cards-dev.twitter.com/validator?url=${encodeURIComponent(r.url)}`} target="_blank" rel="noreferrer">X / Twitter</a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notas</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Valores derivados de <code className="text-xs">src/data/seoMeta.ts</code> + <code className="text-xs">SEOHead.tsx</code>.</p>
            <p>• Limites usados: title ≤ {TITLE_MAX} chars · description {DESC_MIN}–{DESC_MAX} chars.</p>
            <p>• Rotas dinâmicas (<code className="text-xs">/project/:id</code>, <code className="text-xs">/portfolio/:id</code>) usam título derivado do registo e ficam fora desta auditoria estática.</p>
            <p>• Crawlers sociais não executam JS — para previews per-route precisariam de SSR/pré-render.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}