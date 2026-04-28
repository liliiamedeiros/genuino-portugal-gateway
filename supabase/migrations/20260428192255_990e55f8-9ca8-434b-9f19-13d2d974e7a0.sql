-- Extensions for scheduling the daily SEO check
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Shared SEO snapshots: canonical reports, sitemap diffs, visibility tests, route screenshots
CREATE TABLE public.seo_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 'canonical_report' | 'sitemap_baseline' | 'visibility_test' | 'route_screenshot'
  snapshot_type TEXT NOT NULL,
  label TEXT,
  environment TEXT,
  route TEXT,
  language TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_snapshots_type_created ON public.seo_snapshots (snapshot_type, created_at DESC);
CREATE INDEX idx_seo_snapshots_route_lang ON public.seo_snapshots (route, language);

ALTER TABLE public.seo_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins editors can view snapshots"
  ON public.seo_snapshots FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'editor'::app_role)
  );

CREATE POLICY "Admins can insert snapshots"
  ON public.seo_snapshots FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'editor'::app_role)
  );

CREATE POLICY "Admins can delete snapshots"
  ON public.seo_snapshots FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );