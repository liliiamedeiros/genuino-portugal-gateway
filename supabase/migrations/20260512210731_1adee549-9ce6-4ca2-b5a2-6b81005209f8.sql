-- 1. Restrict conversion_templates SELECT to staff only
DROP POLICY IF EXISTS "Anyone can view templates" ON public.conversion_templates;
CREATE POLICY "Staff can view templates"
ON public.conversion_templates
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'editor'::app_role)
);

-- 2. Allow admins/super_admins to delete contact_messages (PII purge)
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- 3. Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated.
-- Keep has_role usable by authenticated (used in RLS); revoke the rest from public roles.
REVOKE EXECUTE ON FUNCTION public.skip_duplicate_sitemap_baseline() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_sensitive_data_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.dedupe_seo_snapshots_daily() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.seo_trend_last_14_days() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.recent_published_pages(timestamp with time zone, timestamp with time zone) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_data_access(text, text, text, integer, jsonb) FROM PUBLIC, anon;
