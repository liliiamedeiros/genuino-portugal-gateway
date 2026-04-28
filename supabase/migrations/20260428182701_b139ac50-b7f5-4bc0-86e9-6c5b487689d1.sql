DROP POLICY IF EXISTS "Admins can manage menu items" ON public.navigation_menus;

CREATE POLICY "Admins can manage menu items"
ON public.navigation_menus
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename='system_settings' AND schemaname='public'
  LOOP
    IF pol.policyname ILIKE '%admin%' OR pol.policyname ILIKE '%manage%' THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.system_settings', pol.policyname);
    END IF;
  END LOOP;
END $$;

CREATE POLICY "Admins can manage system settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));