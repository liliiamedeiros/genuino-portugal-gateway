
DO $$
DECLARE tbl record;
BEGIN
  FOR tbl IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.relname);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.relname);
  END LOOP;
END $$;

-- Public-readable tables (have permissive SELECT policy or status='active' for anon viewers)
GRANT SELECT ON public.portfolio_projects TO anon;
GRANT SELECT ON public.projects TO anon;
GRANT SELECT ON public.portfolio_images TO anon;
GRANT SELECT ON public.project_images TO anon;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT ON public.system_settings TO anon;
GRANT SELECT ON public.navigation_menus TO anon;
GRANT SELECT ON public.page_sections TO anon;
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT ON public.statistics TO anon;
GRANT SELECT ON public.seo_config TO anon;
GRANT SELECT ON public.seo_rules TO anon;
GRANT SELECT ON public.geo_entities TO anon;
GRANT SELECT ON public.geo_faqs TO anon;
GRANT SELECT ON public.geo_semantic_strategies TO anon;
GRANT SELECT ON public.json_ld_templates TO anon;
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.newsletter_subscribers TO anon;
