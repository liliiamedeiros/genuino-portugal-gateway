-- Events table for granular weekly audit progress tracking
CREATE TABLE IF NOT EXISTS public.weekly_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL,
  event_type text NOT NULL, -- 'started','route_started','route_completed','breakpoint_ok','breakpoint_error','webp_check','alert_sent','completed','error'
  route text,
  breakpoint_name text,
  status text,
  message text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weekly_audit_events_run ON public.weekly_audit_events(run_id, created_at DESC);

ALTER TABLE public.weekly_audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins editors view weekly audit events"
ON public.weekly_audit_events FOR SELECT
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'editor'::app_role));

CREATE POLICY "Admins editors insert weekly audit events"
ON public.weekly_audit_events FOR INSERT
WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role) OR has_role(auth.uid(),'editor'::app_role));

CREATE POLICY "Admins delete weekly audit events"
ON public.weekly_audit_events FOR DELETE
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

-- Seed alert configuration defaults
INSERT INTO public.seo_config (key, value, category, description) VALUES
  ('webp_threshold', '{"min_pct": 80}'::jsonb, 'alerts', 'Minimum WebP coverage % to avoid alert'),
  ('alert_email', '{"to": "info@genuinoinvestments.ch", "enabled": true}'::jsonb, 'alerts', 'Email recipient for weekly audit alerts'),
  ('weekly_audit_limits', '{"max_routes": 50, "batch_size": 10}'::jsonb, 'alerts', 'Pagination/limits for the weekly audit run')
ON CONFLICT (key) DO NOTHING;