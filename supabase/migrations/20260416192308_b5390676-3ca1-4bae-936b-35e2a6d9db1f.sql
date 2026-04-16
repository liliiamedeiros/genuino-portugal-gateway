-- 1. Remove insecure self-unsubscribe (vulnerable to mass abuse)
DROP POLICY IF EXISTS "Public can self-unsubscribe" ON public.newsletter_subscribers;

-- 2. Restrict seo_history INSERT to admins/editors
DROP POLICY IF EXISTS "Authenticated can insert seo_history" ON public.seo_history;

CREATE POLICY "Staff can insert seo_history"
ON public.seo_history
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'editor'::app_role)
);

-- 3. Restrict activity_logs INSERT to admins/editors only
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;

CREATE POLICY "Staff can insert activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR public.has_role(auth.uid(), 'editor'::app_role)
);