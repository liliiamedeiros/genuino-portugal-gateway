-- 1. Criar tabela de logs de auditoria para acessos a dados sensíveis
CREATE TABLE public.audit_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL, -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
  table_name text NOT NULL,
  record_id text,
  record_count integer DEFAULT 1,
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Índices para performance
CREATE INDEX idx_audit_access_logs_user_id ON public.audit_access_logs(user_id);
CREATE INDEX idx_audit_access_logs_table_name ON public.audit_access_logs(table_name);
CREATE INDEX idx_audit_access_logs_created_at ON public.audit_access_logs(created_at DESC);
CREATE INDEX idx_audit_access_logs_action ON public.audit_access_logs(action);

-- 3. Habilitar RLS
ALTER TABLE public.audit_access_logs ENABLE ROW LEVEL SECURITY;

-- 4. Apenas super_admins podem ver logs de auditoria
CREATE POLICY "Super admins can view audit logs" ON public.audit_access_logs
FOR SELECT USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 5. Sistema pode inserir logs (qualquer utilizador autenticado pode gerar logs)
CREATE POLICY "System can insert audit logs" ON public.audit_access_logs
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Função para registar acesso a dados
CREATE OR REPLACE FUNCTION public.log_data_access(
  p_action text,
  p_table_name text,
  p_record_id text DEFAULT NULL,
  p_record_count integer DEFAULT 1,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_access_logs (
    user_id,
    action,
    table_name,
    record_id,
    record_count,
    details
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_record_count,
    p_details
  );
END;
$$;

-- 7. Trigger function para auditar operações de escrita
CREATE OR REPLACE FUNCTION public.audit_sensitive_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record_id text;
  v_details jsonb;
BEGIN
  -- Determinar o ID do registo
  IF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id::text;
  ELSE
    v_record_id := NEW.id::text;
  END IF;

  -- Construir detalhes baseado na operação
  IF TG_OP = 'INSERT' THEN
    v_details := jsonb_build_object('operation', 'create');
  ELSIF TG_OP = 'UPDATE' THEN
    v_details := jsonb_build_object('operation', 'update');
  ELSIF TG_OP = 'DELETE' THEN
    v_details := jsonb_build_object('operation', 'delete');
  END IF;

  -- Inserir log de auditoria
  INSERT INTO public.audit_access_logs (
    user_id,
    action,
    table_name,
    record_id,
    details
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    v_details
  );

  -- Retornar o registo apropriado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 8. Triggers para tabela profiles
CREATE TRIGGER audit_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_data_changes();

-- 9. Triggers para tabela clients
CREATE TRIGGER audit_clients_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_data_changes();

-- 10. Triggers para tabela contact_messages
CREATE TRIGGER audit_contact_messages_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_sensitive_data_changes();