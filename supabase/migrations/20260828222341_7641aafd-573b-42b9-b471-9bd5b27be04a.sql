-- Tighten write policies on image metadata tables to authenticated staff only
DROP POLICY IF EXISTS "Admins, editors and super_admins can insert images" ON public.project_images;
CREATE POLICY "Staff can insert project images" ON public.project_images
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins, editors and super_admins can delete images" ON public.project_images;
CREATE POLICY "Staff can delete project images" ON public.project_images
FOR DELETE TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins and editors can update project images" ON public.project_images;
CREATE POLICY "Staff can update project images" ON public.project_images
FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins and editors can insert portfolio images" ON public.portfolio_images;
CREATE POLICY "Staff can insert portfolio images" ON public.portfolio_images
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins and editors can delete portfolio images" ON public.portfolio_images;
CREATE POLICY "Staff can delete portfolio images" ON public.portfolio_images
FOR DELETE TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins and editors can update portfolio images" ON public.portfolio_images;
CREATE POLICY "Staff can update portfolio images" ON public.portfolio_images
FOR UPDATE TO authenticated
USING (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role));

-- Keep public read for listings, but only for anon/authenticated roles
DROP POLICY IF EXISTS "Anyone can view project images" ON public.project_images;
CREATE POLICY "Anyone can view project images" ON public.project_images
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view portfolio images" ON public.portfolio_images;
CREATE POLICY "Anyone can view portfolio images" ON public.portfolio_images
FOR SELECT TO anon, authenticated USING (true);

-- Storage: replace tautological condition with a plain bucket match
DROP POLICY IF EXISTS "Public can read project image files" ON storage.objects;
CREATE POLICY "Public can read project image files" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Admins and editors can update project images" ON storage.objects;
CREATE POLICY "Staff can update project image files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'project-images' AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role)))
WITH CHECK (bucket_id = 'project-images' AND (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'editor'::app_role) OR has_role(auth.uid(),'super_admin'::app_role)));