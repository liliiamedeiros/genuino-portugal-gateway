DROP POLICY IF EXISTS "Restrict role grants by privilege" ON public.user_roles;
DROP POLICY IF EXISTS "Restrict role updates by privilege" ON public.user_roles;
DROP POLICY IF EXISTS "Restrict role deletions by privilege" ON public.user_roles;

CREATE POLICY "Restrict role grants by privilege"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND role = 'editor'::app_role
  )
);

CREATE POLICY "Restrict role updates by privilege"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND role = 'editor'::app_role
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND role = 'editor'::app_role
  )
);

CREATE POLICY "Restrict role deletions by privilege"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    public.has_role(auth.uid(), 'admin'::app_role)
    AND role = 'editor'::app_role
  )
);