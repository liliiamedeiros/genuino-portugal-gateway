-- Tabela para agendamentos de conversão
CREATE TABLE public.conversion_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_time TIME NOT NULL DEFAULT '03:00:00',
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  is_active BOOLEAN DEFAULT true,
  max_images_per_run INTEGER DEFAULT 50,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.conversion_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmins can manage schedules" ON public.conversion_schedules
  FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can view schedules" ON public.conversion_schedules
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_conversion_schedules_updated_at
  BEFORE UPDATE ON public.conversion_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();