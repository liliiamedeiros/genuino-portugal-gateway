import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AuditEvent {
  id: string;
  event_type: string;
  route: string | null;
  breakpoint_name: string | null;
  status: string | null;
  message: string | null;
  details: any;
  created_at: string;
}

interface Run {
  id: string;
  label: string | null;
  environment: string | null;
  source: string;
  status: string;
  summary: any;
  created_at: string;
  completed_at: string | null;
}

interface Result {
  id: string;
  route: string;
  breakpoint_name: string;
  viewport_width: number;
  viewport_height: number;
  status: string;
  screenshot_kind: string | null;
  screenshot_base64: string | null;
  notes: string | null;
}

export default function ResponsiveAuditHistory() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Run | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("responsive_audit_runs")
      .select("id,label,environment,source,status,summary,created_at,completed_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    setRuns((data as Run[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openRun = async (run: Run) => {
    setSelected(run);
    setLoadingResults(true);
    const { data } = await supabase
      .from("responsive_audit_results")
      .select("id,route,breakpoint_name,viewport_width,viewport_height,status,screenshot_kind,screenshot_base64,notes")
      .eq("run_id", run.id)
      .order("route", { ascending: true });
    setResults((data as Result[]) || []);
    // Load weekly audit events (only present for scheduled_weekly runs)
    const { data: ev } = await (supabase as any)
      .from("weekly_audit_events")
      .select("id,event_type,route,breakpoint_name,status,message,details,created_at")
      .eq("run_id", run.id)
      .order("created_at", { ascending: true })
      .limit(500);
    setEvents((ev as AuditEvent[]) || []);
    setLoadingResults(false);
  };

  const deleteRun = async (id: string) => {
    if (!confirm("Apagar esta run e todos os screenshots?")) return;
    const { error } = await supabase.from("responsive_audit_runs").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Run apagada" });
    if (selected?.id === id) { setSelected(null); setResults([]); }
    load();
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <History className="w-7 h-7" /> Histórico de Auditorias Responsivas
            </h1>
            <p className="text-muted-foreground">Compara runs anteriores entre browsers e ambientes.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/responsive-audit"><ArrowLeft className="w-4 h-4 mr-1" /> Voltar</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Últimas 50 runs</CardTitle>
            <CardDescription>Clica numa run para ver os screenshots por breakpoint.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma run guardada ainda.</p>
            ) : (
              <div className="space-y-2">
                {runs.map((r) => {
                  const s = r.summary || {};
                  return (
                    <div key={r.id} className={`flex items-center justify-between border rounded p-3 hover:bg-muted/50 cursor-pointer ${selected?.id === r.id ? "bg-muted" : ""}`} onClick={() => openRun(r)}>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{r.label || "(sem etiqueta)"}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleString()} · {r.source} · {r.environment}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.png != null && <Badge className="bg-green-600">PNG {s.png}</Badge>}
                        {s.svg != null && <Badge variant="secondary">SVG {s.svg}</Badge>}
                        {s.errors > 0 && <Badge variant="destructive">err {s.errors}</Badge>}
                        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteRun(r.id); }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {selected && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados — {selected.label}</CardTitle>
              <CardDescription>{results.length} capturas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingResults ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {results.map((r) => (
                    <div key={r.id} className="border rounded overflow-hidden">
                      <div className="px-2 py-1 bg-muted text-xs flex items-center justify-between">
                        <span className="font-mono truncate">{r.breakpoint_name} · {r.route}</span>
                        <Badge variant={r.status === "ok" ? "default" : r.status === "warn" ? "secondary" : "destructive"} className="h-5">
                          {r.status}
                        </Badge>
                      </div>
                      <div className="aspect-video bg-background flex items-center justify-center">
                        {r.screenshot_base64 ? (
                          <img
                            src={`data:${r.screenshot_kind === "png" ? "image/png" : "image/svg+xml"};base64,${r.screenshot_base64}`}
                            alt={`${r.route} ${r.breakpoint_name}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground p-2">{r.notes || "sem screenshot"}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selected && events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Eventos detalhados ({events.length})</CardTitle>
              <CardDescription>Progresso por rota e breakpoint, alertas e falhas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto border rounded">
                <table className="w-full text-xs">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2">Hora</th>
                      <th className="text-left p-2">Evento</th>
                      <th className="text-left p-2">Rota</th>
                      <th className="text-left p-2">Breakpoint</th>
                      <th className="text-left p-2">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr key={e.id} className="border-t">
                        <td className="p-2 font-mono whitespace-nowrap">{new Date(e.created_at).toLocaleTimeString()}</td>
                        <td className="p-2">
                          <Badge variant={e.event_type.includes("error") ? "destructive" : e.event_type === "alert_sent" ? "secondary" : "outline"} className="text-[10px]">
                            {e.event_type}
                          </Badge>
                        </td>
                        <td className="p-2 font-mono truncate max-w-[160px]">{e.route || "—"}</td>
                        <td className="p-2">{e.breakpoint_name || "—"}</td>
                        <td className="p-2 font-mono text-[10px] truncate max-w-[260px]">{e.message || (e.details && JSON.stringify(e.details))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}