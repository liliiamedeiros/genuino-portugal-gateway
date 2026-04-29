import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera, ExternalLink, Loader2, CheckCircle2, AlertTriangle, BookOpen, Copy, Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Helper card explaining how to add the BROWSERLESS_TOKEN secret so the
 * `seo-route-screenshot` edge function can capture real PNG screenshots
 * instead of the SVG fallback.
 */
export function BrowserlessConfigCard() {
  const [testing, setTesting] = useState(false);
  const [hasToken, setHasToken] = useState<"yes" | "no" | "unknown">("unknown");
  const [lastResult, setLastResult] = useState<{ kind: string; bytes: number; note?: string } | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const testCapture = async () => {
    setTesting(true);
    setLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("seo-route-screenshot", {
        body: { url: `${window.location.origin}/` },
      });
      if (error) throw error;
      const kind = data?.kind || "unknown";
      const bytes = data?.bytes || 0;
      setLastResult({ kind, bytes, note: data?.note });
      setHasToken(kind === "png" ? "yes" : "no");
      toast({
        title: kind === "png" ? "Browserless OK ✅" : "Using SVG fallback",
        description:
          kind === "png"
            ? `Captured ${bytes} bytes via Browserless.`
            : data?.note ??
              "BROWSERLESS_TOKEN not detected — set it as a secret to enable real PNG screenshots.",
      });
    } catch (e: any) {
      toast({ title: "Test failed", description: e.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const copySecretName = async () => {
    await navigator.clipboard.writeText("BROWSERLESS_TOKEN");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
        <p className="text-xs text-muted-foreground">
          Click <b>Setup guide</b> below for a step-by-step walkthrough — no need to search where to create the token.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <BookOpen className="w-4 h-4 mr-1" /> Setup guide
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" /> Browserless setup — 4 steps
                </DialogTitle>
                <DialogDescription>
                  Follow these steps to enable real PNG screenshots in the SEO Tools snapshots and the Responsive Audit.
                </DialogDescription>
              </DialogHeader>
              <ol className="list-decimal ml-5 space-y-4 text-sm">
                <li>
                  <b>Create a free Browserless account.</b>
                  <p className="text-muted-foreground text-xs mt-1">
                    Free plan: ~1,000 sessions / month — more than enough for SEO snapshots and weekly responsive audits.
                  </p>
                  <Button size="sm" variant="secondary" className="mt-2" asChild>
                    <a href="https://account.browserless.io/signup" target="_blank" rel="noreferrer">
                      Open signup page <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </li>
                <li>
                  <b>Copy your API token.</b>
                  <p className="text-muted-foreground text-xs mt-1">
                    After login, open <b>Account → API Keys</b> (top-right) and copy the long token shown there.
                  </p>
                  <Button size="sm" variant="secondary" className="mt-2" asChild>
                    <a href="https://account.browserless.io/account/api-keys" target="_blank" rel="noreferrer">
                      Open API Keys page <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </li>
                <li>
                  <b>Add it as a backend secret.</b>
                  <p className="text-muted-foreground text-xs mt-1">
                    In this project, open <b>Backend → Secrets</b> and create a new secret named EXACTLY:
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1">BROWSERLESS_TOKEN</code>
                    <Button size="sm" variant="outline" onClick={copySecretName}>
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs mt-2">
                    Paste the token from step 2 as the value, then save. It becomes available to all edge functions immediately.
                  </p>
                </li>
                <li>
                  <b>Test it here.</b>
                  <p className="text-muted-foreground text-xs mt-1">
                    Close this dialog and click <b>Test screenshot capture</b>. You should see a green
                    “Browserless active” badge — if not, the failure reason is included in the toast and edge function logs.
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={async () => {
                      setGuideOpen(false);
                      await testCapture();
                    }}
                  >
                    <Camera className="w-4 h-4 mr-1" /> Run test now
                  </Button>
                </li>
              </ol>
            </DialogContent>
          </Dialog>
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
        {lastResult?.note && (
          <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
            {lastResult.note}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
