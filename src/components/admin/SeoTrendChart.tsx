import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, RefreshCw, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";

interface TrendRow {
  day: string;
  sitemap_url_count: number;
  errors_count: number;
  warnings_count: number;
}

const chartConfig = {
  sitemap_url_count: { label: "Sitemap URLs", color: "hsl(var(--primary))" },
  errors_count: { label: "Errors", color: "hsl(var(--destructive))" },
  warnings_count: { label: "Warnings", color: "hsl(45 93% 47%)" },
};

export function SeoTrendChart() {
  const [rows, setRows] = useState<TrendRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [dedupLoading, setDedupLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc("seo_trend_last_14_days");
      if (error) throw error;
      setRows(
        (data || []).map((r: any) => ({
          day: typeof r.day === "string" ? r.day.slice(5) : r.day,
          sitemap_url_count: Number(r.sitemap_url_count) || 0,
          errors_count: Number(r.errors_count) || 0,
          warnings_count: Number(r.warnings_count) || 0,
        })),
      );
    } catch (e: any) {
      toast({ title: "Failed to load trend", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const runDedup = async () => {
    setDedupLoading(true);
    try {
      const { data, error } = await (supabase as any).rpc("dedupe_seo_snapshots_daily");
      if (error) throw error;
      toast({ title: "Snapshots de-duplicated", description: `${data || 0} duplicate rows removed.` });
      await load();
    } catch (e: any) {
      toast({ title: "Dedup failed", description: e.message, variant: "destructive" });
    } finally {
      setDedupLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalRuns = rows.reduce((s, r) => s + (r.sitemap_url_count > 0 ? 1 : 0), 0);
  const totalErrors = rows.reduce((s, r) => s + r.errors_count, 0);
  const totalWarn = rows.reduce((s, r) => s + r.warnings_count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> 14-day SEO trend
        </CardTitle>
        <CardDescription>
          Sitemap URL count and visibility test errors/warnings over the last 14 daily runs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Refresh
          </Button>
          <Button size="sm" variant="outline" onClick={runDedup} disabled={dedupLoading}>
            {dedupLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Database className="w-4 h-4 mr-1" />}
            De-duplicate snapshots
          </Button>
          <div className="ml-auto flex gap-2">
            <Badge variant="outline">{totalRuns} days with data</Badge>
            <Badge variant="destructive">{totalErrors} errors total</Badge>
            <Badge className="bg-yellow-600">{totalWarn} warns total</Badge>
          </div>
        </div>
        <div className="border rounded p-2">
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="sitemap_url_count" stroke="var(--color-sitemap_url_count)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="errors_count" stroke="var(--color-errors_count)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="warnings_count" stroke="var(--color-warnings_count)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Identical sitemap baselines from the same day are skipped automatically; re-running dedup also collapses
          older days to a single row per (type, route, language, environment).
        </p>
      </CardContent>
    </Card>
  );
}
