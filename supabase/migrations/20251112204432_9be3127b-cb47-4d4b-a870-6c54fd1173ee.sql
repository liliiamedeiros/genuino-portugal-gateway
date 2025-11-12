-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can insert images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can insert project images" ON storage.objects;

-- Create new INSERT policy including super_admin
CREATE POLICY "Admins and editors can insert project images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'editor'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  )
);

-- Drop existing DELETE policies
DROP POLICY IF EXISTS "Admins and editors can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and editors can delete project images" ON storage.objects;

-- Create new DELETE policy including super_admin
CREATE POLICY "Admins and editors can delete project images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images' AND
  (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'editor'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  )
);