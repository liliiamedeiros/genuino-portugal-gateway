-- Create storage_metrics table for historical analytics
CREATE TABLE public.storage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_images INTEGER NOT NULL DEFAULT 0,
  webp_images INTEGER NOT NULL DEFAULT 0,
  other_images INTEGER NOT NULL DEFAULT 0,
  total_storage_bytes BIGINT DEFAULT 0,
  webp_storage_bytes BIGINT DEFAULT 0,
  other_storage_bytes BIGINT DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  savings_bytes BIGINT DEFAULT 0,
  average_savings_percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.storage_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view metrics"
ON public.storage_metrics FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "SuperAdmins can manage metrics"
ON public.storage_metrics FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add notification columns to conversion_schedules
ALTER TABLE public.conversion_schedules 
ADD COLUMN IF NOT EXISTS notify_on_completion BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_on_error BOOLEAN DEFAULT true;