-- Add json_ld column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS json_ld jsonb;

COMMENT ON COLUMN public.projects.json_ld IS 'Generated JSON-LD structured data for SEO';

-- Create json_ld_templates table for managing templates
CREATE TABLE IF NOT EXISTS public.json_ld_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  template_type text NOT NULL,
  template jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.json_ld_templates ENABLE ROW LEVEL SECURITY;

-- Policies for json_ld_templates
CREATE POLICY "Admins and editors can manage JSON-LD templates"
ON public.json_ld_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Anyone can view active templates"
ON public.json_ld_templates
FOR SELECT
USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_json_ld_templates_updated_at
BEFORE UPDATE ON public.json_ld_templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();