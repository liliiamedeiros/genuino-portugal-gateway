-- Add UPDATE policy for portfolio_images (currently missing)
CREATE POLICY "Admins and editors can update portfolio images"
ON public.portfolio_images
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add UPDATE policy for project_images (currently missing)
CREATE POLICY "Admins and editors can update project images"
ON public.project_images
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Insert default conversion schedule
INSERT INTO public.conversion_schedules (
  schedule_time,
  days_of_week,
  is_active,
  max_images_per_run,
  quality,
  target_width,
  target_height,
  apply_watermark,
  watermark_position,
  notify_on_completion,
  notify_on_error
) VALUES (
  '03:00:00',
  ARRAY[0,1,2,3,4,5,6],
  true,
  50,
  85,
  1200,
  900,
  false,
  'bottom-right',
  true,
  true
) ON CONFLICT DO NOTHING;