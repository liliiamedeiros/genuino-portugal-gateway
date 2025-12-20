-- Fix RLS policies for sensitive data tables

-- 1. Drop and recreate newsletter_subscribers SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins and editors can view subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- 2. Drop and recreate contact_messages SELECT policy (restrict to admin/super_admin only)
DROP POLICY IF EXISTS "Admins and editors can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages" 
ON public.contact_messages 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- 3. Drop and recreate appointments SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;
CREATE POLICY "Admins editors and assigned users can view appointments" 
ON public.appointments 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  auth.uid() = assigned_to
);

-- 4. Drop and recreate clients SELECT policy (already fixed but ensure consistency)
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clients;
CREATE POLICY "Admins editors and assigned users can view clients" 
ON public.clients 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'editor'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  auth.uid() = assigned_to
);