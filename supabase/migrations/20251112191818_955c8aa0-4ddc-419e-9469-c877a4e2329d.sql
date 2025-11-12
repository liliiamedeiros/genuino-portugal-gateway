-- Create system_settings table for application configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can manage settings
CREATE POLICY "Admins can view system settings"
  ON public.system_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert system settings"
  ON public.system_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update system settings"
  ON public.system_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete system settings"
  ON public.system_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default settings
INSERT INTO public.system_settings (key, value, category, description) VALUES
  ('company_name', '"Imovelis Portugal"'::jsonb, 'general', 'Nome da empresa'),
  ('contact_email', '"contato@imovelis.pt"'::jsonb, 'general', 'Email de contato'),
  ('contact_phone', '"+351 XXX XXX XXX"'::jsonb, 'general', 'Telefone de contato'),
  ('timezone', '"Europe/Lisbon"'::jsonb, 'system', 'Fuso horário do sistema'),
  ('default_language', '"pt"'::jsonb, 'system', 'Idioma padrão'),
  ('currency', '"EUR"'::jsonb, 'system', 'Moeda padrão'),
  ('date_format', '"dd/MM/yyyy"'::jsonb, 'system', 'Formato de data'),
  ('notify_new_clients', 'true'::jsonb, 'notifications', 'Notificar novos clientes'),
  ('notify_new_appointments', 'true'::jsonb, 'notifications', 'Notificar novos agendamentos'),
  ('notify_status_changes', 'true'::jsonb, 'notifications', 'Notificar mudanças de status')
ON CONFLICT (key) DO NOTHING;