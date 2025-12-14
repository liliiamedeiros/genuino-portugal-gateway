-- Add quality configuration fields to conversion_schedules
ALTER TABLE public.conversion_schedules 
ADD COLUMN IF NOT EXISTS quality INTEGER DEFAULT 85,
ADD COLUMN IF NOT EXISTS target_width INTEGER DEFAULT 1200,
ADD COLUMN IF NOT EXISTS target_height INTEGER DEFAULT 900,
ADD COLUMN IF NOT EXISTS apply_watermark BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS watermark_position TEXT DEFAULT 'bottom-right';