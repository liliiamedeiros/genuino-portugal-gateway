-- Tabela para persistir runs de auditoria responsiva
CREATE TABLE IF NOT EXISTS public.responsive_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  label text,
  environment text,
  source text NOT NULL DEFAULT 'manual', -- 'manual' | 'recent_pages'
  filters jsonb NOT NULL DEFAULT '{}'::jsonb, -- { since: ISO, until: ISO, source_tables: [] }
  routes jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of { path, label, source }
  breakpoints jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{ name, width, height }]
  summary jsonb NOT NULL DEFAULT '{}'::jsonb, -- counts: ok, warn, fail, total
  status text NOT NULL DEFAULT 'running', -- running | completed | failed
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.responsive_audit_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.responsive_audit_runs(id) ON DELETE CASCADE,
  route text NOT NULL,
  language text,
  breakpoint_name text NOT NULL,
  viewport_width integer NOT NULL,
  viewport_height integer NOT NULL,
  status text NOT NULL DEFAULT 'ok', -- ok | warn | fail
  notes text,
  screenshot_kind text, -- png | svg
  screenshot_bytes integer,
  screenshot_base64 text, -- compact storage; can be large but JSONless
  head jsonb DEFAULT '{}'::jsonb,
  fallback_reason text,
  fallback_detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_responsive_audit_results_run ON public.responsive_audit_results(run_id);
CREATE INDEX IF NOT EXISTS idx_responsive_audit_runs_created ON public.responsive_audit_runs(created_at DESC);

ALTER TABLE public.responsive_audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responsive_audit_results ENABLE ROW LEVEL SECURITY;

-- RLS: admin/super_admin/editor podem ver e gerir
CREATE POLICY "Admins editors view audit runs"
  ON public.responsive_audit_runs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors insert audit runs"
  ON public.responsive_audit_runs FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors update audit runs"
  ON public.responsive_audit_runs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete audit runs"
  ON public.responsive_audit_runs FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins editors view audit results"
  ON public.responsive_audit_results FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins editors insert audit results"
  ON public.responsive_audit_results FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins delete audit results"
  ON public.responsive_audit_results FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Função para listar páginas publicadas recentemente (properties + portfolio)
CREATE OR REPLACE FUNCTION public.recent_published_pages(p_since timestamptz, p_until timestamptz DEFAULT now())
RETURNS TABLE(path text, label text, source text, last_updated timestamptz)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
    OR has_role(auth.uid(), 'editor'::app_role)
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT '/properties/' || p.id AS path,
         COALESCE(p.title_pt, p.id) AS label,
         'projects'::text AS source,
         GREATEST(p.created_at, COALESCE(p.updated_at, p.created_at)) AS last_updated
  FROM public.projects p
  WHERE p.status = 'active'
    AND COALESCE(p.updated_at, p.created_at) BETWEEN p_since AND p_until
  UNION ALL
  SELECT '/portfolio/' || pr.id::text AS path,
         COALESCE(pr.title_pt, pr.id::text) AS label,
         'portfolio_projects'::text AS source,
         GREATEST(pr.created_at, COALESCE(pr.updated_at, pr.created_at)) AS last_updated
  FROM public.portfolio_projects pr
  WHERE pr.status = 'active'
    AND COALESCE(pr.updated_at, pr.created_at) BETWEEN p_since AND p_until
  ORDER BY last_updated DESC;
END;
$$;