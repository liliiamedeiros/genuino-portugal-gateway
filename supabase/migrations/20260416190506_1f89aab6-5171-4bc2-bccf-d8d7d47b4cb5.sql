-- Replace the broad "ALL" policy on newsletter_subscribers (which lets editors SELECT all PII)
-- with specific INSERT/UPDATE/DELETE policies. SELECT remains admin-only via existing policy.

DROP POLICY IF EXISTS "All authenticated users can manage subscribers" ON public.newsletter_subscribers;

CREATE POLICY "Staff can update subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  USING (
    has_role(auth.uid(), 'editor'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'editor'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE POLICY "Admins can delete subscribers"
  ON public.newsletter_subscribers FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Note: existing "Anyone can subscribe" INSERT policy (with email validation) remains in place,
-- and existing "Admins can view subscribers" SELECT policy keeps PII restricted to admins only.