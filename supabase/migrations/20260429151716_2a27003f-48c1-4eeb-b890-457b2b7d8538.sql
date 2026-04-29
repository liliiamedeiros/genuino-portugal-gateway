
-- Deduplicação diária de snapshots de sitemap_baseline + função de trend para gráfico de 14 dias

-- 1) Função: mantém apenas o snapshot mais recente por dia, por (snapshot_type, route, language, environment).
--    Aplica-se a TODOS os snapshot_types — assim qualquer execução automática que repita o baseline
--    no mesmo dia não infla a tabela.
CREATE OR REPLACE FUNCTION public.dedupe_seo_snapshots_daily()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY
          snapshot_type,
          COALESCE(route, ''),
          COALESCE(language, ''),
          COALESCE(environment, ''),
          (created_at AT TIME ZONE 'UTC')::date
        ORDER BY created_at DESC
      ) AS rn
    FROM public.seo_snapshots
  ),
  to_delete AS (
    SELECT id FROM ranked WHERE rn > 1
  )
  DELETE FROM public.seo_snapshots s
  USING to_delete d
  WHERE s.id = d.id;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- 2) Trigger BEFORE INSERT: para sitemap_baseline, se já existe um snapshot do mesmo dia
--    com payload IDÊNTICO (hash de payload), não insere de novo (evita crescer com runs idênticas).
CREATE OR REPLACE FUNCTION public.skip_duplicate_sitemap_baseline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
BEGIN
  IF NEW.snapshot_type <> 'sitemap_baseline' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.seo_snapshots s
    WHERE s.snapshot_type = 'sitemap_baseline'
      AND COALESCE(s.environment, '') = COALESCE(NEW.environment, '')
      AND (s.created_at AT TIME ZONE 'UTC')::date = (now() AT TIME ZONE 'UTC')::date
      AND md5(s.payload::text) = md5(NEW.payload::text)
  ) INTO v_exists;

  IF v_exists THEN
    -- Silenciosamente ignora a inserção duplicada
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_skip_duplicate_sitemap_baseline ON public.seo_snapshots;
CREATE TRIGGER trg_skip_duplicate_sitemap_baseline
BEFORE INSERT ON public.seo_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.skip_duplicate_sitemap_baseline();

-- 3) Função RPC para o gráfico de tendência: últimos 14 dias de runs visibility_test e sitemap_baseline.
--    Devolve por dia: total URLs no sitemap, contagem de erros e warnings da última visibility_test do dia.
CREATE OR REPLACE FUNCTION public.seo_trend_last_14_days()
RETURNS TABLE (
  day date,
  sitemap_url_count integer,
  errors_count integer,
  warnings_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH days AS (
    SELECT generate_series(
      ((now() AT TIME ZONE 'UTC')::date - INTERVAL '13 days')::date,
      (now() AT TIME ZONE 'UTC')::date,
      INTERVAL '1 day'
    )::date AS day
  ),
  last_sitemap_per_day AS (
    SELECT DISTINCT ON ((created_at AT TIME ZONE 'UTC')::date)
      (created_at AT TIME ZONE 'UTC')::date AS day,
      payload
    FROM public.seo_snapshots
    WHERE snapshot_type = 'sitemap_baseline'
      AND created_at >= (now() - INTERVAL '14 days')
    ORDER BY (created_at AT TIME ZONE 'UTC')::date, created_at DESC
  ),
  last_visibility_per_day AS (
    SELECT DISTINCT ON ((created_at AT TIME ZONE 'UTC')::date)
      (created_at AT TIME ZONE 'UTC')::date AS day,
      payload
    FROM public.seo_snapshots
    WHERE snapshot_type = 'visibility_test'
      AND created_at >= (now() - INTERVAL '14 days')
    ORDER BY (created_at AT TIME ZONE 'UTC')::date, created_at DESC
  )
  SELECT
    d.day,
    COALESCE(
      (SELECT SUM((value->>'count')::int)::int
       FROM jsonb_each(COALESCE(s.payload->'counts', '{}'::jsonb)) AS kv(key, value)),
      jsonb_array_length(COALESCE(s.payload->'urls', '[]'::jsonb)),
      0
    )::integer AS sitemap_url_count,
    COALESCE((v.payload->>'errors')::int,
             (SELECT count(*)::int FROM jsonb_array_elements(COALESCE(v.payload->'checks','[]'::jsonb)) c WHERE c->>'level'='error'),
             0)::integer AS errors_count,
    COALESCE((v.payload->>'warnings')::int,
             (SELECT count(*)::int FROM jsonb_array_elements(COALESCE(v.payload->'checks','[]'::jsonb)) c WHERE c->>'level'='warn'),
             0)::integer AS warnings_count
  FROM days d
  LEFT JOIN last_sitemap_per_day s ON s.day = d.day
  LEFT JOIN last_visibility_per_day v ON v.day = d.day
  ORDER BY d.day ASC;
$$;

GRANT EXECUTE ON FUNCTION public.dedupe_seo_snapshots_daily() TO authenticated;
GRANT EXECUTE ON FUNCTION public.seo_trend_last_14_days() TO authenticated;
