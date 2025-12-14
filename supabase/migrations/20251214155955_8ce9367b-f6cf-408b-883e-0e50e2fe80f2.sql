-- Tabela para rastreamento de conversões de imagens
CREATE TABLE IF NOT EXISTS public.image_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  source_id TEXT NOT NULL,
  original_url TEXT NOT NULL,
  converted_url TEXT,
  backup_url TEXT,
  original_format TEXT NOT NULL,
  original_size INTEGER,
  converted_size INTEGER,
  savings_percentage NUMERIC,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_conversions ENABLE ROW LEVEL SECURITY;

-- SuperAdmins can manage all conversions
CREATE POLICY "SuperAdmins can manage conversions" ON public.image_conversions
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can view conversions
CREATE POLICY "Admins can view conversions" ON public.image_conversions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Índices para pesquisa rápida
CREATE INDEX idx_conversions_status ON public.image_conversions(status);
CREATE INDEX idx_conversions_source ON public.image_conversions(source_table, source_id);