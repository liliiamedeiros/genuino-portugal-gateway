
-- Restringir execução: apenas admins/editores podem chamar
REVOKE ALL ON FUNCTION public.dedupe_seo_snapshots_daily() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.seo_trend_last_14_days() FROM PUBLIC, anon, authenticated;

-- Recriar com check de role no início
CREATE OR REPLACE FUNCTION public.dedupe_seo_snapshots_daily()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

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

CREATE OR REPLACE FUNCTION public.seo_trend_last_14_days()
RETURNS TABLE (
  day date,
  sitemap_url_count integer,
  errors_count integer,
  warnings_count integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
    OR public.has_role(auth.uid(), 'editor'::app_role)
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH days AS (
    SELECT generate_series(
      ((now() AT TIME ZONE 'UTC')::date - INTERVAL '13 days')::date,
      (now() AT TIME ZONE 'UTC')::date,
      INTERVAL '1 day'
    )::date AS day
  ),
  last_sitemap_per_day AS (
    SELECT DISTINCT ON ((created_at AT TIME ZONE 'UTC')::date)
      (created_at AT TIME ZONE 'UTC')::date AS d,
      payload
    FROM public.seo_snapshots
    WHERE snapshot_type = 'sitemap_baseline'
      AND created_at >= (now() - INTERVAL '14 days')
    ORDER BY (created_at AT TIME ZONE 'UTC')::date, created_at DESC
  ),
  last_visibility_per_day AS (
    SELECT DISTINCT ON ((created_at AT TIME ZONE 'UTC')::date)
      (created_at AT TIME ZONE 'UTC')::date AS d,
      payload
    FROM public.seo_snapshots
    WHERE snapshot_type = 'visibility_test'
      AND created_at >= (now() - INTERVAL '14 days')
    ORDER BY (created_at AT TIME ZONE 'UTC')::date, created_at DESC
  )
  SELECT
    dd.day,
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
  FROM days dd
  LEFT JOIN last_sitemap_per_day s ON s.d = dd.day
  LEFT JOIN last_visibility_per_day v ON v.d = dd.day
  ORDER BY dd.day ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.dedupe_seo_snapshots_daily() TO authenticated;
GRANT EXECUTE ON FUNCTION public.seo_trend_last_14_days() TO authenticated;
