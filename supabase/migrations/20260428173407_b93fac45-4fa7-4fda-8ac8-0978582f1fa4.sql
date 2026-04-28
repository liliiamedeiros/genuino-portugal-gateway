
-- Revoke public/anon/authenticated EXECUTE on SECURITY DEFINER functions
-- These functions are either invoked by triggers (run as table owner) or by RLS
-- policies (RLS uses the function owner's privileges, not the caller's EXECUTE grant).
-- Removing EXECUTE from anon/authenticated prevents direct RPC abuse.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_sensitive_data_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_data_access(text, text, text, integer, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- Keep has_role callable by authenticated users (used in app code to check own role)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
