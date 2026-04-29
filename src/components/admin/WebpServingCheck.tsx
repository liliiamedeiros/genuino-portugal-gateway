import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Auto-verifies that converted images are actually being served as WebP and that
 * no obvious layout regression flag (zero-dimension load) is happening.
 *
 * Heuristic per image:
 *  - Pulls a HEAD request to inspect Content-Type.
 *  - Loads it client-side via <img> to detect natural width/height (zero == regression).
 *  - Flags rows where extension claims .webp but Content-Type is not image/webp,
 *    or where natural dimensions are 0.
 */

interface CheckRow {
  url: string;
  source: string;
  contentType?: string;
  isWebpExt: boolean;
  isWebpServed: boolean;
  width: number;
  height: number;
  status: "ok" | "warn" | "error";
  message: string;
}

async function probe(url: string): Promise<{ contentType?: string; width: number; height: number }> {
  let contentType: string | undefined;
  try {
    const r = await fetch(url, { method: "HEAD" });
    contentType = r.headers.get("content-type") || undefined;
  } catch {
    /* ignore — some CDNs block HEAD */
  }
  const dims = await new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
  return { contentType, ...dims };
}

export function WebpServingCheck() {
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState<CheckRow[]>([]);
  const { toast } = useToast();

  const run = async () => {
    setRunning(true);
    setRows([]);
    try {
      // Pull a sample (most-recent 30) of converted images + a sample of currently-stored images
      const [{ data: conv }, { data: projects }, { data: portfolios }] = await Promise.all([
        supabase
          .from("image_conversions")
          .select("converted_url, source_table")
          .eq("status", "converted")
          .not("converted_url", "is", null)
          .order("converted_at", { ascending: false })
          .limit(15),
        supabase.from("projects").select("id, main_image").not("main_image", "is", null).limit(10),
        supabase.from("portfolio_projects").select("id, main_image").not("main_image", "is", null).limit(10),
      ]);

      const targets: { url: string; source: string }[] = [];
      (conv || []).forEach((c) =>
        targets.push({ url: c.converted_url as string, source: `conversion:${c.source_table}` }),
      );
      (projects || []).forEach((p) =>
        p.main_image ? targets.push({ url: p.main_image, source: "projects.main_image" }) : null,
      );
      (portfolios || []).forEach((p) =>
        p.main_image ? targets.push({ url: p.main_image, source: "portfolio_projects.main_image" }) : null,
      );

      const out: CheckRow[] = [];
      for (const t of targets) {
        const isWebpExt = /\.webp(\?|$)/i.test(t.url);
        const { contentType, width, height } = await probe(t.url);
        const isWebpServed = (contentType || "").toLowerCase().includes("image/webp");
        let status: CheckRow["status"] = "ok";
        let message = "Served as WebP, dimensions OK.";
        if (width === 0 || height === 0) {
          status = "error";
          message = "Image failed to load (0×0) — likely a layout regression or broken URL.";
        } else if (isWebpExt && !isWebpServed && contentType) {
          status = "warn";
          message = `URL ends in .webp but Content-Type is "${contentType}" — CDN may be transcoding.`;
        } else if (!isWebpExt) {
          status = "warn";
          message = "Not a WebP URL — consider scheduling a conversion.";
        }
        out.push({
          url: t.url, source: t.source, contentType, isWebpExt, isWebpServed, width, height, status, message,
        });
        setRows([...out]);
      }
      const errs = out.filter((r) => r.status === "error").length;
      const warns = out.filter((r) => r.status === "warn").length;
      toast({
        title: "WebP serving check complete",
        description: `${out.length} images checked · ${errs} errors · ${warns} warnings.`,
      });
    } catch (e: any) {
      toast({ title: "Check failed", description: e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const errs = rows.filter((r) => r.status === "error").length;
  const warns = rows.filter((r) => r.status === "warn").length;
  const oks = rows.filter((r) => r.status === "ok").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> WebP serving verification
        </CardTitle>
        <CardDescription>
          Confirms that converted images are actually being served with <code>image/webp</code> and that none of them
          load with zero dimensions (a common signal of layout regression).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={run} disabled={running}>
            {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-1" />}
            Run verification
          </Button>
          {rows.length > 0 && (
            <>
              <Badge className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />{oks} OK</Badge>
              <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />{warns} warn</Badge>
              <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{errs} error</Badge>
            </>
          )}
        </div>
        {rows.length > 0 && (
          <div className="border rounded max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0">
                <tr className="text-left">
                  <th className="p-2">Source</th>
                  <th className="p-2">Content-Type</th>
                  <th className="p-2">Dimensions</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2"><code className="text-[10px]">{r.source}</code></td>
                    <td className="p-2"><code className="text-[10px]">{r.contentType || "—"}</code></td>
                    <td className="p-2">{r.width}×{r.height}</td>
                    <td className="p-2">
                      {r.status === "ok" && <Badge className="bg-green-600">OK</Badge>}
                      {r.status === "warn" && <Badge variant="secondary">warn</Badge>}
                      {r.status === "error" && <Badge variant="destructive">error</Badge>}
                    </td>
                    <td className="p-2 text-muted-foreground">{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}