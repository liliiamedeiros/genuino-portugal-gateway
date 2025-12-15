-- Create conversion templates table
CREATE TABLE public.conversion_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  quality INTEGER NOT NULL DEFAULT 85,
  target_width INTEGER NOT NULL DEFAULT 1200,
  target_height INTEGER NOT NULL DEFAULT 900,
  apply_watermark BOOLEAN DEFAULT false,
  watermark_position TEXT DEFAULT 'bottom-right',
  use_case TEXT,
  is_default BOOLEAN DEFAULT false,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversion_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage templates"
ON public.conversion_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can view templates"
ON public.conversion_templates
FOR SELECT
USING (true);

-- Insert default templates
INSERT INTO public.conversion_templates (name, description, quality, target_width, target_height, apply_watermark, use_case, is_default, icon) VALUES
  ('Thumbnail', 'Ideal para listagens e cards de imóveis', 60, 400, 300, false, 'thumbnail', true, '🖼️'),
  ('Galeria Standard', 'Qualidade equilibrada para galerias de fotos', 75, 1200, 900, true, 'gallery', true, '🎨'),
  ('Hero Image', 'Alta qualidade para banners e destaques', 90, 1920, 1080, true, 'hero', true, '🌟'),
  ('Mobile Optimizado', 'Otimizado para visualização mobile', 70, 800, 600, false, 'mobile', true, '📱');

-- Trigger for updated_at
CREATE TRIGGER update_conversion_templates_updated_at
BEFORE UPDATE ON public.conversion_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();