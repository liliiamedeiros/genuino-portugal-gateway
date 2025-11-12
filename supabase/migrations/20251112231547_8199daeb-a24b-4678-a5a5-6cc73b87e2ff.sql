-- Remover policies antigas
DROP POLICY IF EXISTS "Admins and editors can insert images" ON public.project_images;
DROP POLICY IF EXISTS "Admins and editors can delete images" ON public.project_images;

-- Criar nova policy de INSERT incluindo super_admin
CREATE POLICY "Admins, editors and super_admins can insert images" 
ON public.project_images 
FOR INSERT 
TO public 
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Criar nova policy de DELETE incluindo super_admin
CREATE POLICY "Admins, editors and super_admins can delete images" 
ON public.project_images 
FOR DELETE 
TO public 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);