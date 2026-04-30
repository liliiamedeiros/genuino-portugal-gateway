import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, Loader2, CheckCircle2, AlertTriangle, XCircle, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RouteCheck {
  url: string;
  lang: string;
  status: number;
  ok: boolean;
  title?: string;
  canonical?: string;
  hreflangs: { lang: string; href: string }[];
  hasXDefault: boolean;
  indexable: boolean;
  errors: string[];
  warnings: string[];
}

interface Summary {
  origin: string;
  depth: string;
  total_routes: number;
  total_checks: number;
  errors: number;
  warnings: number;
  indexable: number;
  robots: { ok: boolean; status: number; blocksAll: boolean };
  sitemap: { ok: boolean; status: number };
  hreflang_coverage: { lang: string; total: number; present: number; pct: number }[];
  timestamp: string;
}

export default function SeoGooglebotAudit() {
  const [origin, setOrigin] = useState(typeof window !== "undefined" ? window.location.origin : "");
  const [depth, setDepth] = useState<"shallow" | "full">("full");
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [checks, setChecks] = useState<RouteCheck[]>([]);
  const [filter, setFilter] = useState<"all" | "errors" | "warnings">("errors");
  const { toast } = useToast();

  const run = async () => {
    setRunning(true);
    setSummary(null);
    setChecks([]);
    try {
      const { data, error } = await supabase.functions.invoke("seo-googlebot-audit", {
        body: { origin, depth },
      });
      if (error) throw error;
      setSummary(data.summary);
      setChecks(data.checks);
      toast({
        title: "Auditoria Googlebot completa",
        description: `${data.summary.total_checks} verificações · ${data.summary.errors} erros · ${data.summary.warnings} avisos`,
      });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const filtered = checks.filter((c) =>
    filter === "all" ? true : filter === "errors" ? c.errors.length > 0 : c.warnings.length > 0,
  );

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Bot className="w-7 h-7" /> Auditoria Googlebot (4 idiomas)
          </h1>
          <p className="text-muted-foreground">
            Simula o Googlebot a varrer todas as rotas (estáticas + cada Imóvel + cada item de Portfolio) em PT, EN, FR, DE.
            Verifica indexabilidade, hreflang completo, x-default, canonical, robots, sitemap e conteúdo traduzido.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuração</CardTitle>
            <CardDescription>O resultado é guardado automaticamente em SEO snapshots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Label className="text-xs">Origin</Label>
                <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Profundidade</Label>
                <Select value={depth} onValueChange={(v: any) => setDepth(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shallow">Rápida (só rotas principais)</SelectItem>
                    <SelectItem value="full">Completa (+ properties + portfolio)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={run} disabled={running}>
              {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Bot className="w-4 h-4 mr-1" />}
              Correr auditoria
            </Button>
          </CardContent>
        </Card>

        {summary && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Sumário</CardTitle>
                <CardDescription>{new Date(summary.timestamp).toLocaleString()} · profundidade: {summary.depth}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Rotas" value={summary.total_routes} />
                  <Stat label="Total checks (×4 lang)" value={summary.total_checks} />
                  <Stat label="Erros" value={summary.errors} variant={summary.errors > 0 ? "destructive" : "ok"} />
                  <Stat label="Avisos" value={summary.warnings} variant={summary.warnings > 0 ? "warn" : "ok"} />
                  <Stat label="Indexáveis" value={`${summary.indexable}/${summary.total_checks}`} />
                  <Stat label="robots.txt" value={summary.robots.ok ? "OK" : `HTTP ${summary.robots.status}`} variant={summary.robots.ok && !summary.robots.blocksAll ? "ok" : "destructive"} />
                  <Stat label="sitemap.xml" value={summary.sitemap.ok ? "OK" : `HTTP ${summary.sitemap.status}`} variant={summary.sitemap.ok ? "ok" : "destructive"} />
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-semibold mb-2">Cobertura hreflang por idioma</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {summary.hreflang_coverage.map((h) => (
                      <div key={h.lang} className="border rounded p-2 text-center">
                        <div className="text-xs uppercase text-muted-foreground">{h.lang}</div>
                        <div className={`text-2xl font-bold ${h.pct === 100 ? "text-green-600" : h.pct >= 80 ? "text-amber-600" : "text-destructive"}`}>{h.pct}%</div>
                        <div className="text-[10px] text-muted-foreground">{h.present}/{h.total} rotas</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhe por rota × idioma</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Filter className="w-3 h-3" />
                    <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="errors">Só erros ({checks.filter(c => c.errors.length > 0).length})</SelectItem>
                        <SelectItem value="warnings">Só avisos ({checks.filter(c => c.warnings.length > 0).length})</SelectItem>
                        <SelectItem value="all">Todos ({checks.length})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Lang</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hreflangs</TableHead>
                      <TableHead>x-default</TableHead>
                      <TableHead>Index</TableHead>
                      <TableHead>Erros / Avisos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.slice(0, 200).map((c) => (
                      <TableRow key={c.url}>
                        <TableCell className="font-mono text-xs max-w-xs truncate" title={c.url}>{c.url}</TableCell>
                        <TableCell><Badge variant="outline">{c.lang}</Badge></TableCell>
                        <TableCell>
                          {c.status >= 200 && c.status < 400 ? (
                            <Badge className="bg-green-600">{c.status}</Badge>
                          ) : (
                            <Badge variant="destructive">{c.status || "ERR"}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">{c.hreflangs.length}</TableCell>
                        <TableCell>{c.hasXDefault ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-destructive" />}</TableCell>
                        <TableCell>{c.indexable ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-destructive" />}</TableCell>
                        <TableCell className="text-xs space-y-1">
                          {c.errors.map((e, i) => (
                            <div key={`e${i}`} className="text-destructive flex items-start gap-1"><XCircle className="w-3 h-3 mt-0.5" /> {e}</div>
                          ))}
                          {c.warnings.map((w, i) => (
                            <div key={`w${i}`} className="text-amber-600 flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5" /> {w}</div>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filtered.length > 200 && (
                  <p className="text-xs text-muted-foreground mt-2">A mostrar primeiras 200 de {filtered.length} linhas. Snapshot completo guardado na BD.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function Stat({ label, value, variant = "default" }: { label: string; value: any; variant?: "default" | "ok" | "warn" | "destructive" }) {
  const color =
    variant === "ok" ? "text-green-600" :
    variant === "warn" ? "text-amber-600" :
    variant === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <div className="border rounded p-3">
      <div className="text-[10px] uppercase text-muted-foreground tracking-wide">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}