-- Add UPDATE policy for project images storage bucket
CREATE POLICY "Admins and editors can update project images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-images' AND
    (public.has_role(auth.uid(), 'admin'::app_role) OR 
     public.has_role(auth.uid(), 'editor'::app_role) OR 
     public.has_role(auth.uid(), 'super_admin'::app_role))
  );