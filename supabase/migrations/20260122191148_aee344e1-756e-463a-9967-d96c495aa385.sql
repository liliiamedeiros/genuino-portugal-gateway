-- Fix clients table SELECT policy to restrict editors to only see their assigned or unassigned clients
-- Admins and super_admins can still see all clients

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Admins editors and assigned users can view clients" ON public.clients;

-- Create a more restrictive SELECT policy
-- Editors: can only see clients assigned to them OR unassigned clients (assigned_to IS NULL)
-- Admins/Super Admins: can see all clients
CREATE POLICY "Role-based client visibility"
ON public.clients
FOR SELECT
USING (
  -- Super admins and admins can see all clients
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  -- Editors can only see clients assigned to them or unassigned clients
  (
    has_role(auth.uid(), 'editor'::app_role) AND 
    (assigned_to = auth.uid() OR assigned_to IS NULL)
  )
);