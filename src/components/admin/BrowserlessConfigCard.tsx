import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, ExternalLink, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Helper card explaining how to add the BROWSERLESS_TOKEN secret so the
 * `seo-route-screenshot` edge function can capture real PNG screenshots
 * instead of the SVG fallback.
 */
export function BrowserlessConfigCard() {
  const [testing, setTesting] = useState(false);
  const [hasToken, setHasToken] = useState<"yes" | "no" | "unknown">("unknown");
  const [lastResult, setLastResult] = useState<{ kind: string; bytes: number } | null>(null);
  const { toast } = useToast();

  const testCapture = async () => {
    setTesting(true);
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("seo-route-screenshot", {
        body: { route: "/", language: "pt" },
      });
      if (error) throw error;
      const kind = data?.kind || "unknown";
      const bytes = data?.bytes || 0;
      setLastResult({ kind, bytes });
      setHasToken(kind === "png" ? "yes" : "no");
      toast({
        title: kind === "png" ? "Browserless OK ✅" : "Using SVG fallback",
        description:
          kind === "png"
            ? `Captured ${bytes} bytes via Browserless.`
            : "BROWSERLESS_TOKEN not detected — set it as a secret to enable real PNG screenshots.",
      });
    } catch (e: any) {
      toast({ title: "Test failed", description: e.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" /> Real PNG route screenshots (Browserless)
        </CardTitle>
        <CardDescription>
          By default, route screenshots are rendered as a lightweight SVG of the detected{" "}
          <code>&lt;head&gt;</code> tags. Add a <code>BROWSERLESS_TOKEN</code> secret to capture real PNG snapshots
          of each rendered page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ol className="list-decimal ml-5 space-y-1 text-xs text-muted-foreground">
          <li>
            Create a free account at{" "}
            <a href="https://www.browserless.io/" target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-1">
              browserless.io <ExternalLink className="w-3 h-3" />
            </a>{" "}
            (the free plan covers ~1,000 sessions/month — enough for SEO snapshots).
          </li>
          <li>Open the dashboard → <b>API Keys</b> and copy the token.</li>
          <li>
            Open <b>Backend → Secrets</b> in this project and add a new secret named exactly{" "}
            <code className="bg-muted px-1 rounded">BROWSERLESS_TOKEN</code>.
          </li>
          <li>Click the test button below to verify.</li>
        </ol>
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <Button size="sm" onClick={testCapture} disabled={testing}>
            {testing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Camera className="w-4 h-4 mr-1" />}
            Test screenshot capture
          </Button>
          {hasToken === "yes" && (
            <Badge className="bg-green-600">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Browserless active
            </Badge>
          )}
          {hasToken === "no" && (
            <Badge variant="secondary">
              <AlertTriangle className="w-3 h-3 mr-1" /> SVG fallback in use
            </Badge>
          )}
          {lastResult && (
            <span className="text-xs text-muted-foreground">
              Last test: <b>{lastResult.kind.toUpperCase()}</b> · {lastResult.bytes.toLocaleString()} bytes
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
