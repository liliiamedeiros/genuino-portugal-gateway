import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Smartphone, Tablet, Monitor, Tv, Camera, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WebpServingCheck } from "@/components/admin/WebpServingCheck";

/**
 * Responsive audit + breakpoint screenshots.
 *
 * For each route × breakpoint, calls the `seo-route-screenshot` edge function with a
 * specific viewport. Shows the captured PNG (or SVG fallback) inline so admins can spot
 * layout regressions visually. Also bundles the WebP serving check to confirm images
 * are mobile-friendly.
 */

const BREAKPOINTS = [
  { id: "mobile", label: "Mobile", width: 375, height: 812, icon: Smartphone },
  { id: "tablet", label: "Tablet", width: 768, height: 1024, icon: Tablet },
  { id: "desktop", label: "Desktop", width: 1280, height: 800, icon: Monitor },
  { id: "tv", label: "TV / 4K", width: 1920, height: 1080, icon: Tv },
] as const;

const DEFAULT_ROUTES = ["/", "/about", "/services", "/portfolio", "/properties", "/contact"];

interface Capture {
  route: string;
  bp: typeof BREAKPOINTS[number];
  kind?: "png" | "svg";
  base64?: string;
  bytes?: number;
  note?: string;
  fallbackReason?: string;
  status: "pending" | "running" | "done" | "error";
  error?: string;
}

export default function ResponsiveAudit() {
  const [origin, setOrigin] = useState(typeof window !== "undefined" ? window.location.origin : "");
  const [routesText, setRoutesText] = useState(DEFAULT_ROUTES.join("\n"));
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const run = async () => {
    const routes = routesText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!routes.length) return;
    setRunning(true);
    const initial: Capture[] = routes.flatMap((route) =>
      BREAKPOINTS.map((bp) => ({ route, bp, status: "pending" as const })),
    );
    setCaptures(initial);

    let pngCount = 0;
    let svgCount = 0;
    let errors = 0;
    for (let i = 0; i < initial.length; i++) {
      const item = initial[i];
      setCaptures((prev) =>
        prev.map((c, idx) => (idx === i ? { ...c, status: "running" } : c)),
      );
      try {
        const { data, error } = await supabase.functions.invoke("seo-route-screenshot", {
          body: {
            url: `${origin}${item.route}`,
            viewport: { width: item.bp.width, height: item.bp.height },
          },
        });
        if (error) throw error;
        const kind = data?.kind as "png" | "svg" | undefined;
        if (kind === "png") pngCount++;
        else svgCount++;
        setCaptures((prev) =>
          prev.map((c, idx) =>
            idx === i
              ? {
                  ...c,
                  status: "done",
                  kind,
                  base64: data?.base64,
                  bytes: data?.bytes,
                  note: data?.note,
                  fallbackReason: data?.fallback_reason,
                }
              : c,
          ),
        );
      } catch (e: any) {
        errors++;
        setCaptures((prev) =>
          prev.map((c, idx) => (idx === i ? { ...c, status: "error", error: e.message } : c)),
        );
      }
    }
    setRunning(false);
    toast({
      title: "Responsive audit complete",
      description: `${pngCount} PNG · ${svgCount} SVG fallback · ${errors} errors`,
    });
  };

  const download = (cap: Capture) => {
    if (!cap.base64) return;
    const mime = cap.kind === "png" ? "image/png" : "image/svg+xml";
    const ext = cap.kind === "png" ? "png" : "svg";
    const a = document.createElement("a");
    a.href = `data:${mime};base64,${cap.base64}`;
    a.download = `audit_${cap.route.replace(/[^a-z0-9]/gi, "_") || "root"}_${cap.bp.id}.${ext}`;
    a.click();
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Camera className="w-7 h-7" /> Responsive Audit
          </h1>
          <p className="text-muted-foreground">
            Captura screenshots reais (PNG via Browserless, ou SVG fallback) por breakpoint para detectar
            problemas de layout em mobile, tablet, desktop e TV. Inclui também a verificação WebP.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuração</CardTitle>
            <CardDescription>Define o domínio e as rotas a auditar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Origin</Label>
              <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Rotas (uma por linha)</Label>
              <textarea
                value={routesText}
                onChange={(e) => setRoutesText(e.target.value)}
                rows={6}
                className="w-full mt-1 border rounded p-2 text-sm font-mono bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {BREAKPOINTS.map((bp) => (
                <Badge key={bp.id} variant="secondary">
                  <bp.icon className="w-3 h-3 mr-1" />
                  {bp.label} · {bp.width}×{bp.height}
                </Badge>
              ))}
            </div>
            <Button onClick={run} disabled={running}>
              {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Camera className="w-4 h-4 mr-1" />}
              Run audit
            </Button>
          </CardContent>
        </Card>

        {captures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados ({captures.filter((c) => c.status === "done").length}/{captures.length})</CardTitle>
              <CardDescription>
                {captures.filter((c) => c.kind === "svg").length > 0 && (
                  <span className="text-amber-600">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Algumas capturas usaram fallback SVG. Configura o BROWSERLESS_TOKEN para PNG real.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {captures.map((c, i) => (
                  <div key={i} className="border rounded overflow-hidden bg-muted/30">
                    <div className="flex items-center justify-between px-2 py-1 bg-muted text-xs">
                      <span className="flex items-center gap-1 font-mono">
                        <c.bp.icon className="w-3 h-3" />
                        {c.bp.label} · {c.route}
                      </span>
                      {c.status === "done" && c.kind === "png" && (
                        <Badge className="bg-green-600 h-5"><CheckCircle2 className="w-3 h-3" /></Badge>
                      )}
                      {c.status === "done" && c.kind === "svg" && (
                        <Badge variant="secondary" className="h-5">SVG</Badge>
                      )}
                      {c.status === "error" && <Badge variant="destructive" className="h-5">err</Badge>}
                      {c.status === "running" && <Loader2 className="w-3 h-3 animate-spin" />}
                    </div>
                    <div className="aspect-video bg-background flex items-center justify-center overflow-hidden">
                      {c.base64 ? (
                        <img
                          src={`data:${c.kind === "png" ? "image/png" : "image/svg+xml"};base64,${c.base64}`}
                          alt={`${c.route} ${c.bp.label}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground p-4 text-center">
                          {c.error || (c.status === "pending" ? "Pending…" : "Capturing…")}
                        </span>
                      )}
                    </div>
                    {c.base64 && (
                      <div className="flex items-center justify-between p-1 text-[10px] text-muted-foreground">
                        <span>{c.bytes?.toLocaleString()} bytes</span>
                        <Button size="sm" variant="ghost" className="h-6" onClick={() => download(c)}>
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <WebpServingCheck />
      </div>
    </AdminLayout>
  );
}